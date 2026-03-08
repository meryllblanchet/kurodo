import { Language, JLPTLevel } from "./types";
import { languageNames } from "./languages";

export interface StudyHistory {
  kanji: string[];
  grammar: string[];
}

function buildHistorySection(history?: StudyHistory): string {
  if (!history) return "";
  const parts: string[] = [];
  if (history.kanji.length > 0) {
    parts.push(`- Kanji already covered: ${history.kanji.join(", ")}`);
  }
  if (history.grammar.length > 0) {
    parts.push(`- Grammar points already covered: ${history.grammar.join(", ")}`);
  }
  if (parts.length === 0) return "";
  return `

IMPORTANT — AVOID REPETITION:
The student has already studied the following items in previous sessions. Do NOT reuse them. Pick different kanji and grammar points.
${parts.join("\n")}`;
}

export function buildPrompt(lang: Language, level: JLPTLevel, history?: StudyHistory): string {
  const languageName = languageNames[lang];
  const levelUpper = level.toUpperCase();

  return `You are an expert Japanese language teacher creating JLPT ${levelUpper} study material.
The student's native language is ${languageName}. All translations, meanings, and explanations must be in ${languageName}.

Generate a complete study session as a single JSON object with this exact structure:

{
  "kanji": {
    "kanji": "<single kanji appropriate for JLPT ${levelUpper}>",
    "onyomi": "<on'yomi reading in katakana>",
    "kunyomi": "<kun'yomi reading in hiragana>",
    "meaning": "<meaning in ${languageName}>",
    "vocabulary": [
      { "word": "<word using this kanji>", "reading": "<full reading in hiragana>", "meaning": "<meaning in ${languageName}>" }
    ]
  },
  "grammar": {
    "title": "<grammar point name in Japanese>",
    "explanation": "<clear, concise explanation in ${languageName}, suitable for mobile reading>",
    "structure": "<formation pattern, e.g. Verb て-form + ください>",
    "examples": [
      { "japanese": "<example sentence in Japanese>", "reading": "<full reading in hiragana>", "translation": "<translation in ${languageName}>" }
    ]
  },
  "exercises": {
    "fillInTheBlank": [
      { "question": "<Japanese sentence with ___ for the missing part>", "choices": ["<a>","<b>","<c>","<d>"], "correctIndex": <0-3> }
    ],
    "jpToLang": [
      { "question": "<Japanese sentence to translate>", "choices": ["<translation a>","<translation b>","<translation c>","<translation d>"], "correctIndex": <0-3> }
    ],
    "langToJp": {
      "prompt": "<a short paragraph in ${languageName} (3-5 sentences) that the student must translate into Japanese>",
      "referenceAnswer": "<the correct Japanese translation of the paragraph>"
    },
    "kanjiMeaning": [
      { "question": "<kanji or kanji compound>", "choices": ["<meaning a>","<meaning b>","<meaning c>","<meaning d>"], "correctIndex": <0-3> }
    ]
  },
  "reading": {
    "title": "<a short title for the passage in Japanese>",
    "passage": "<a Japanese passage of 4-8 sentences, using ONLY kanji and grammar appropriate for JLPT ${levelUpper}, on an interesting topic — daily life, culture, travel, food, seasons, school, work, etc.>",
    "passageReading": "<the full passage rewritten entirely in hiragana>",
    "translation": "<full translation of the passage in ${languageName}>",
    "vocabulary": [
      { "word": "<key word from the passage>", "reading": "<reading in hiragana>", "meaning": "<meaning in ${languageName}>" }
    ],
    "questions": [
      { "question": "<comprehension question in ${languageName}>", "choices": ["<a>","<b>","<c>","<d>"], "correctIndex": <0-3> }
    ]
  },
  "listening": {
    "title": "<a short title for the dialogue in Japanese>",
    "situation": "<a one-sentence description of the situation in ${languageName}, e.g. 'Two friends planning a weekend trip'>",
    "dialogue": [
      { "speaker": "<speaker name in Japanese, e.g. 田中>", "japanese": "<one line of dialogue in Japanese>", "reading": "<the same line rewritten entirely in hiragana>" }
    ],
    "translation": "<full translation of the entire dialogue in ${languageName}>",
    "vocabulary": [
      { "word": "<key word from the dialogue>", "reading": "<reading in hiragana>", "meaning": "<meaning in ${languageName}>" }
    ],
    "questions": [
      { "question": "<comprehension question in ${languageName}>", "choices": ["<a>","<b>","<c>","<d>"], "correctIndex": <0-3> }
    ]
  }
}

Rules:
- The kanji section must have exactly 5 vocabulary items
- The grammar section must have exactly 5 examples
- fillInTheBlank, jpToLang, and kanjiMeaning must each have exactly 5 questions
- langToJp is a single paragraph translation exercise (3-5 sentences)
- For jpToLang MCQ, the question is a Japanese sentence and the 4 choices are possible translations in ${languageName}
- All content must be appropriate for JLPT ${levelUpper} difficulty level
- For MCQ questions, vary the correctIndex across 0, 1, 2, and 3 — do not always place the correct answer at the same position
- Make the wrong MCQ choices plausible but clearly incorrect
- Pick a random kanji and grammar point — vary your choices
- For fill-in-the-blank, the blank should test particles, verb forms, or grammatical constructs
- The reading passage must be 4-8 sentences, cohesive and interesting
- CRITICAL: The reading passage MUST match JLPT ${levelUpper} level precisely:
  ${level === "n5" ? "* N5: Use only basic kanji (about 100 kanji), simple verb forms (ます/です), short sentences, everyday topics (self-introduction, shopping, daily routine). Avoid compound sentences." : ""}${level === "n4" ? "* N4: Use basic kanji (about 300 kanji), て-form, たい-form, simple conditionals, everyday topics with slightly more detail (hobbies, travel plans, school life)." : ""}${level === "n3" ? "* N3: Use intermediate kanji (about 650 kanji), passive/causative forms, relative clauses, varied conjunctions, topics like news, opinions, social situations." : ""}${level === "n2" ? "* N2: Use advanced kanji (about 1000 kanji), complex grammar (ものの, にもかかわらず, etc.), abstract topics, newspaper-style writing, longer compound sentences." : ""}${level === "n1" ? "* N1: Use advanced kanji (about 2000 kanji), literary and formal expressions, complex nested clauses, academic or professional topics, nuanced vocabulary." : ""}
- Only use kanji and grammar structures that a JLPT ${levelUpper} student would have learned — do not exceed the level
- The reading section must have exactly 6 vocabulary items from the passage
- The reading section must have exactly 3 comprehension questions in ${languageName} with answers in ${languageName}
- Comprehension questions should test understanding of the content, not just word lookup
- The listening dialogue must be a natural conversation between exactly 2 speakers with 6-10 lines total
- The dialogue must use the same JLPT ${levelUpper} level constraints as the reading passage
- The dialogue topic must be DIFFERENT from the reading passage topic
- The listening section must have exactly 5 vocabulary items from the dialogue
- The listening section must have exactly 3 comprehension questions in ${languageName} with answers in ${languageName}
- Respond with ONLY the JSON object. No markdown, no code fences, no additional text.${buildHistorySection(history)}`;
}

export function buildCorrectionPrompt(
  lang: Language,
  level: JLPTLevel,
  originalText: string,
  userTranslation: string,
): string {
  const languageName = languageNames[lang];
  const levelUpper = level.toUpperCase();

  return `You are an expert Japanese language teacher correcting a JLPT ${levelUpper} student's translation.
The student's native language is ${languageName}.

The student was asked to translate the following text into Japanese:
"""
${originalText}
"""

The student's translation:
"""
${userTranslation}
"""

Evaluate the translation and respond with a JSON object:
{
  "overallScore": <score from 1 to 10>,
  "correctedText": "<the full corrected Japanese translation>",
  "feedback": "<overall feedback in ${languageName}, 2-3 sentences>",
  "details": [
    {
      "original": "<the part of the student's text that needs correction>",
      "correction": "<the corrected version>",
      "explanation": "<brief explanation in ${languageName}>"
    }
  ]
}

Rules:
- If the translation is perfect, return an empty details array and give positive feedback
- Focus on grammar, vocabulary, and naturalness appropriate for JLPT ${levelUpper}
- Keep explanations concise and educational
- The details array should only contain actual errors or improvements (not more than 5)
- Respond with ONLY the JSON object. No markdown, no code fences, no additional text.`;
}

