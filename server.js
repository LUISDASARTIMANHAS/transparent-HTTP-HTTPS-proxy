/**
 * Proxy HTTP + HTTPS (CONNECT) completo com logs.
 * @description Loga requisições HTTP, túneis HTTPS, status, tempo e bytes trafegados.
 */

import http from "http";
import net from "net";
import { URL } from "url";

/**
 * Inicia o proxy HTTP/HTTPS.
 * @param {number} port Porta do proxy
 * @return {void}
 */
function startProxy(port = 8080) {
  const server = http.createServer((req, res) => {
    const start = Date.now();
    let targetUrl;

    if (/^http[s]?:\/\//i.test(req.url)) {
      targetUrl = req.url;
    } else {
      targetUrl = `http://${req.headers.host}${req.url}`;
    }

    let target;
    try {
      target = new URL(targetUrl);
    } catch {
      console.log(`[ERRO] URL inválida: ${req.url}`);
      res.writeHead(400);
      return res.end("Invalid URL");
    }

    console.log(
      `[HTTP] ${req.method} → ${target.hostname}${target.pathname}${target.search}`
    );

    const options = {
      hostname: target.hostname,
      port: target.port || 80,
      path: target.pathname + target.search,
      method: req.method,
      headers: req.headers
    };

    const proxyReq = http.request(options, (proxyRes) => {
      let bytes = 0;

      proxyRes.on("data", (chunk) => {
        bytes += chunk.length;
      });

      proxyRes.on("end", () => {
        const ms = Date.now() - start;
        console.log(
          `[HTTP RESPOSTA] ${target.hostname} | Status: ${
            proxyRes.statusCode
          } | ${bytes} bytes | ${ms}ms`
        );
      });

      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    req.pipe(proxyReq);

    proxyReq.on("error", (err) => {
      console.log(`[ERRO HTTP] ${target.hostname}: ${err.message}`);
      res.writeHead(500);
      res.end("Proxy error: " + err.message);
    });
  });

  // ------------------------------------------------------------
  // HTTPS (CONNECT)
  // ------------------------------------------------------------
  server.on("connect", (req, clientSocket, head) => {
    const start = Date.now();
    const [host, port] = req.url.split(":");

    console.log(`[CONNECT] HTTPS solicitado → ${host}:${port}`);

    const serverSocket = net.connect(port, host, () => {
      clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
      serverSocket.write(head);

      serverSocket.pipe(clientSocket);
      clientSocket.pipe(serverSocket);
    });

    serverSocket.on("end", () => {
      const ms = Date.now() - start;
      console.log(`[CONNECT ENCERRADO] ${host}:${port} | ${ms}ms`);
    });

    serverSocket.on("error", () => {
      console.log(`[ERRO CONNECT] Falha ao conectar em ${host}:${port}`);
      clientSocket.end("HTTP/1.1 500 Connection Error\r\n\r\n");
    });

    clientSocket.on("error", () => {
      serverSocket.end();
    });
  });

  server.listen(port, () => {
    console.log(`Proxy HTTP/HTTPS rodando em http://localhost:${port}`);
  });
}

startProxy(8080);