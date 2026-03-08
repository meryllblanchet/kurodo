export type Language = "en" | "fr" | "de" | "it" | "es" | "pt";
export type JLPTLevel = "n5" | "n4" | "n3" | "n2" | "n1";
export type SectionKey = "kanji" | "grammar" | "exercises" | "reading" | "listening";

export const ALL_SECTIONS: SectionKey[] = ["kanji", "grammar", "exercises", "reading", "listening"];

export interface KanjiVocab {
  word: string;
  reading: string;
  meaning: string;
}

export interface KanjiOfTheDay {
  kanji: string;
  onyomi: string;
  kunyomi: string;
  meaning: string;
  vocabulary: KanjiVocab[];
}

export interface GrammarExample {
  japanese: string;
  reading: string;
  translation: string;
}

export interface GrammarOfTheDay {
  title: string;
  explanation: string;
  structure: string;
  examples: GrammarExample[];
}

export interface MCQQuestion {
  question: string;
  choices: [string, string, string, string];
  correctIndex: number;
}

export interface TranslationParagraph {
  prompt: string;
  referenceAnswer: string;
}

export interface Exercises {
  fillInTheBlank: MCQQuestion[];
  jpToLang: MCQQuestion[];
  langToJp: TranslationParagraph;
  kanjiMeaning: MCQQuestion[];
}

export interface GeneratedContent {
  kanji?: KanjiOfTheDay;
  grammar?: GrammarOfTheDay;
  exercises?: Exercises;
  reading?: ReadingPassage;
  listening?: ListeningPassage;
}

export interface ReadingVocab {
  word: string;
  reading: string;
  meaning: string;
}

export interface ReadingPassage {
  title: string;
  passage: string;
  passageReading: string;
  translation: string;
  vocabulary: ReadingVocab[];
  questions: MCQQuestion[];
}

export interface DialogueLine {
  speaker: string;
  japanese: string;
  reading: string;
}

export interface ListeningPassage {
  title: string;
  situation: string;
  dialogue: DialogueLine[];
  translation: string;
  vocabulary: ReadingVocab[];
  questions: MCQQuestion[];
}

export interface CorrectionFeedback {
  overallScore: number;
  correctedText: string;
  feedback: string;
  details: {
    original: string;
    correction: string;
    explanation: string;
  }[];
}
