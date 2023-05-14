import { RateLimiter } from "./lib";
import { IRateLimiterParams } from "./types";
export default (args: IRateLimiterParams) => new RateLimiter(args);
