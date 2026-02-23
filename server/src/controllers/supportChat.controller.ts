import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

// @openrouter/sdk is ESM-only; use dynamic import so it works when server is compiled to CommonJS

const CHAT_BOT_API_KEY = process.env.CHAT_BOT_API_KEY;
const CHAT_BOT_MODEL = process.env.CHAT_BOT_MODEL || "openai/gpt-4o-mini";
const SITE_URL = process.env.CLIENT_URL || process.env.FRONTEND_URL || "https://crownbankers.com";
const SITE_NAME = "Crown Bankers";

let rulebookCache: string | null = null;

function getRulebookContent(): string {
  if (rulebookCache) return rulebookCache;
  try {
    const rulebookPath = path.join(__dirname, "../../RULEBOOK.md");
    if (fs.existsSync(rulebookPath)) {
      rulebookCache = fs.readFileSync(rulebookPath, "utf-8");
      return rulebookCache;
    }
  } catch (err) {
    console.warn("[SupportChat] Could not read RULEBOOK.md:", (err as Error).message);
  }
  return "Platform rule book could not be loaded. Answer based on general Crown Bankers binary MLM, ROI, referral, and binary bonus knowledge.";
}

const SYSTEM_PROMPT = `You are a helpful AI support assistant for Crown Bankers. Crown Bankers is a solar investment system that provides massive returns based on investors' network (binary MLM with ROI, referral bonuses, and binary matching bonuses). You answer questions using the following official rule book. Be concise, accurate, and friendly. If the answer is not in the rule book, say so and suggest contacting support or checking the dashboard. Do not make up rules or percentages. Use the rule book below.

--- RULE BOOK ---

`;

/**
 * POST /api/v1/support/chat
 * Body: { messages: Array<{ role: "user" | "assistant" | "system"; content: string }> }
 * Returns: { message: string }
 */
export const supportChat = asyncHandler(async (req: Request, res: Response) => {
  const apiKey = CHAT_BOT_API_KEY;
  if (!apiKey) {
    throw new AppError("Chat support is not configured (CHAT_BOT_API_KEY missing)", 503);
  }

  const body = req.body as { messages?: Array<{ role: string; content: string }> };
  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new AppError("messages array is required and must not be empty", 400);
  }

  const rulebook = getRulebookContent();
  const systemContent = SYSTEM_PROMPT + rulebook;

  const { OpenRouter } = await import("@openrouter/sdk");
  const openRouter = new OpenRouter({
    apiKey,
    httpReferer: SITE_URL,
    xTitle: SITE_NAME,
  });

  const allMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemContent },
    ...messages
      .filter((m) => m && typeof m.content === "string")
      .map((m) => ({
        role: (m.role === "assistant" || m.role === "user" ? m.role : "user") as "user" | "assistant",
        content: m.content,
      })),
  ];

  const completion = await openRouter.chat.send({
    httpReferer: SITE_URL,
    xTitle: SITE_NAME,
    chatGenerationParams: {
      model: CHAT_BOT_MODEL,
      messages: allMessages,
      stream: false,
    },
  }) as { choices?: Array<{ message?: { content?: string | unknown } }> };

  const choice = completion?.choices?.[0];
  let content = choice?.message?.content;
  if (Array.isArray(content)) {
    content = content.map((c: any) => (typeof c === "string" ? c : c?.text ?? "")).join("");
  }
  const reply = typeof content === "string" ? content : "I couldn't generate a reply. Please try again.";

  (res as any).status(200).json({
    status: "success",
    data: { message: reply },
  });
});
