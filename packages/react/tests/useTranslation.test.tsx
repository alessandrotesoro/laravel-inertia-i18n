import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../src/I18nProvider";
import { useTranslation } from "../src/useTranslation";

// Access the mock helper
const inertiaModule = await import("@inertiajs/react");
const setPageProps = (
	inertiaModule as unknown as {
		__setPageProps: (p: Record<string, unknown>) => void;
	}
).__setPageProps;

function createWrapper(i18nProps: Record<string, unknown>) {
	setPageProps({ i18n: i18nProps });
	return function Wrapper({ children }: { children: ReactNode }) {
		return <I18nProvider>{children}</I18nProvider>;
	};
}

describe("useTranslation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("throws when used outside I18nProvider", () => {
		setPageProps({});
		expect(() => {
			renderHook(() => useTranslation());
		}).toThrow("useTranslation must be used within an <I18nProvider>");
	});

	it("returns t, locale, and setLocale", () => {
		const wrapper = createWrapper({
			locale: "en",
			fallbackLocale: "en",
			translations: {},
		});

		const { result } = renderHook(() => useTranslation(), { wrapper });

		expect(result.current.t).toBeTypeOf("function");
		expect(result.current.locale).toBe("en");
		expect(result.current.setLocale).toBeTypeOf("function");
	});

	it("t() translates a simple key", () => {
		const wrapper = createWrapper({
			locale: "es",
			fallbackLocale: "en",
			translations: { Hello: "Hola" },
		});

		const { result } = renderHook(() => useTranslation(), { wrapper });

		expect(result.current.t("Hello")).toBe("Hola");
	});

	it("t() falls back to key when not found", () => {
		const wrapper = createWrapper({
			locale: "es",
			fallbackLocale: "en",
			translations: {},
		});

		const { result } = renderHook(() => useTranslation(), { wrapper });

		expect(result.current.t("Missing")).toBe("Missing");
	});

	it("t() interpolates :name placeholders", () => {
		const wrapper = createWrapper({
			locale: "es",
			fallbackLocale: "en",
			translations: { "Hello, :name!": "¡Hola, :name!" },
		});

		const { result } = renderHook(() => useTranslation(), { wrapper });

		expect(result.current.t("Hello, :name!", { name: "World" })).toBe(
			"¡Hola, World!",
		);
	});

	it("t() handles pluralization via count option", () => {
		const wrapper = createWrapper({
			locale: "en",
			fallbackLocale: "en",
			translations: {
				"One item|:count items": "One item|:count items",
			},
		});

		const { result } = renderHook(() => useTranslation(), { wrapper });

		expect(result.current.t("One item|:count items", { count: 1 })).toBe(
			"One item",
		);
		expect(result.current.t("One item|:count items", { count: 5 })).toBe(
			"5 items",
		);
	});

	it("setLocale calls router.reload", () => {
		const wrapper = createWrapper({
			locale: "en",
			fallbackLocale: "en",
			translations: {},
		});

		const { result } = renderHook(() => useTranslation(), { wrapper });

		result.current.setLocale("fr");

		expect(inertiaModule.router.reload).toHaveBeenCalledWith({
			data: { _locale: "fr" },
		});
	});

	it("locale reflects current locale from props", () => {
		const wrapper = createWrapper({
			locale: "ja",
			fallbackLocale: "en",
			translations: {},
		});

		const { result } = renderHook(() => useTranslation(), { wrapper });

		expect(result.current.locale).toBe("ja");
	});
});
