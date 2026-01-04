// httpsConnect.js
import net from "net";
import dns from "dns";
import { logTraffic } from "../utils/trafficLogger.js";
import { error } from "../utils/logger.js";

/**
 * Handler HTTPS CONNECT com tratamento de erro
 * @param {import("http").IncomingMessage} req
 * @param {import("net").Socket} clientSocket
 * @param {Buffer} head
 * @return {void}
 */
export function handleConnect(req, clientSocket, head) {
  const [host, port] = req.url.split(":");

  logTraffic({
  protocol: "HTTPS",
  clientIp: clientSocket.remoteAddress,
  host,
  port,
  note: "TLS tunnel - payload criptografado (CONNECT)"
});

  dns.lookup(host, (err, address) => {
    if (err) {
      error(`[DNS] ${host} não resolvido`);
      clientSocket.write(
        "HTTP/1.1 502 Bad Gateway\r\n\r\n"
      );
      return clientSocket.destroy();
    }

    const serverSocket = net.connect(port, address);

    serverSocket.on("connect", () => {
      clientSocket.write(
        "HTTP/1.1 200 Connection Established\r\n\r\n"
      );
      if (head?.length) serverSocket.write(head);
      serverSocket.pipe(clientSocket);
      clientSocket.pipe(serverSocket);
    });

    serverSocket.on("error", (err) => {
      error(`[CONNECT ERRO] ${host}:${port} ${err.code}`);
      clientSocket.destroy();
    });

    clientSocket.on("error", () => {
      serverSocket.destroy();
    });
  });
}
