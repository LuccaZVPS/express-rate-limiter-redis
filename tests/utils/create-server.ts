import express from "express";
import rateLimiter from "../../lib/lib";
import ioredis from "ioredis";
const app = express();
const client = ioredis.createClient();
const loginLimiter = rateLimiter({
  expiresIn: 60 * 60, // 60 minutes
  key: (req) => req.ip,
  max: 15,
  // @ts-expect-error - Avoid ts errors when using ioredis libary
  store: (...args: string[]) => client.call(...args),
  message: "You have reached the maximum number of login attempts.",
});
app.post("/login", loginLimiter, (req, res) => {
  res.send("Hello world!");
});
app.listen(process.env.PORT || 3000);
