import { startMinecraftProxy } from "./src/proxy/minecraftProxy.js";
import { startTcpProxy } from "./src/proxy/tcpProxy.js";
import { startServer } from "./src/server.js";

// startServer(8080);
/**
 * Inicializa o proxy Minecraft
 */
startMinecraftProxy({
  targetHost: "mc.skyzermc.com.br",
  targetPort: 25652
});