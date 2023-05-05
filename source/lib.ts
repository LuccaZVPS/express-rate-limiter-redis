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
    return;
  }
}
