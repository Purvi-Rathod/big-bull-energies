import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

const CHAT_BOT_MODEL = process.env.CHAT_BOT_MODEL || "openai/gpt-4o-mini";
const SITE_URL =
  process.env.CLIENT_URL ||
  process.env.FRONTEND_URL ||
  "https://crownbankers.com";
const SITE_NAME = "Big Bull Energies";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const SUPPORT_WHATSAPP =
  process.env.SUPPORT_PHONE?.trim() ||
  process.env.CONTACT_PHONE_DISPLAY?.trim() ||
  "+44 7452 321003";
const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL?.trim() ||
  process.env.ELASTIC_FROM_EMAIL?.trim() ||
  process.env.email?.trim() ||
  "bigbullenergies@gmail.com";

let rulebookCache: string | null = null;
let faqCache: string | null = null;
let faqEntriesCache: FaqEntry[] | null = null;

type ChatRole = "system" | "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };
type FaqEntry = { question: string; answer: string; tokens: Set<string> };

function getChatBotApiKey(): string | undefined {
  const key =
    process.env.CHAT_BOT_API_KEY?.trim() ||
    process.env.OPENROUTER_API_KEY?.trim();
  return key || undefined;
}

function getRulebookContent(): string {
  if (rulebookCache) return rulebookCache;
  try {
    const rulebookPath = path.join(__dirname, "../../RULEBOOK.md");
    if (fs.existsSync(rulebookPath)) {
      rulebookCache = fs.readFileSync(rulebookPath, "utf-8");
      return rulebookCache;
    }
  } catch (err) {
    console.warn(
      "[SupportChat] Could not read RULEBOOK.md:",
      (err as Error).message,
    );
  }
  return "Platform rule book could not be loaded. Answer based on general Big Bull Energies binary MLM, ROI, referral, and binary bonus knowledge.";
}

function getFaqContent(): string {
  if (faqCache) return faqCache;
  try {
    const faqPath = path.join(__dirname, "../../FAQ_KNOWLEDGEBASE.md");
    if (fs.existsSync(faqPath)) {
      faqCache = fs.readFileSync(faqPath, "utf-8");
      return faqCache;
    }
  } catch (err) {
    console.warn(
      "[SupportChat] Could not read FAQ_KNOWLEDGEBASE.md:",
      (err as Error).message,
    );
  }
  return "";
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "to",
  "of",
  "in",
  "on",
  "for",
  "and",
  "or",
  "but",
  "with",
  "by",
  "from",
  "at",
  "as",
  "it",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "we",
  "they",
  "me",
  "my",
  "your",
  "our",
  "their",
  "do",
  "does",
  "did",
  "can",
  "could",
  "will",
  "would",
  "should",
  "how",
  "what",
  "when",
  "where",
  "why",
  "who",
  "which",
  "about",
  "any",
  "please",
  "tell",
  "give",
  "need",
  "want",
  "know",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9$\s%-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function parseFaqEntries(faqMarkdown: string): FaqEntry[] {
  if (faqEntriesCache) return faqEntriesCache;
  const entries: FaqEntry[] = [];
  const blocks = faqMarkdown.split(/\n(?=\*\*\d+\.\s)/);
  for (const block of blocks) {
    const match = block.match(
      /^\*\*\d+\.\s*([^*]+)\*\*\s*\n+([\s\S]*?)(?=\n---|\n##|$)/,
    );
    if (!match) continue;
    const question = match[1].trim();
    const answer = match[2].trim().replace(/\n+/g, " ");
    if (!question || !answer) continue;
    entries.push({
      question,
      answer,
      tokens: new Set(tokenize(`${question} ${answer}`)),
    });
  }
  faqEntriesCache = entries;
  return entries;
}

function scoreFaqMatch(queryTokens: string[], entry: FaqEntry): number {
  if (queryTokens.length === 0) return 0;
  let overlap = 0;
  for (const token of queryTokens) {
    if (entry.tokens.has(token)) overlap += 1;
  }
  const questionTokens = tokenize(entry.question);
  let questionHits = 0;
  for (const token of queryTokens) {
    if (questionTokens.includes(token)) questionHits += 1;
  }
  return overlap + questionHits * 2;
}

function isGreeting(text: string): boolean {
  return /^(hi|hello|hey|hola|namaste|good\s*(morning|afternoon|evening)|howdy)[\s!.?]*$/i.test(
    text.trim(),
  );
}

function answerFromKnowledgeBase(userText: string): string {
  if (isGreeting(userText)) {
    return `Hi! I'm the Big Bull Energies support assistant. Ask me about investments, ROI, referral bonuses, binary income, vouchers, withdrawals, packages, or anything in our platform rules. For live help, WhatsApp ${SUPPORT_WHATSAPP} or email ${SUPPORT_EMAIL}.`;
  }

  const faq = getFaqContent();
  const entries = parseFaqEntries(faq);
  const queryTokens = tokenize(userText);

  if (entries.length === 0 || queryTokens.length === 0) {
    return `I couldn't find a matching answer in our knowledge base. Please contact support on WhatsApp ${SUPPORT_WHATSAPP}, email ${SUPPORT_EMAIL}, or open a ticket from your dashboard.`;
  }

  let best: FaqEntry | null = null;
  let bestScore = 0;
  for (const entry of entries) {
    const score = scoreFaqMatch(queryTokens, entry);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  // Require a modest match so we don't invent answers from weak overlaps
  const minScore = Math.max(2, Math.ceil(queryTokens.length * 0.35));
  if (!best || bestScore < minScore) {
    return `I don't have a clear answer for that in our FAQ. Try asking about packages, ROI, referrals, binary income, withdrawals, or career rewards — or contact support on WhatsApp ${SUPPORT_WHATSAPP} or email ${SUPPORT_EMAIL}.`;
  }

  return best.answer;
}

const SYSTEM_PROMPT = `You are a helpful AI support assistant for Big Bull Energies. Big Bull Energies is a wind-focused renewable energy platform with structured investor participation (binary MLM with ROI, referral bonuses, and binary matching bonuses). Answer questions using the official FAQ and rule book below. Prefer FAQ answers for company info, packages, ROI, referral, binary, withdrawals, support, and security. Use the rule book for detailed platform rules and calculations. Be concise, accurate, and friendly. If the answer is not in the FAQ or rule book, say so and suggest contacting support (WhatsApp ${SUPPORT_WHATSAPP} or email ${SUPPORT_EMAIL}) or checking the dashboard. Do not make up rules or percentages.

--- OFFICIAL FAQ (Big Bull Energies – FAQ for Chatbot) ---

`;

const RULEBOOK_HEADER = `

--- RULE BOOK (detailed platform rules) ---

`;

async function callOpenRouter(
  apiKey: string,
  messages: ChatMessage[],
): Promise<string> {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": SITE_URL,
      "X-Title": SITE_NAME,
    },
    body: JSON.stringify({
      model: CHAT_BOT_MODEL,
      messages,
      stream: false,
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
  } | null;

  if (!response.ok) {
    const detail = payload?.error?.message || response.statusText;
    throw new Error(`OpenRouter error (${response.status}): ${detail}`);
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) {
    return content
      .map((c) => (typeof c === "string" ? c : c?.text || ""))
      .join("")
      .trim();
  }
  if (typeof content === "string" && content.trim()) {
    return content.trim();
  }
  throw new Error("OpenRouter returned an empty response");
}

/**
 * POST /api/v1/support/chat
 * Body: { messages: Array<{ role: "user" | "assistant" | "system"; content: string }> }
 * Returns: { message: string }
 */
export const supportChat = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as {
    messages?: Array<{ role: string; content: string }>;
  };
  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new AppError("messages array is required and must not be empty", 400);
  }

  const normalized = messages
    .filter((m) => m && typeof m.content === "string" && m.content.trim())
    .map((m) => ({
      role: (m.role === "assistant" || m.role === "user"
        ? m.role
        : "user") as "user" | "assistant",
      content: m.content.trim(),
    }));

  if (normalized.length === 0) {
    throw new AppError("messages array is required and must not be empty", 400);
  }

  const latestUser =
    [...normalized].reverse().find((m) => m.role === "user")?.content || "";

  const apiKey = getChatBotApiKey();

  // Prefer live AI when configured; otherwise answer from local FAQ knowledge base
  if (apiKey) {
    try {
      const faq = getFaqContent();
      const rulebook = getRulebookContent();
      const systemContent = SYSTEM_PROMPT + faq + RULEBOOK_HEADER + rulebook;
      const allMessages: ChatMessage[] = [
        { role: "system", content: systemContent },
        ...normalized,
      ];
      const reply = await callOpenRouter(apiKey, allMessages);
      return (res as any).status(200).json({
        status: "success",
        data: { message: reply },
      });
    } catch (err) {
      console.error(
        "[SupportChat] OpenRouter failed, falling back to FAQ:",
        (err as Error).message,
      );
    }
  } else {
    console.warn(
      "[SupportChat] CHAT_BOT_API_KEY / OPENROUTER_API_KEY not set — using FAQ knowledge base",
    );
  }

  const reply = answerFromKnowledgeBase(latestUser);
  return (res as any).status(200).json({
    status: "success",
    data: { message: reply },
  });
});
