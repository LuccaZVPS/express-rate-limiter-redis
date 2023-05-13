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
      store: () => {
        return `{ "max": ${max}, "current": ${current} }`;
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
        validParams.store,
        validParams.max,
        validParams.key(req),
        validParams.expiresIn
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
    const cbMock = {
      cb: async () => {
        return "any sha";
      },
    };
    const script = makeSut().mainScript;
    test("should call the callback function with correct value", async () => {
      const spy = jest.spyOn(cbMock, "cb");
      await sut.generateSha(cbMock.cb);
      expect(spy).toHaveBeenCalledWith("SCRIPT", "LOAD", script);
    });

    test("should return the callback value", async () => {
      const sha = await sut.generateSha(cbMock.cb);
      expect(sha).toBe("any sha");
    });
  });
});
