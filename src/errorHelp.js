// Plain-English readings of the errors beginners hit most. Shown in beginner mode.
const RULES = [
  [/IndentationError|TabError|unexpected indent/i, 'The spaces at the start of a line are wrong. Blocks after a colon must be indented the same amount.'],
  [/SyntaxError|expected ['"`;)]|parse error|syntax error|Unexpected token/i, 'The code breaks the grammar of the language, often from a missing bracket, quote or semicolon. Check the line named in the error and the one above it.'],
  [/NameError|ReferenceError|not declared in this scope|cannot find symbol|undefined: |cannot find value|does not exist in the current context|undeclared/i, 'You used a name the program does not know. Check the spelling and that it is created before this line.'],
  [/IndexError|ArrayIndexOutOfBounds|index out of (range|bounds)|out_of_range/i, 'You asked for a position past the end of a list. Remember that positions usually start at 0.'],
  [/ValueError|NumberFormatException|invalid literal|ParseIntError|FormatException|InputMismatch/i, 'The program tried to turn text into a number and the text was not a number. Check the order you read the input in.'],
  [/TypeError|incompatible types|mismatched types|cannot convert|invalid operands/i, 'Two values of different kinds were mixed, such as text and a number. Convert one so they match.'],
  [/ZeroDivisionError|divide by zero|DivideByZero/i, 'The program divided by zero. Handle the zero case before dividing.'],
  [/KeyError|NoSuchElementException|undefined is not|Cannot read propert|NullPointer|NullReference|nil value|nil pointer/i, 'The program used something that is empty or missing. Check that the value exists before using it.'],
  [/RecursionError|StackOverflow|stack overflow|Maximum call stack/i, 'A function kept calling itself and never stopped. Check that the recursion has a stopping case.'],
  [/EOFError|unexpected end of|reached end of file|EOF/i, 'The program read more input than the test provided, or a block was left unclosed.'],
  [/undefined reference|linker command failed|LNK\d+/i, 'A function was declared but its code could not be found. Check the name and that it is defined.'],
];

export function explainError(text) {
  if (!text) return null;
  return RULES.find(([pattern]) => pattern.test(text))?.[1] ?? null;
}

export function explainResult(result) {
  if (result.timedOut) return 'The program ran past the time limit. Look for a loop whose condition never becomes false, or an approach that is too slow for the input size.';
  if (result.truncated) return 'The program printed too much and was stopped. A print statement inside an endless loop is the usual cause.';
  return null;
}
