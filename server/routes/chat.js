const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CONTACT_EMAIL =
  process.env.PLASMA_PAY_CONTACT_EMAIL || "support@plasmapay.com";

const FRUSTRATION_THRESHOLD = 3;

const SYSTEM_PROMPTS = {
  "site-help": `You are a helpful customer support assistant for Plasma Pay, a stablecoin payments platform built on the Plasma blockchain.

You help users with practical issues related to using the Plasma Pay website, including:
- Login and account issues
- Sending and receiving payments
- Wallet connection problems
- Transaction status and history
- Settings and profile management

Keep your answers concise, friendly, and focused on solving the user's problem. If you are unsure about something specific to Plasma Pay's interface, say so honestly rather than guessing.

You MUST respond in valid JSON with exactly two fields:
- "reply": your helpful response to the user (string)
- "userFrustrated": true if the user seems frustrated, dissatisfied, or is not getting the help they need based on their latest message — false otherwise`,

  "concept-explanation": `You are a knowledgeable assistant for Plasma Pay, a stablecoin payments platform built on the Plasma blockchain.

You help users understand concepts related to the platform, including:
- What stablecoins are and how they work
- How blockchain payments work
- What wallets are and how to use them
- The Plasma blockchain and its benefits
- Gas fees and transaction costs
- Security best practices for crypto payments

Explain concepts clearly and simply, avoiding unnecessary jargon. Use analogies where helpful. Tailor your explanations to someone who may be new to crypto and blockchain.

You MUST respond in valid JSON with exactly two fields:
- "reply": your helpful response to the user (string)
- "userFrustrated": true if the user seems frustrated, dissatisfied, or is not getting the help they need based on their latest message — false otherwise`,
};

// POST /api/chat
router.post("/", async (req, res) => {
  try {
    const { category, messages, frustrationCount = 0 } = req.body;

    if (!category || !SYSTEM_PROMPTS[category]) {
      return res.status(400).json({
        error:
          'Invalid or missing category. Use "site-help" or "concept-explanation".',
      });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Messages array is required and must not be empty.",
      });
    }

    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPTS[category] },
      ...messages,
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: fullMessages,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    const reply = parsed.reply;
    const userFrustrated = parsed.userFrustrated === true;

    const newFrustrationCount = userFrustrated
      ? frustrationCount + 1
      : frustrationCount;
    const reachedLimit = newFrustrationCount >= FRUSTRATION_THRESHOLD;

    res.json({
      reply,
      userFrustrated,
      frustrationCount: newFrustrationCount,
      reachedLimit,
      ...(reachedLimit && {
        contactMessage: `It seems like we haven't been able to resolve your issue. Please reach out to our team directly at ${CONTACT_EMAIL} and we'll get this sorted for you.`,
      }),
    });
  } catch (error) {
    console.error("Chat API error:", error.message);

    if (error.status === 401) {
      return res.status(500).json({ error: "Invalid OpenAI API key." });
    }

    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

module.exports = router;
