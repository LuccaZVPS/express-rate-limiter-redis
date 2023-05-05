import { NextFunction } from "express";
import { IRateLimiter, IcreateRateLimiterParams } from "./types";
export class RateLimiter implements IRateLimiter {
  create(args: IcreateRateLimiterParams): () => void | NextFunction {
    this.validate(args);
    return this.middleware(args);
  }
  middleware(args: IcreateRateLimiterParams): () => void | NextFunction {
    return () => {
      return;
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
      console.log("a");
      throw new Error("Store field must be a function");
    }
    if (typeof args.key !== "function") {
      console.log("a");
      throw new Error("key field must be a function");
    }
  }
}
