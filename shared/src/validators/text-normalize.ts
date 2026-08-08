// NFD decomposition splits an accented letter into its base letter plus a
// combining diacritical mark (U+0300-U+036F), so stripping that block drops
// every accent (a with acute -> a, c with cedilla -> c, ...) while leaving
// the base letters intact. Built with the RegExp constructor, not a
// /.../ literal, so the \u escape stays literal source text instead of
// risking an actual, invisible combining character landing in the file.
const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

export const stripAccents = (value: string): string => value.normalize('NFD').replace(COMBINING_MARKS, '');
