// proxy/httpProxy.js
import http from "http";
import dns from "dns";
import { resolveTarget } from "./resolveTarget.js";
import { logTraffic } from "../utils/trafficLogger.js";
import { error } from "../utils/logger.js";

/**
 * Proxy HTTP explícito com logging completo e proteção contra falhas
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @return {void}
 */
export function handleProxy(req, res) {
  let target;
  let reqBody = Buffer.alloc(0);

  try {
    target = resolveTarget(req);
  } catch (err) {
    error(`[HTTP] ${err.message}`);
    res.writeHead(400);
    return res.end("Bad Request");
  }

  // Captura body da request
  req.on("data", (chunk) => {
    reqBody = Buffer.concat([reqBody, chunk]);
  });

  // Resolve DNS manualmente (prioriza IPv4)
  dns.lookup(target.hostname, { family: 4 }, (dnsErr, address) => {
    if (dnsErr) {
      error(`[DNS HTTP] ${target.hostname} não resolvido`);
      res.writeHead(502);
      return res.end("Bad Gateway");
    }

    const proxyReq = http.request(
      {
        host: address,
        port: target.port || 80,
        path: target.pathname + target.search,
        method: req.method,
        headers: {
          ...req.headers,
          host: target.host,
        },
        timeout: 10_000, // 10 segundos
      },
      (proxyRes) => {
        let resBody = Buffer.alloc(0);

        proxyRes.on("data", (chunk) => {
          resBody = Buffer.concat([resBody, chunk]);
        });

        proxyRes.on("end", () => {
          logTraffic({
            protocol: "HTTP",
            clientIp: req.socket.remoteAddress,
            method: req.method,
            url: req.url,
            userAgent: req.headers["user-agent"],
            requestHeaders: req.headers,
            requestBody: reqBody.toString(),
            statusCode: proxyRes.statusCode,
            responseHeaders: proxyRes.headers,
            responseBody: resBody.toString(),
          });
        });

        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    // 🔴 ERRO DE CONEXÃO / TIMEOUT / RESET
    proxyReq.on("error", (err) => {
      error(`[HTTP PROXY] ${err.code || err.message}`);
      if (!res.headersSent) {
        res.writeHead(504);
      }
      res.end();
    });

    // 🔴 TIMEOUT EXPLÍCITO
    proxyReq.on("timeout", () => {
      error("[HTTP PROXY] TIMEOUT");
      proxyReq.destroy();
      if (!res.headersSent) {
        res.writeHead(504);
        res.end();
      }
    });

    // 🔴 CLIENTE FECHOU CONEXÃO
    req.on("aborted", () => {
      proxyReq.destroy();
    });

    req.pipe(proxyReq);
  });
}
