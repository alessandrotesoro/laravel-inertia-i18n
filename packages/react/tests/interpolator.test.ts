import { describe, expect, it } from "vitest";
import { interpolate } from "../src/interpolator";

describe("interpolate", () => {
	it("returns the string unchanged when no replacements provided", () => {
		expect(interpolate("Hello world")).toBe("Hello world");
	});

	it("returns the string unchanged when replacements is empty", () => {
		expect(interpolate("Hello :name", {})).toBe("Hello :name");
	});

	it("replaces a single :placeholder", () => {
		expect(interpolate("Hello :name!", { name: "Alessandro" })).toBe(
			"Hello Alessandro!",
		);
	});

	it("replaces multiple :placeholders", () => {
		expect(
			interpolate(":greeting, :name!", { greeting: "Hello", name: "World" }),
		).toBe("Hello, World!");
	});

	it("replaces numeric values", () => {
		expect(interpolate("You have :count items", { count: 5 })).toBe(
			"You have 5 items",
		);
	});

	it("handles :Name ucfirst variant", () => {
		expect(interpolate("Hello :Name!", { name: "alessandro" })).toBe(
			"Hello Alessandro!",
		);
	});

	it("handles :NAME uppercase variant", () => {
		expect(interpolate("HELLO :NAME!", { name: "world" })).toBe("HELLO WORLD!");
	});

	it("preserves placeholder when key not in replacements", () => {
		expect(interpolate("Hello :name, :missing!", { name: "World" })).toBe(
			"Hello World, :missing!",
		);
	});

	it("handles exact case match in replacements", () => {
		expect(interpolate("Hello :Name!", { Name: "CustomCase" })).toBe(
			"Hello CustomCase!",
		);
	});

	it("handles underscore-containing placeholders", () => {
		expect(interpolate("Value is :first_name", { first_name: "John" })).toBe(
			"Value is John",
		);
	});

	it("handles string with no placeholders", () => {
		expect(interpolate("No placeholders here", { name: "unused" })).toBe(
			"No placeholders here",
		);
	});

	it("does not replace partial matches (colon in URLs)", () => {
		// :// should not match since the regex requires a word char after :
		expect(interpolate("Visit https://example.com", {})).toBe(
			"Visit https://example.com",
		);
	});
});
