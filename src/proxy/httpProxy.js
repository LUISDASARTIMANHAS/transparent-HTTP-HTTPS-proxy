import http from "http";
import { resolveTarget } from "./resolveTarget.js";
import { log, error } from "../utils/logger.js";

/**
 * Proxy HTTP explícito
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @return {void}
 */
export function handleProxy(req, res) {
	let target;

	try {
		target = resolveTarget(req);
	} catch (err) {
		error(`[PROXY] ${err.message}`);
		res.writeHead(400);
		return res.end("Bad Request");
	}

	log(`[PROXY] ${req.method} → ${target.hostname}${target.pathname}`);

	const headers = { ...req.headers };
	headers.host = target.host;
	delete headers["proxy-connection"];
	delete headers["connection"];

	const proxyReq = http.request(
		{
			hostname: target.hostname,
			port: target.port || 80,
			path: target.pathname + target.search,
			method: req.method,
			headers
		},
		(proxyRes) => {
			res.writeHead(proxyRes.statusCode, proxyRes.headers);
			proxyRes.pipe(res);
		}
	);

	req.pipe(proxyReq);

	proxyReq.on("error", (err) => {
		error(`[PROXY ERRO] ${err.message}`);
		res.writeHead(502);
		res.end("Bad Gateway");
	});
}
