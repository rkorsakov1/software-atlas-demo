import { describe, expect, it } from "vitest";

import { parseCsv } from "@/lib/csv";

describe("parseCsv", () => {
  it("reads a header and keyed records", () => {
    expect(parseCsv("a,b\n1,2\n")).toEqual([{ a: "1", b: "2" }]);
  });

  it("handles quoted commas, doubled quotes and embedded newlines", () => {
    const text = 'id,quote\nx,"grew 15.6%, to reach ""$48.2 billion""\nin 2018"\n';
    expect(parseCsv(text)).toEqual([{ id: "x", quote: 'grew 15.6%, to reach "$48.2 billion"\nin 2018' }]);
  });

  it("strips a byte-order mark, CRLF line endings and blank lines", () => {
    expect(parseCsv("﻿a,b\r\n1,2\r\n\r\n")).toEqual([{ a: "1", b: "2" }]);
  });

  it("reads missing trailing cells as empty strings", () => {
    expect(parseCsv("a,b,c\n1\n")).toEqual([{ a: "1", b: "", c: "" }]);
  });
});
