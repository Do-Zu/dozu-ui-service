declare module 'stopword' {
  export function removeStopwords(
    tokens: string[],
    stopwords?: string[]
  ): string[];

  export const eng: string[];
  export const fra: string[];
  export const deu: string[];
  export const spa: string[];
  export const por: string[];
  export const ita: string[];
  export const nld: string[];
  export const vie: string[];
  export const rus: string[];
  export const jpn: string[];
  export const ara: string[];
  // Plus other language stopwords that the package supports
}