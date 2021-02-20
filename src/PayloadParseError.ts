class BaseException extends Error {
  details: {
    code?: string;
    data?: string;
  };
  message: string = "";
  name: string;

  constructor(message: string = "", details: {} = {}) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    }

    Object.setPrototypeOf(this, BaseException.prototype);
    this.message = message;
    this.details = details;
  }
}

export class PayloadParseError extends BaseException {
  public name = "PayloadParseError";
  constructor(message: string = "", details: {} = {}) {
    super(message, details);
    Object.setPrototypeOf(this, PayloadParseError.prototype);
  }
}
