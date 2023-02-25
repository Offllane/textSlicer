const http = require('http');

const server = http.createServer((req, res) => {
  console.log(res);
  res.setHeader("UserId", 12);
  res.setHeader("Content-Type", "text/html; charset=utf-8;");
  res.write("<h2>hello world 222</h2>");
  res.end();
})

server.listen(3000);