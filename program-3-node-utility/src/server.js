// Basic HTTP server WITHOUT Express - uses Node's built-in http module
const http = require("http");
const { readDonors, createDonor, updateDonor, deleteDonor } = require("./utility");

const port = process.env.PORT || 3003;

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error("Invalid JSON body")); }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const match = url.pathname.match(/^\/donors(?:\/(\d+))?$/);
  try {
    if (!match) return send(res, 404, { error: "Route not found" });
    const id = match[1] ? Number(match[1]) : null;

    if (req.method === "GET" && !id) {
      const city = url.searchParams.get("city");
      const list = await readDonors();
      return send(res, 200, city ? list.filter((d) => d.city.toLowerCase() === city.toLowerCase()) : list);
    }
    if (req.method === "POST" && !id) return send(res, 201, await createDonor(await readBody(req)));
    if (req.method === "PUT" && id) {
      const updated = await updateDonor(id, await readBody(req));
      return updated ? send(res, 200, updated) : send(res, 404, { error: "Donor not found" });
    }
    if (req.method === "DELETE" && id)
      return (await deleteDonor(id)) ? send(res, 200, { message: "Donor deleted" }) : send(res, 404, { error: "Donor not found" });
    return send(res, 405, { error: "Method not allowed" });
  } catch (e) {
    send(res, 400, { error: e.message });
  }
});

server.listen(port, () => console.log(`Node utility API: http://localhost:${port}`));
