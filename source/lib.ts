import { NextFunction, Request, Response } from "express";
import { IRateLimiter, IRateLimiterParams, script } from "./types";
export class RateLimiter implements IRateLimiter {
  config: IRateLimiterParams;
  sha: Promise<string>;
  constructor(private readonly args: IRateLimiterParams) {
    this.validate(args);
    this.config = args;
    this.sha = this.generateSha(args.store);
  }
  async runScript(
    cb: (...args: string[]) => Promise<string>,
    max: number,
    key: string,
    expiresIn: number
  ): Promise<script> {
    const sha = await this.sha;
    const value = await this.config.store(
      "EVALSHA",
      `${sha}`,
      1 as unknown as string,
      key,
      JSON.stringify({ max, current: 1 }),
      expiresIn as unknown as string
    );
    return JSON.parse(value);
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
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
      obj.current = obj.current + 1
      redis.call("SET", KEYS[1], cjson.encode(obj))
      redis.call("EXPIRE", KEYS[1], ARGV[2])
      return cjson.encode(obj)
    end

    redis.call("SET", KEYS[1], ARGV[1])
    local newObj = { current = 1, max = tonumber(ARGV[2]) }
    return cjson.encode(newObj)

    `;
    return await cb("SCRIPT", "LOAD", script);
  }

  public validate(args: IRateLimiterParams): void {
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
