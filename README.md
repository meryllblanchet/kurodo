# Kurodo (黒道)

AI-powered Japanese learning app for JLPT preparation. Kurodo is the Japanese pronunciation of "Claude", and can also mean "black path" (黒 kuro = black, 道 do = path).

## Features

### Study Sessions
Generate on-demand study material tailored to your JLPT level (N5–N1):
- **Kanji of the Day** — a kanji with onyomi, kunyomi, meaning, and 5 vocabulary words
- **Grammar of the Day** — a concise grammar lesson with structure explanation and 5 examples
- **Exercises** — 4 types of practice:
  - Fill in the blank (multiple choice)
  - Japanese → your language translation (multiple choice)
  - Your language → Japanese translation (free text, corrected by AI with scoring and feedback)
  - Kanji meaning (multiple choice)

### Kanji Dictionary
Browse all 2,211 JLPT kanji organized by level with instant search:
- Search by kanji character, reading (onyomi/kunyomi), or meaning in your language
- View readings, meanings, and stroke count — all offline, no API calls
- Optionally load AI-generated vocabulary examples for any kanji

### Multilingual
Full localization in 6 languages:
- English, French, German, Italian, Spanish, Portuguese
- All UI text, kanji meanings, exercise content, and AI feedback in your selected language

### User Profile
- Language and JLPT level preferences persisted in local storage
- Switch anytime via the profile modal

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Claude API** via `@anthropic-ai/sdk` for content generation
- Static kanji dictionary (260 KB) sourced from [davidluzgouveia/kanji-data](https://github.com/davidluzgouveia/kanji-data)
- Pre-generated meaning translations for all supported languages (479 KB)

## Getting Started

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
# Install dependencies
npm install

# Set your API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Regenerating Translations

If you modify the kanji dataset, regenerate the meaning translations:

```bash
npx tsx scripts/generate-translations.ts
```

This calls the Claude API to translate all kanji meanings into the 5 non-English languages (~130 API calls).

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Language selection (home)
│   ├── [lang]/page.tsx           # JLPT level selection
│   ├── [lang]/[level]/page.tsx   # Main study page
│   └── api/
│       ├── generate/route.ts     # Study session generation
│       ├── correct/route.ts      # Translation exercise correction
│       └── kanji-detail/route.ts # Vocabulary examples for a kanji
├── components/                   # UI components
├── hooks/                        # useGenerate, useProfile
└── lib/
    ├── kanji-data.ts             # Static kanji dictionary (2,211 entries)
    ├── kanji-translations.ts     # Localized meanings (5 languages)
    ├── languages.ts              # UI strings & localization
    ├── prompts.ts                # Claude prompt templates
    ├── translate-meaning.ts      # Translation helper
    └── types.ts                  # TypeScript interfaces
```

## License

MIT — see [LICENSE](LICENSE).

Kanji data derived from [davidluzgouveia/kanji-data](https://github.com/davidluzgouveia/kanji-data) (MIT) — see [LICENSES/kanji-data.txt](LICENSES/kanji-data.txt).
