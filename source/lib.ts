import { NextFunction, Request, Response } from "express";
import { IRateLimiter, IcreateRateLimiterParams } from "./types";
export class RateLimiter implements IRateLimiter {
  create(args: IcreateRateLimiterParams) {
    this.validate(args);
    return this.middleware(args);
  }

  middleware(args: IcreateRateLimiterParams) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const current = args.store("");
      next();
    };
  }

  async generateSha(
    cb: (...args: string[]) => Promise<string>
  ): Promise<string> {
    const script = `
    local value = redis.call("GET", KEYS[1])
    if value then
      local obj = cjson.decode(value)
      if obj.current == obj.max then
        return true
      else
        obj.current = obj.current + 1
        redis.call("SET", KEYS[1], cjson.encode(obj))
        return false
      end
    else
      redis.call("SET", KEYS[1], ARGV[1])
      redis.call("EXPIRE", KEYS[1], ARGV[2])
      return nil
    end
  `;
    return await cb("SCRIPT", "LOAD", script);
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
