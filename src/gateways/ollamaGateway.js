import http from "http";
import { log, error } from "../utils/logger.js";

const OLLAMA_BASE = "http://192.168.6.2:11434";
const DEBUG_BODY = true;

/**
 * Lê o body completo da requisição
 * @param {import("http").IncomingMessage} req
 * @return {Promise<Buffer>}
 */
function readRequestBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
}


/**
 * Gateway explícito para o Ollama com logging completo
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @return {Promise<void>}
 */
export async function forwardOllama(req, res) {
  const start = Date.now();

  const rawPath = req.url.replace("/ollama", "");

  const target = new URL(rawPath, OLLAMA_BASE);

  log(`[OLLAMA] ${req.method} ${target.pathname}`);

  // ---------------- REQUEST BODY ----------------
  const bodyBuffer = await readRequestBody(req);

  if (DEBUG_BODY && bodyBuffer.length > 0) {
    try {
      log("[OLLAMA REQ BODY]");
      log(bodyBuffer.toString());
    } catch {}
  }

  const forwardReq = http.request(
    {
      hostname: target.hostname,
      port: target.port,
      path: target.pathname + target.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: target.host,
        "content-length": bodyBuffer.length
      }
    },
    (forwardRes) => {
      let bytes = 0;

      res.writeHead(forwardRes.statusCode, forwardRes.headers);

      // ---------------- RESPONSE STREAM ----------------
      forwardRes.on("data", (chunk) => {
        bytes += chunk.length;

        if (DEBUG_BODY) {
          try {
            log("[OLLAMA STREAM]");
            log(chunk.toString());
          } catch {}
        }

        res.write(chunk);
      });

      forwardRes.on("end", () => {
        res.end();
        log(
          `[OLLAMA OK] ${forwardRes.statusCode} | ${bytes} bytes | ${
            Date.now() - start
          }ms`
        );
      });
    }
  );

  forwardReq.on("error", (err) => {
    error(`[OLLAMA ERRO] ${err.message}`);
    res.writeHead(502);
    res.end("Bad Gateway");
  });

  // ---------------- ENVIA BODY ----------------
  if (bodyBuffer.length > 0) {
    forwardReq.write(bodyBuffer);
  }

  forwardReq.end();
}
