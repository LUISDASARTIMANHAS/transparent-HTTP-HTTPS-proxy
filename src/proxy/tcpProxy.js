// src\proxy\tcpProxy.js
import net from "net";
import { logTraffic } from "../utils/trafficLogger.js";

/**
 * Inicia um proxy TCP para Minecraft
 * @param {Object} options
 * @param {number} options.listenPort Porta pública
 * @param {string} options.targetHost Servidor real
 * @param {number} options.targetPort Porta real
 * @return {void}
 */
export function startTcpProxy({ listenPort, targetHost, targetPort }) {
  const server = net.createServer((clientSocket) => {
    const serverSocket = net.connect(targetPort, targetHost);

    logTraffic({
      protocol: "TCP",
      clientIp: clientSocket.remoteAddress,
      targetHost,
      targetPort,
      note: "Nova conexão minecraft",
    });
    serverSocket.write("RNP Proxy\n");

    clientSocket.pipe(serverSocket);
    serverSocket.pipe(clientSocket);

    clientSocket.on("error", () => serverSocket.destroy());
    serverSocket.on("error", () => clientSocket.destroy());
  });

	server.on("end", () => {
      console.log("client disconnected");
    });

  server.listen(listenPort, () => {
    console.log(`Proxy Minecraft ativo na porta ${listenPort}`);
  });

}


