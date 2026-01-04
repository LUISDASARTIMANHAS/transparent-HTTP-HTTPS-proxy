import fs from "fs";

/**
 * Loga dados de tráfego HTTP
 * @param {object} data
 * @return {void}
 */
export function logTraffic(data) {
  const line =
    JSON.stringify({
      time: new Date().toISOString(),
      ...data,
    }) + "\n";

  fs.appendFile("traffic.log", line, () => {});
  console.log(line);
}
