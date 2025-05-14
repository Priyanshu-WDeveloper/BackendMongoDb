const http = require("http");
const fs = require("fs");
http
  .createServer((req, res) => {
    res.writeHead(200, { "content-type": "text/html" });
    const data = fs.readFileSync("./views/index.html");
    res.end(data);
  })
  .listen(9000, () => {
    console.log(`http://localhost:9000/`);
  });
