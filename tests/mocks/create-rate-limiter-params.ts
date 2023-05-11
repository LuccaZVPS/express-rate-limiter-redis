import { IRateLimiterParams } from "../../source/types";

export const validParams: IRateLimiterParams = {
  expiresIn: 60,
  key: () => "any",
  max: 1,
  message: "",
  whiteList: ["192.168.0.1"],
  store: () => 5,
};
export const InvalidExpires = {
  expiresIn: "60",
  key: () => "any",
  max: 1,
  message: "",
  whiteList: ["192.168.0.1"],
  store: () => 5,
} as unknown as IRateLimiterParams;
export const InvalidStore = {
  expiresIn: 60,
  key: () => "any",
  max: 1,
  message: "",
  whiteList: ["192.168.0.1"],
  store: "",
} as unknown as IRateLimiterParams;
export const InvalidList = {
  expiresIn: 60,
  key: () => "any",
  max: 1,
  message: "",
  whiteList: "192.168.0.1",
  store: () => 5,
} as unknown as IRateLimiterParams;
