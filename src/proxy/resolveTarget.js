import { URL } from "url";

/**
 * Resolve o destino real do proxy explícito
 * @param {import("http").IncomingMessage} req
 * @return {URL}
 */
export function resolveTarget(req) {
  if (/^http[s]?:\/\//i.test(req.url)) {
    return new URL(req.url);
  }

  const host = req.headers.host;

  if (!host || host === "localhost") {
    throw new Error("Host inválido ou loop detectado");
  }

  return new URL(`http://${host}${req.url}`);
}
