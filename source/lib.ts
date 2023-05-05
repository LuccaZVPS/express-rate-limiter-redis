import { IRateLimiter, IcreateRateLimiterParams } from "./types";
export class RateLimiter implements IRateLimiter {
  create(args: IcreateRateLimiterParams): void {
    this.validate(args);
    return;
  }
  validate(args: IcreateRateLimiterParams): void {
    return;
  }
}
