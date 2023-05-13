import { RateLimiter } from "../lib/lib";
import { mockRequest, mockResponse } from "mock-req-res";
import {
  InvalidExpires,
  InvalidList,
  InvalidStore,
  validParams,
} from "./mocks/create-rate-limiter-params";
describe("Rate Limiter", () => {
  const makeSut = () => {
    return new RateLimiter(validParams);
  };
  const makeCustomSut = (max: number, current: number) => {
    const customParam = {
      ...validParams,
      max,
      store: () => {
        return current;
      },
    };
    return new RateLimiter(customParam);
  };
  describe("Middleware", () => {
    const req = mockRequest();
    const res = mockResponse();
    const nextFunction = jest.fn();

    test("should call runScript method with correct value", async () => {
      const sut = makeSut();
      const spy = jest.spyOn(sut, "runScript");
      const middleware = sut.middleware();
      await middleware(req, res, nextFunction);
      expect(spy).toHaveBeenCalledWith(
        validParams.key(req),
        "1",
        validParams.expiresIn.toString()
      );
    });
    test("should return 429 if current property is bigger than max", async () => {
      const sut = makeCustomSut(10, 11);
      const middleware = sut.middleware();
      const spy = jest.spyOn(res, "status");
      await middleware(req, res, nextFunction);
      expect(spy).toHaveBeenCalledWith(429);
    });
    test("should call next function if current property if less than max", async () => {
      const sut = makeCustomSut(10, 8);
      const toSpy = { next: jest.fn() };
      const middleware = sut.middleware();
      const spy = jest.spyOn(toSpy, "next");
      await middleware(req, res, toSpy.next);
      expect(spy).toHaveBeenCalled();
    });
  });
  describe("Validate", () => {
    test("should throw if invalid param is provided", () => {
      const sut = makeSut().validate;
      expect(() => {
        sut(InvalidExpires);
      }).toThrowError();

      expect(() => {
        sut(InvalidList);
      }).toThrowError();

      expect(() => {
        sut(InvalidStore);
      }).toThrowError();
    });
    test("should return void if valid params is provided", () => {
      const sut = makeSut().validate;
      expect(sut(validParams)).toBeFalsy();
    });
  });
  describe("generateSha", () => {
    const sut = makeSut();
    const script = makeSut().mainScript;
    test("should call the store function with correct value", async () => {
      const spy = jest.spyOn(sut.config, "store");
      await sut.generateSha(sut.mainScript);
      expect(spy).toHaveBeenCalledWith("SCRIPT", "LOAD", script);
    });

    test("should return same value as store function", async () => {
      const sha = await sut.generateSha("");
      expect(sha).toBe(sut.config.store());
    });
  });
  describe("resetKey", () => {
    test("should call generateSha with correct values", async () => {
      const sut = makeSut();
      const spy = jest.spyOn(sut, "generateSha");
      await sut.resetKey("any_key");
      expect(spy).toHaveBeenCalledWith(sut.resetScript);
    });
  });
});
