// src\proxy\minecraftProxy.js
import net from "net";
import { logTraffic } from "../utils/trafficLogger.js";

/**
 * Inicia um proxy TCP genérico (Minecraft-safe)
 * @param {Object} options
 * @param {number} options.listenPort Porta pública
 * @param {string} options.targetHost Host de destino
 * @param {number} options.targetPort Porta de destino
 * @return {void}
 */
export function startMinecraftProxy({ targetHost, targetPort }) {
  const server = net.createServer((clientSocket) => {
    const serverSocket = net.connect(targetPort, targetHost);

    // Encaminhamento bidirecional (NÃO altera payload)
    clientSocket.pipe(serverSocket);
    serverSocket.pipe(clientSocket);
    logTraffic({
          protocol: "TCP",
          clientIp: clientSocket.remoteAddress,
          targetHost,
          targetPort,
          note: "Nova conexão minecraft",
        });

    // Encerramento limpo
    clientSocket.on("close", () => serverSocket.destroy());
    serverSocket.on("close", () => clientSocket.destroy());

    clientSocket.on("error", () => serverSocket.destroy());
    serverSocket.on("error", () => clientSocket.destroy());
  });

  server.on("error", (err) => {
    console.error("[TCP PROXY] erro:", err.message);
  });

  server.listen(25565, () => {
    console.log(
      `[TCP MINE PROXY] ouvindo em 25565 → ${targetHost}:${targetPort}`,
    );
  });
}
