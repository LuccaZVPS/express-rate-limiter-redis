import { RateLimiter } from "../source/lib";
import { validParams } from "./mocks/create-rate-limiter-params";
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
  });
});
