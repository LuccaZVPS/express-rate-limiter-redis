import { RateLimiter } from "../source/lib";
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
    const sut = makeSut().generateSha;
    const cbMock = {
      cb: async () => {
        return "any sha";
      },
    };
    test("should call the callback function with correct value", async () => {
      const spy = jest.spyOn(cbMock, "cb");
      await sut(cbMock.cb);
      const script = `
    local value = redis.call("GET", KEYS[1])
    if value then
      local obj = cjson.decode(value)
      obj.current = obj.current + 1
      redis.call("SET", KEYS[1], cjson.encode(obj))
      redis.call("EXPIRE", KEYS[1], ARGV[2])
      return cjson.encode(obj)
    end
    redis.call("SET", KEYS[1], ARGV[1])
    local newObj = { current = 1, max = tonumber(ARGV[2]) }
    return cjson.encode(newObj)
    `;
      expect(spy).toHaveBeenCalledWith("SCRIPT", "LOAD", script);
    });

    test("should return the callback value", async () => {
      const sha = await sut(cbMock.cb);
      expect(sha).toBe("any sha");
    });
  });
});
