// Cannot be directly instantiated
// Used to set up requirements for subclasses
// Creates a class when translated to JS - possible to use instanceof checks

export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super(message);
  }

  abstract serializeErrors(): { message: string; field?: string }[];
}
