import { startMinecraftProxy } from "./src/proxy/tcpProxy.js";
import { startServer } from "./src/server.js";

// startServer(8080);
/**
 * Inicializa o proxy Minecraft
 */
startMinecraftProxy({
  listenPort: 25565,
  targetHost: "mc.skyzermc.com.br",
  targetPort: 25652
});