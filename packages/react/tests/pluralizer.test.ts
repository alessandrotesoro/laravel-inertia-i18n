import { describe, expect, it } from "vitest";
import { pluralize } from "../src/pluralizer";

describe("pluralize", () => {
	describe("simple two-form", () => {
		it("returns singular form when count is 1", () => {
			expect(pluralize("One apple|Many apples", 1)).toBe("One apple");
		});

		it("returns plural form when count is 0", () => {
			expect(pluralize("One apple|Many apples", 0)).toBe("Many apples");
		});

		it("returns plural form when count is > 1", () => {
			expect(pluralize("One apple|Many apples", 5)).toBe("Many apples");
		});

		it("returns plural form when count is large", () => {
			expect(pluralize("One item|Many items", 1000)).toBe("Many items");
		});
	});

	describe("explicit values {N}", () => {
		it("matches {0}", () => {
			expect(pluralize("{0} No items|{1} One item|[2,*] Many items", 0)).toBe(
				"No items",
			);
		});

		it("matches {1}", () => {
			expect(pluralize("{0} No items|{1} One item|[2,*] Many items", 1)).toBe(
				"One item",
			);
		});

		it("matches {2}", () => {
			expect(pluralize("{0} None|{1} One|{2} Two", 2)).toBe("Two");
		});
	});

	describe("range [min,max]", () => {
		it("matches within range [2,*]", () => {
			expect(pluralize("{0} No items|{1} One item|[2,*] :count items", 5)).toBe(
				":count items",
			);
		});

		it("matches range lower bound", () => {
			expect(pluralize("[0,1] Few|[2,10] Some|[11,*] Many", 0)).toBe("Few");
		});

		it("matches range upper bound", () => {
			expect(pluralize("[0,1] Few|[2,10] Some|[11,*] Many", 10)).toBe("Some");
		});

		it("matches open-ended range", () => {
			expect(pluralize("[0,1] Few|[2,10] Some|[11,*] Many", 999)).toBe("Many");
		});

		it("matches [1,19] range", () => {
			expect(pluralize("{0} None|[1,19] Some|[20,*] Lots", 15)).toBe("Some");
		});
	});

	describe("single form (no pipe)", () => {
		it("returns the string as-is when no pipes", () => {
			expect(pluralize("Just one form", 5)).toBe("Just one form");
		});
	});

	describe("edge cases", () => {
		it("trims whitespace from segments", () => {
			expect(pluralize(" One apple | Many apples ", 1)).toBe("One apple");
		});

		it("falls back to last segment for non-matching count", () => {
			expect(pluralize("{0} Zero|{1} One", 5)).toBe("One");
		});

		it("handles three simple forms without markers", () => {
			expect(pluralize("none|one|many", 0)).toBe("many");
			expect(pluralize("none|one|many", 1)).toBe("none");
			expect(pluralize("none|one|many", 5)).toBe("many");
		});
	});
});
