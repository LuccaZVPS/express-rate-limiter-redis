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
      const fn = () => {
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
    test("should throw if invalid args is provided", () => {
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
  });
});
