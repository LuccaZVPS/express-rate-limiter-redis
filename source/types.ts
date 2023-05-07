import { NextFunction, Request, Response } from "express";

export interface IcreateRateLimiterParams {
  expiresIn: number;
  max: number;
  message?: string;
  key: (req: Request) => string;
  whiteList?: string[];
  store: (...args: string[]) => any;
}
export interface IRateLimiter {
  generateSha(cb: (...args: string[]) => Promise<string>): Promise<string>;
  create: (
    args: IcreateRateLimiterParams
  ) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
  validate(args: IcreateRateLimiterParams): void;
  middleware: (
    args: IcreateRateLimiterParams
  ) => (req: Request, res: Response, next: NextFunction) => void;
}
