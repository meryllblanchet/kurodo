# Kurodo (黒道)

AI-powered Japanese learning app for JLPT preparation. Kurodo is the Japanese pronunciation of "Claude", and can also mean "black path" (黒 kuro = black, 道 do = path).

**Live demo:** [meryllblanchet.github.io/kurodo](https://meryllblanchet.github.io/kurodo/)

## Features

### Study Sessions
Generate on-demand study material tailored to your JLPT level (N5–N1) with 6 configurable sections:

- **漢 Kanji** — a kanji with onyomi, kunyomi, meaning, and 5 vocabulary words
- **文 Grammar** — a concise grammar lesson with structure explanation and 5 examples
- **書 Writing** — 4 types of exercises:
  - Fill in the blank (particles, verb forms, grammar)
  - Japanese → your language translation (MCQ)
  - Your language → Japanese translation (free text, corrected by AI with scoring and detailed feedback)
  - Kanji meaning (MCQ)
- **読 Reading** — a JLPT-level-appropriate passage with furigana toggle, translation, key vocabulary, and 3 comprehension questions
- **聴 Listening** — a dialogue between 2 speakers played via browser TTS with distinct voices, speed control (slow/normal/fast), per-line replay, transcript toggle, vocabulary, and comprehension questions
- **話 Speaking** — 5 pronunciation prompts with "Listen" (TTS), furigana toggle, and speech recognition scoring via the Web Speech API

### Session History
All generated sessions are saved automatically. Browse, review, or delete past lessons from the History tab. Clear all history and reset progress anytime.

### Progress Tracking
Tracks kanji and grammar coverage per JLPT level. When all items are covered, suggests starting over or advancing to the next level.

### Kanji Dictionary
Browse all 2,211 JLPT kanji organized by level with instant search:
- Search by kanji character, reading (onyomi/kunyomi), or meaning
- View readings, meanings, and stroke count — all offline, no API calls
- Optionally load AI-generated vocabulary examples for any kanji

### Onboarding & Profile
- First-time setup modal for API key, language, level, and section preferences
- Toggle which sections to include in generated sessions (saves tokens when fewer are selected)
- All preferences persisted in local storage

### Multilingual
Full localization in 6 languages:
- English, French, German, Italian, Spanish, Portuguese
- All UI text, kanji meanings, exercises, and AI feedback in your selected language

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Claude API** via `@anthropic-ai/sdk` (client-side with `dangerouslyAllowBrowser`)
- **Web Speech API** — `speechSynthesis` for TTS (Listening, Speaking), `SpeechRecognition` for pronunciation scoring (Speaking)
- Static export deployed to **GitHub Pages**
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

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be prompted to enter your Anthropic API key on first visit.

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
│   ├── page.tsx                          # Language selection (home)
│   ├── [lang]/page.tsx                   # JLPT level selection
│   └── [lang]/[level]/
│       ├── page.tsx                      # Server component (static params)
│       └── StudyPageClient.tsx           # Main study page (client)
├── components/
│   ├── SessionContent.tsx                # Shared accordion for session sections
│   ├── KanjiSection.tsx                  # Kanji display
│   ├── GrammarSection.tsx                # Grammar display
│   ├── ExerciseSection.tsx               # Writing exercises
│   ├── ReadingSection.tsx                # Reading passage
│   ├── ListeningSection.tsx              # Listening dialogue + TTS
│   ├── SpeakingSection.tsx               # Speaking practice + speech recognition
│   ├── ProfileModal.tsx                  # Settings & onboarding modal
│   ├── KanjiGrid.tsx                     # Kanji dictionary browser
│   └── KanjiDetailModal.tsx              # Individual kanji detail
├── hooks/
│   ├── useGenerate.ts                    # Study session generation
│   ├── useProfile.ts                     # User profile (localStorage)
│   ├── useHistory.ts                     # Kanji/grammar progress tracking
│   └── useSessionHistory.ts             # Saved session storage
└── lib/
    ├── claude-client.ts                  # Claude API wrapper
    ├── prompts.ts                        # Prompt templates (dynamic per sections)
    ├── types.ts                          # TypeScript interfaces
    ├── languages.ts                      # UI strings & localization
    ├── kanji-data.ts                     # Static kanji dictionary (2,211 entries)
    ├── kanji-translations.ts             # Localized meanings (5 languages)
    └── translate-meaning.ts              # Translation helper
```

## Deployment

Deployed automatically to GitHub Pages via GitHub Actions on push to `main`. The workflow is in `.github/workflows/deploy.yml`.

## License

MIT — see [LICENSE](LICENSE).

Kanji data derived from [davidluzgouveia/kanji-data](https://github.com/davidluzgouveia/kanji-data) (MIT) — see [LICENSES/kanji-data.txt](LICENSES/kanji-data.txt).
