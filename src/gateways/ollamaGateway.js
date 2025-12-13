import http from "http";
import { log, error } from "../utils/logger.js";

const OLLAMA_BASE = "http://192.168.6.2:11434";

/**
 * Gateway explícito para Ollama
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @return {void}
 */
export function forwardOllama(req, res) {
  const start = Date.now();

  const target = new URL(req.url.replace("/ollama", ""), OLLAMA_BASE);

  log(`[OLLAMA] ${req.method} ${target.href}`);

  const forwardReq = http.request(
    {
      hostname: target.hostname,
      port: target.port,
      path: target.pathname + target.search,
      method: req.method,
      headers: req.headers
    },
    (forwardRes) => {
      let bytes = 0;

      forwardRes.on("data", (chunk) => (bytes += chunk.length));
      forwardRes.on("end", () => {
        log(
          `[OLLAMA OK] ${forwardRes.statusCode} | ${bytes} bytes | ${
            Date.now() - start
          }ms`
        );
      });

      res.writeHead(forwardRes.statusCode, forwardRes.headers);
      forwardRes.pipe(res);
    }
  );

  req.pipe(forwardReq);

  forwardReq.on("error", (err) => {
    error(`[OLLAMA ERRO] ${err.message}`);
    res.writeHead(502);
    res.end("Bad Gateway");
  });
}
