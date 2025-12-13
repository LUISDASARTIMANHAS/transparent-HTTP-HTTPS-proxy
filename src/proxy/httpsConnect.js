import net from "net";
import { log, error } from "../utils/logger.js";

/**
 * Handler HTTPS (CONNECT)
 * @param {import("http").IncomingMessage} req
 * @param {import("net").Socket} clientSocket
 * @param {Buffer} head
 * @return {void}
 */
export function handleConnect(req, clientSocket, head) {
	const [host, port] = req.url.split(":");

	log(`[CONNECT] ${host}:${port}`);

	const serverSocket = net.connect(port, host, () => {
		clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
		serverSocket.write(head);
		serverSocket.pipe(clientSocket);
		clientSocket.pipe(serverSocket);
	});

	serverSocket.on("error", () => {
		error(`[CONNECT ERRO] ${host}:${port}`);
		clientSocket.end("HTTP/1.1 502 Bad Gateway\r\n\r\n");
	});

	clientSocket.on("error", () => {
		serverSocket.end();
	});
}
