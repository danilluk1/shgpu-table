export class TooManyRequestsError extends Error {
  constructor() {
    super("Too many requests for the API.");
    
  }
}
