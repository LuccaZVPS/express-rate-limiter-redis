import { RateLimiter } from "../source/lib";
import {
  InvalidExpires,
  InvalidList,
  InvalidStore,
  validParams,
} from "./mocks/create-rate-limiter-params";
describe("Rate Limiter", () => {
  const makeSut = () => {
    return new RateLimiter();
  };

  describe("Create", () => {
    test("should call validate method with correct values", () => {
      const sut = makeSut();
      const spy = jest.spyOn(sut, "validate");
      sut.create(validParams);
      expect(spy).toHaveBeenCalledWith(validParams);
    });
    test("should throws if validate throws", () => {
      const sut = makeSut();
      jest.spyOn(sut, "validate").mockImplementationOnce(() => {
        throw new Error("any error");
      });
      expect(() => {
        sut.create(validParams);
      }).toThrowError();
    });
    test("should return the function returned by middleware method", () => {
      const sut = makeSut();
      const fn = async (req, res, next) => {
        return;
      };
      jest.spyOn(sut, "middleware").mockImplementationOnce(() => {
        return fn;
      });
      const result = sut.create(validParams);
      expect(result).toEqual(fn);
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
    test("should call the callback function with correct value", () => {
      const sut = makeSut().generateSha;
      const cbMock = {
        cb: async (...args: string[]) => {
          return "any sha";
        },
      };
      const spy = jest.spyOn(cbMock, "cb");
      sut(cbMock.cb);
      const script = `
    local value = redis.call("GET", KEYS[1])
    if value then
      local obj = cjson.decode(value)
      if obj.current == obj.max then
        return true
      else
        obj.current = obj.current + 1
        redis.call("SET", KEYS[1], cjson.encode(obj))
        return false
      end
    else
      redis.call("SET", KEYS[1], ARGV[1])
      redis.call("EXPIRE", KEYS[1], ARGV[2])
      return nil
    end
  `;
      expect(spy).toHaveBeenCalledWith("SCRIPT", "LOAD", script);
    });
  });
});
