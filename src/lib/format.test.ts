import { describe, it, expect } from "vitest";
import { rpShort, rpFull } from "./format";

describe("rpShort", () => {
  it("miliar", () => expect(rpShort(1_500_000_000)).toBe("Rp1,5M"));
  it("juta", () => expect(rpShort(133_000_000)).toBe("Rp133,0jt"));
  it("ribu", () => expect(rpShort(45_000)).toBe("Rp45rb"));
  it("kecil", () => expect(rpShort(500)).toBe("Rp500"));
  it("negatif", () => expect(rpShort(-2_400_000)).toBe("Rp-2,4jt"));
});

describe("rpFull", () => {
  it("format ribuan Indonesia", () => {
    expect(rpFull(1_350_000)).toBe("Rp1.350.000");
  });
  it("pembulatan", () => {
    expect(rpFull(1_350_000.7)).toBe("Rp1.350.001");
  });
});
