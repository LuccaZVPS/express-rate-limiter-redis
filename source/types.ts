import { NextFunction, Request, Response } from "express";

export interface IRateLimiterParams {
  expiresIn: number;
  max: number;
  message?: string;
  key: (req: Request) => string;
  whiteList?: string[];
  store: (...args: string[]) => any;
}
export interface script {
  current: number;
  max: number;
}
export interface IRateLimiter {
  runScript(
    cb: (...args: string[]) => Promise<string>,
    max: number,
    key: string,
    expiresIn: number
  ): Promise<script>;
  generateSha(cb: (...args: string[]) => Promise<string>): Promise<string>;
  validate(args: IRateLimiterParams): void;
  middleware: () => (req: Request, res: Response, next: NextFunction) => void;
}
