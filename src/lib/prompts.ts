import { Language, JLPTLevel, SectionKey } from "./types";
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

export function buildPrompt(lang: Language, level: JLPTLevel, history?: StudyHistory, sections?: SectionKey[]): string {
  const languageName = languageNames[lang];
  const levelUpper = level.toUpperCase();
  const has = (s: SectionKey) => !sections || sections.includes(s);

  const schemaParts: string[] = [];
  const rulesParts: string[] = [];

  if (has("kanji")) {
    schemaParts.push(`  "kanji": {
    "kanji": "<single kanji appropriate for JLPT ${levelUpper}>",
    "onyomi": "<on'yomi reading in katakana>",
    "kunyomi": "<kun'yomi reading in hiragana>",
    "meaning": "<meaning in ${languageName}>",
    "vocabulary": [
      { "word": "<word using this kanji>", "reading": "<full reading in hiragana>", "meaning": "<meaning in ${languageName}>" }
    ]
  }`);
    rulesParts.push("- The kanji section must have exactly 5 vocabulary items");
    rulesParts.push("- Pick a random kanji — vary your choices");
  }

  if (has("grammar")) {
    schemaParts.push(`  "grammar": {
    "title": "<grammar point name in Japanese>",
    "explanation": "<clear, concise explanation in ${languageName}, suitable for mobile reading>",
    "structure": "<formation pattern, e.g. Verb て-form + ください>",
    "examples": [
      { "japanese": "<example sentence in Japanese>", "reading": "<full reading in hiragana>", "translation": "<translation in ${languageName}>" }
    ]
  }`);
    rulesParts.push("- The grammar section must have exactly 5 examples");
    rulesParts.push("- Pick a random grammar point — vary your choices");
  }

  if (has("exercises")) {
    schemaParts.push(`  "exercises": {
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
  }`);
    rulesParts.push("- fillInTheBlank, jpToLang, and kanjiMeaning must each have exactly 5 questions");
    rulesParts.push("- langToJp is a single paragraph translation exercise (3-5 sentences)");
    rulesParts.push(`- For jpToLang MCQ, the question is a Japanese sentence and the 4 choices are possible translations in ${languageName}`);
    rulesParts.push("- For fill-in-the-blank, the blank should test particles, verb forms, or grammatical constructs");
  }

  const levelConstraint = level === "n5" ? `* N5: This is ABSOLUTE BEGINNER level. Be extremely strict:
    - Use ONLY these kanji: 一二三四五六七八九十百千万円時日月火水木金土曜年大小中長新古高安好白黒赤青学校先生人男女子友名前何上下右左外北南東西国語話読書聞食飲買来行出入休見
    - Vocabulary must come from the JLPT N5 word list ONLY (about 800 words). Examples of allowed words: 私、学生、先生、学校、友達、水、お茶、食べます、飲みます、行きます、来ます、見ます、聞きます、買います
    - Do NOT use words like 牛乳、食堂、会社、磨く、始まる — these are N4 or above
    - Use ONLY ます/です forms, は/が/を/に/で/へ/と/も particles
    - Maximum 4-5 short sentences, each under 15 words
    - Topics: simple self-introduction, what I like, my family, my day (very basic)
    - When in doubt, prefer hiragana over kanji`
    : level === "n4" ? "* N4: Use basic kanji (about 300 kanji), て-form, たい-form, simple conditionals (たら), everyday topics with slightly more detail (hobbies, travel plans, school life). Avoid passive/causative forms."
    : level === "n3" ? "* N3: Use intermediate kanji (about 650 kanji), passive/causative forms, relative clauses, varied conjunctions, topics like news, opinions, social situations."
    : level === "n2" ? "* N2: Use advanced kanji (about 1000 kanji), complex grammar (ものの, にもかかわらず, etc.), abstract topics, newspaper-style writing, longer compound sentences."
    : "* N1: Use advanced kanji (about 2000 kanji), literary and formal expressions, complex nested clauses, academic or professional topics, nuanced vocabulary.";

  if (has("reading")) {
    schemaParts.push(`  "reading": {
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
  }`);
    rulesParts.push("- The reading passage must be 4-8 sentences, cohesive and interesting");
    rulesParts.push(`- CRITICAL: The reading passage MUST match JLPT ${levelUpper} level precisely:\n  ${levelConstraint}`);
    rulesParts.push(`- Only use kanji and grammar structures that a JLPT ${levelUpper} student would have learned — do not exceed the level`);
    rulesParts.push("- The reading section must have exactly 6 vocabulary items from the passage");
    rulesParts.push(`- The reading section must have exactly 3 comprehension questions in ${languageName} with answers in ${languageName}`);
    rulesParts.push("- Comprehension questions should test understanding of the content, not just word lookup");
  }

  if (has("listening")) {
    schemaParts.push(`  "listening": {
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
  }`);
    rulesParts.push("- The listening dialogue must be a natural conversation between exactly 2 speakers with 6-10 lines total");
    rulesParts.push(`- The dialogue must use the same JLPT ${levelUpper} level constraints as the reading passage`);
    if (has("reading")) rulesParts.push("- The dialogue topic must be DIFFERENT from the reading passage topic");
    rulesParts.push("- The listening section must have exactly 5 vocabulary items from the dialogue");
    rulesParts.push(`- The listening section must have exactly 3 comprehension questions in ${languageName} with answers in ${languageName}`);
    if (!has("reading")) {
      rulesParts.push(`- CRITICAL: The dialogue MUST match JLPT ${levelUpper} level precisely:\n  ${levelConstraint}`);
      rulesParts.push(`- Only use kanji and grammar structures that a JLPT ${levelUpper} student would have learned — do not exceed the level`);
    }
  }

  // Add general rules
  rulesParts.push(`- All content must be appropriate for JLPT ${levelUpper} difficulty level`);
  rulesParts.push("- For MCQ questions, vary the correctIndex across 0, 1, 2, and 3 — do not always place the correct answer at the same position");
  rulesParts.push("- Make the wrong MCQ choices plausible but clearly incorrect");
  rulesParts.push("- Respond with ONLY the JSON object. No markdown, no code fences, no additional text.");

  return `You are an expert Japanese language teacher creating JLPT ${levelUpper} study material.
The student's native language is ${languageName}. All translations, meanings, and explanations must be in ${languageName}.

Generate a study session as a single JSON object with this exact structure:

{
${schemaParts.join(",\n")}
}

Rules:
${rulesParts.join("\n")}${buildHistorySection(history)}`;
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

