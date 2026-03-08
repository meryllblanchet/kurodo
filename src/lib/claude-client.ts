import Anthropic from "@anthropic-ai/sdk";
import { Language, JLPTLevel, GeneratedContent, CorrectionFeedback, KanjiVocab } from "./types";
import { languageNames } from "./languages";
import { buildPrompt, buildCorrectionPrompt } from "./prompts";

function createClient(apiKey: string) {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

function extractText(message: Anthropic.Message): string {
  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }
  return textBlock.text;
}

export async function generateStudySession(
  apiKey: string,
  lang: Language,
  level: JLPTLevel,
): Promise<GeneratedContent> {
  const client = createClient(apiKey);
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: buildPrompt(lang, level) }],
  });
  return JSON.parse(extractText(message));
}

export async function correctTranslation(
  apiKey: string,
  lang: Language,
  level: JLPTLevel,
  originalText: string,
  userTranslation: string,
): Promise<CorrectionFeedback> {
  const client = createClient(apiKey);
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: buildCorrectionPrompt(lang, level, originalText, userTranslation),
      },
    ],
  });
  return JSON.parse(extractText(message));
}

export async function loadKanjiVocabulary(
  apiKey: string,
  lang: Language,
  level: JLPTLevel,
  kanji: string,
): Promise<KanjiVocab[]> {
  const languageName = languageNames[lang];
  const levelUpper = level.toUpperCase();
  const client = createClient(apiKey);

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an expert Japanese language teacher. Provide 5 vocabulary words using the kanji "${kanji}" for a JLPT ${levelUpper} student whose native language is ${languageName}.

Respond with a JSON object:
{
  "vocabulary": [
    { "word": "<word using this kanji>", "reading": "<full reading in hiragana>", "meaning": "<meaning in ${languageName}>" }
  ]
}

Rules:
- Provide exactly 5 vocabulary items
- Vocabulary should be appropriate for JLPT ${levelUpper} level or slightly below
- All meanings must be in ${languageName}
- Respond with ONLY the JSON object. No markdown, no code fences, no extra text.`,
      },
    ],
  });

  const data = JSON.parse(extractText(message));
  return data.vocabulary;
}
