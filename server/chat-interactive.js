const http = require("http");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let knowledgeLevel = "beginner";
let messages = [];
let frustrationCount = 0;
let pageContext = null;

const PAGES = {
  "1": { pageName: "dashboard", pageTitle: "Dashboard" },
  "2": { pageName: "send-tokens", pageTitle: "Send Tokens" },
  "3": { pageName: "receive-tokens", pageTitle: "Receive Tokens" },
  "4": { pageName: "wallet-setup", pageTitle: "Wallet Setup" },
  "5": { pageName: "transaction-history", pageTitle: "Transaction History" },
};

function askAPI(callback) {
  const data = JSON.stringify({ knowledgeLevel, messages, frustrationCount, pageContext });

  const req = http.request(
    "http://localhost:3001/api/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    },
    (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => callback(JSON.parse(body)));
    }
  );
  req.write(data);
  req.end();
}

console.log("");
console.log("=== Plasma Coach - LearnPlasma ===");
console.log("");
console.log("Welcome! Before we start, how much do you know about stablecoins and crypto?");
console.log("");
console.log("  1 - I've never heard of stablecoins or cryptocurrency");
console.log("  2 - I've heard of it but never used it");
console.log("  3 - I've sent payments with stablecoins or crypto before");
console.log("");

rl.question("Type 1, 2, or 3: ", (answer) => {
  if (answer.trim() === "1") {
    knowledgeLevel = "beginner";
    console.log("\nNo worries, we'll start from the very beginning!");
  } else if (answer.trim() === "3") {
    knowledgeLevel = "experienced";
    console.log("\nGreat, you've got some experience already!");
  } else {
    knowledgeLevel = "intermediate";
    console.log("\nPerfect, we'll build on what you already know!");
  }

  choosePage();
});

function choosePage() {
  console.log("\nWhich page are you on?");
  console.log("");
  console.log("  1 - Dashboard");
  console.log("  2 - Send Tokens");
  console.log("  3 - Receive Tokens");
  console.log("  4 - Wallet Setup");
  console.log("  5 - Transaction History");
  console.log("");

  rl.question("Type 1-5: ", (answer) => {
    pageContext = PAGES[answer.trim()] || PAGES["1"];
    console.log("\nYou are on: " + pageContext.pageTitle);
    console.log('Ask me anything. Type "page" to switch pages, or "quit" to exit.\n');
    askQuestion();
  });
}

function askQuestion() {
  rl.question("You: ", (input) => {
    const trimmed = input.trim().toLowerCase();

    if (trimmed === "quit") {
      console.log("\nGoodbye!");
      rl.close();
      return;
    }

    if (trimmed === "page") {
      choosePage();
      return;
    }

    messages.push({ role: "user", content: input });

    askAPI((response) => {
      if (response.error) {
        console.log("\nError: " + response.error + "\n");
      } else {
        console.log("\nBot: " + response.reply + "\n");

        messages.push({ role: "assistant", content: response.reply });
        frustrationCount = response.frustrationCount;

        if (response.knowledgeLevel !== knowledgeLevel) {
          knowledgeLevel = response.knowledgeLevel;
        }

        if (response.reachedLimit) {
          console.log(">>> " + response.contactMessage + "\n");
        }
      }

      askQuestion();
    });
  });
}
