import { NextFunction, Request, Response } from "express";
import { IRateLimiter, IRateLimiterParams } from "./types";
export class RateLimiter implements IRateLimiter {
  config: IRateLimiterParams;
  resetScript = `redis.call("DEL", KEYS[1])`;
  mainScript = `
  local current = redis.call("GET", KEYS[1])
  if current then
    current = tonumber(current)
    current = current + 1
    local expiration = redis.call("TTL", KEYS[1])
    redis.call("SET", KEYS[1], current, "EX", expiration)
    return current
  else
    redis.call("SET", KEYS[1], ARGV[1], "EX", ARGV[2])
    return tonumber(ARGV[1])
  end
  `;
  constructor(private readonly args: IRateLimiterParams) {
    this.validate(args);
    this.config = args;
  }
  async resetKey(key: string): Promise<void> {
    const sha = await this.generateSha(this.resetScript);
    await this.runScript(sha, key);
  }
  async runScript(...args: string[]): Promise<any> {
    const sha = await this.generateSha(this.mainScript);
    return await this.config.store("EVALSHA", `${sha}`, "1", ...args);
  }
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { key, max, expiresIn, message } = this.config;
      const current = await this.runScript(key(req), "1", expiresIn.toString());
      res.set("X-Rate-Limit-Limit", `${max}`);
      res.set("X-Rate-Limit-Remaining", `${current > max ? 0 : max - current}`);
      res.set("X-Rate-Limit-Duration", `${this.config.expiresIn}`);

      if (current > max) {
        return res.status(429).send(message || "Too many requests.");
      }
      next();
    };
  }
  async generateSha(script: string): Promise<string> {
    return await this.config.store("SCRIPT", "LOAD", script);
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
