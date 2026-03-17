import { describe, expect, it } from "vitest";
import { translate } from "../src/translator";

const translations: Record<string, string> = {
	"Welcome!": "¡Bienvenido!",
	"Hello, :name!": "¡Hola, :name!",
	"One apple|:count apples": "Una manzana|:count manzanas",
	"{0} No items|{1} One item|[2,*] :count items":
		"{0} Sin artículos|{1} Un artículo|[2,*] :count artículos",
	"auth.login": "Iniciar sesión",
	Save: "Guardar",
	"Welcome, :Name!": "¡Bienvenido, :Name!",
};

describe("translate", () => {
	it("looks up a simple key", () => {
		expect(translate(translations, "Welcome!")).toBe("¡Bienvenido!");
	});

	it("falls back to the key when translation not found", () => {
		expect(translate(translations, "Missing key")).toBe("Missing key");
	});

	it("handles short keys", () => {
		expect(translate(translations, "auth.login")).toBe("Iniciar sesión");
	});

	it("interpolates :name placeholders", () => {
		expect(
			translate(translations, "Hello, :name!", { name: "Alessandro" }),
		).toBe("¡Hola, Alessandro!");
	});

	it("handles simple two-form pluralization", () => {
		expect(
			translate(translations, "One apple|:count apples", { count: 1 }),
		).toBe("Una manzana");
		expect(
			translate(translations, "One apple|:count apples", { count: 5 }),
		).toBe("5 manzanas");
	});

	it("handles explicit value + range pluralization", () => {
		expect(
			translate(translations, "{0} No items|{1} One item|[2,*] :count items", {
				count: 0,
			}),
		).toBe("Sin artículos");
		expect(
			translate(translations, "{0} No items|{1} One item|[2,*] :count items", {
				count: 1,
			}),
		).toBe("Un artículo");
		expect(
			translate(translations, "{0} No items|{1} One item|[2,*] :count items", {
				count: 42,
			}),
		).toBe("42 artículos");
	});

	it("handles interpolation with :Name ucfirst", () => {
		expect(
			translate(translations, "Welcome, :Name!", { name: "alessandro" }),
		).toBe("¡Bienvenido, Alessandro!");
	});

	it("does not pluralize when count is not provided", () => {
		// Without count, the pipe-delimited string is returned as-is
		expect(translate(translations, "One apple|:count apples")).toBe(
			"Una manzana|:count manzanas",
		);
	});

	it("passes through when no options", () => {
		expect(translate(translations, "Save")).toBe("Guardar");
	});

	it("handles combined pluralization and interpolation", () => {
		const t: Record<string, string> = {
			":name has one item|:name has :count items":
				":name tiene un artículo|:name tiene :count artículos",
		};

		expect(
			translate(t, ":name has one item|:name has :count items", {
				name: "Maria",
				count: 3,
			}),
		).toBe("Maria tiene 3 artículos");
	});
});
