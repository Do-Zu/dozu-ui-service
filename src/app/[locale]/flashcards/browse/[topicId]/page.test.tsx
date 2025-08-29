/* Auto-generated tests — Framework: Jest; RTL: 0; jest-dom: 0 */
import React, { isValidElement } from "react";
import * as PageModule from "./page";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

const isPromise = (v: any): v is Promise<any> => v && typeof (v as any).then === "function";

const createProps = (overrides: any = {}) =>
  ({
    params: { locale: "en", topicId: "algebra" },
    searchParams: {},
    ...overrides,
  } as any);

beforeEach(() => {
  // Safe default network stub
  // @ts-ignore
  global.fetch = (jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => "",
  }) as unknown) as any;
});

afterEach(() => {
  // @ts-ignore
  if (typeof jest !== "undefined" && jest.resetAllMocks) jest.resetAllMocks();
});

describe("Flashcards Browse Page module (src/app/[locale]/flashcards/browse/[topicId]/page)", () => {
  it("exports a default page component function", () => {
    expect(typeof (PageModule as any).default).toBe("function");
  });

  it("invokes default page with typical params without crashing (returns element or throws Next control flow)", async () => {
    const props = createProps();
    let result: any = undefined;
    try {
      const out = (PageModule as any).default(props);
      result = isPromise(out) ? await out : out;
    } catch (err: any) {
      const msg = String(err && (err.message || err));
      const isNextControlFlow =
        msg.includes("NEXT_REDIRECT") ||
        msg.includes("NEXT_NOT_FOUND") ||
        /not\s*found/i.test(msg);
      expect(isNextControlFlow).toBe(true);
      return;
    }
    expect(result).toBeDefined();
    expect(isValidElement(result)).toBe(true);
  });

  it("handles edge-case params gracefully (empty topicId either returns not-found/redirect or renders)", async () => {
    const props = createProps({ params: { locale: "en", topicId: "" } });
    try {
      const out = (PageModule as any).default(props);
      const result = isPromise(out) ? await out : out;
      expect(isValidElement(result)).toBe(true);
    } catch (err: any) {
      const msg = String(err && (err.message || err));
      const isNextControlFlow =
        msg.includes("NEXT_REDIRECT") ||
        msg.includes("NEXT_NOT_FOUND") ||
        /not\s*found/i.test(msg);
      expect(isNextControlFlow).toBe(true);
    }
  });
});