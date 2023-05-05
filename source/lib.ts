import { NextFunction, Request, Response } from "express";
import { IRateLimiter, IcreateRateLimiterParams } from "./types";
export class RateLimiter implements IRateLimiter {
  create(args: IcreateRateLimiterParams) {
    this.validate(args);
    return this.middleware(args);
  }

  middleware(args: IcreateRateLimiterParams) {
    return async (req: Request, res: Response, next: NextFunction) => {
      next();
    };
  }
  validate(args: IcreateRateLimiterParams): void {
    if (typeof args.expiresIn !== "number") {
      throw new Error("ExpiresIn field must be a number");
    }
    if (args.whiteList && !Array.isArray(args.whiteList)) {
      throw new Error("WhiteList field must be a string list");
    }
    if (typeof args.store !== "function") {
      throw new Error("Store field must be a function");
    }
    if (typeof args.key !== "function") {
      throw new Error("key field must be a function");
    }
  }
}
