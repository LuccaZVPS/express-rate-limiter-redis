import { IcreateRateLimiterParams } from "../../source/types";

export const validParams: IcreateRateLimiterParams = {
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
} as unknown as IcreateRateLimiterParams;
export const InvalidStore = {
  expiresIn: 60,
  key: () => "any",
  max: 1,
  message: "",
  whiteList: ["192.168.0.1"],
  store: "",
} as unknown as IcreateRateLimiterParams;
export const InvalidList = {
  expiresIn: 60,
  key: () => "any",
  max: 1,
  message: "",
  whiteList: "192.168.0.1",
  store: () => 5,
} as unknown as IcreateRateLimiterParams;
