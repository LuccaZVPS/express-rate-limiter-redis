import { Request } from "express";

export interface IcreateRateLimiterParams {
  expiresIn: number;
  max: number;
  message?: string;
  key: (req: Request) => string;
  whiteList?: string[];
  store: (args: string) => number;
}
export interface IRateLimiter {
  create(args: IcreateRateLimiterParams): void;
  validate(args: IcreateRateLimiterParams): void;
}
