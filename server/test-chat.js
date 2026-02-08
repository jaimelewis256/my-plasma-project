const http = require("http");

const data = JSON.stringify({
  category: "concept-explanation",
  messages: [{ role: "user", content: "What is a stablecoin?" }],
  frustrationCount: 0,
});

const req = http.request(
  "http://localhost:3001/api/chat",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  },
  (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      console.log(JSON.stringify(JSON.parse(body), null, 2));
    });
  }
);

req.write(data);
req.end();
