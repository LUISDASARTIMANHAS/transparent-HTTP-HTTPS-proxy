import http from "http";
import { handleProxy } from "./proxy/httpProxy.js";
import { handleConnect } from "./proxy/httpsConnect.js";
import { forwardOllama } from "./gateways/ollamaGateway.js";
import { log } from "./utils/logger.js";

/**
 * Inicia o servidor Proxy + Gateway
 * @param {number} port
 * @return {void}
 */
export function startServer(port = 8080) {
  const server = http.createServer((req, res) => {
    if (req.url.startsWith("/ollama")) {
      return forwardOllama(req, res);
    }

    return handleProxy(req, res);
  });

  server.on("connect", handleConnect);

  server.listen(port, () => {
    log(`Servidor rodando em http://localhost:${port}`);
  });
}
