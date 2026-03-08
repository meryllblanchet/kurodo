import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import Anthropic from "@anthropic-ai/sdk";
import { jlptKanji } from "../src/lib/kanji-data";
import * as fs from "fs";
import * as path from "path";

const LANGUAGES = {
  fr: "French",
  de: "German",
  it: "Italian",
  es: "Spanish",
  pt: "Portuguese",
} as const;

const BATCH_SIZE = 200;
const CACHE_PATH = path.join(__dirname, ".translation-cache.json");

function extractJSON(text: string): string {
  // Strip markdown fences if present
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) return match[1].trim();
  return text.trim();
}

function loadCache(): Record<string, Record<string, string>> {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
    }
  } catch {}
  return {};
}

function saveCache(translations: Record<string, Record<string, string>>) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(translations), "utf-8");
}

async function main() {
  const anthropic = new Anthropic();

  // Collect all unique meanings
  const allMeanings = new Set<string>();
  for (const entries of Object.values(jlptKanji)) {
    for (const e of entries) {
      for (const m of e.m) allMeanings.add(m);
    }
  }

  const meaningsList = [...allMeanings].sort();
  console.log(`Total unique meanings: ${meaningsList.length}`);

  // Load cache for resume support
  const translations = loadCache();
  console.log(`Cached translations: ${Object.keys(translations).length} entries`);

  for (const [langCode, langName] of Object.entries(LANGUAGES)) {
    // Check how many are already done for this language
    const missing = meaningsList.filter((m) => !translations[m]?.[langCode]);
    if (missing.length === 0) {
      console.log(`\n${langName} (${langCode}): already complete, skipping`);
      continue;
    }

    console.log(`\nTranslating to ${langName} (${langCode})... ${missing.length} remaining`);
    const batches = [];
    for (let i = 0; i < missing.length; i += BATCH_SIZE) {
      batches.push(missing.slice(i, i + BATCH_SIZE));
    }

    let done = 0;
    for (const batch of batches) {
      const numbered = batch.map((m, i) => `${i + 1}. ${m}`).join("\n");

      try {
        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: `Translate each of the following English words/phrases into ${langName}. These are meanings of Japanese kanji characters, so keep translations concise (1-3 words when possible).

Return ONLY a JSON array of strings with the translations in the same order. No markdown, no code fences, no numbering.

${numbered}`,
            },
          ],
        });

        const textBlock = message.content.find((b) => b.type === "text");
        if (!textBlock || textBlock.type !== "text") {
          throw new Error("No text response");
        }

        const jsonStr = extractJSON(textBlock.text);
        const parsed: string[] = JSON.parse(jsonStr);

        if (parsed.length !== batch.length) {
          console.warn(
            `  Warning: expected ${batch.length}, got ${parsed.length}`,
          );
        }

        for (let i = 0; i < batch.length && i < parsed.length; i++) {
          if (!translations[batch[i]]) translations[batch[i]] = {};
          translations[batch[i]][langCode] = parsed[i];
        }
      } catch (err) {
        console.error(
          `  Error in batch: ${err instanceof Error ? err.message : err}`,
        );
        console.log("  Saving cache and continuing...");
      }

      done += batch.length;
      console.log(
        `  ${langCode}: ${done}/${missing.length} (${batches.indexOf(batch) + 1}/${batches.length})`,
      );

      // Save cache after each batch
      saveCache(translations);
    }
  }

  // Write final output file
  const outPath = path.join(
    __dirname,
    "..",
    "src",
    "lib",
    "kanji-translations.ts",
  );

  let content = "// Auto-generated kanji meaning translations\n";
  content += "// Maps English meanings to translations in other languages\n\n";
  content +=
    "export const kanjiTranslations: Record<string, Record<string, string>> = ";
  content += JSON.stringify(translations, null, 0);
  content += ";\n";

  fs.writeFileSync(outPath, content, "utf-8");

  const size = Buffer.byteLength(content, "utf-8");
  console.log(
    `\nDone! Written to ${outPath} (${(size / 1024).toFixed(1)} KB)`,
  );
  console.log(`Translations: ${Object.keys(translations).length} entries`);

  // Clean up cache
  fs.unlinkSync(CACHE_PATH);
  console.log("Cache cleaned up.");
}

main().catch(console.error);
