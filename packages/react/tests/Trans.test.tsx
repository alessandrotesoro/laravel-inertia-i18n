import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { I18nProvider } from "../src/I18nProvider";
import { Trans } from "../src/Trans";

const inertiaModule = await import("@inertiajs/react");
const setPageProps = (
	inertiaModule as unknown as {
		__setPageProps: (p: Record<string, unknown>) => void;
	}
).__setPageProps;

function Wrapper({ children }: { children: ReactNode }) {
	return <I18nProvider>{children}</I18nProvider>;
}

describe("Trans", () => {
	beforeEach(() => {
		setPageProps({
			i18n: {
				locale: "es",
				fallbackLocale: "en",
				translations: {
					"Hello, :name!": "¡Hola, :name!",
					"Please <link>click here</link> to continue.":
						"Por favor <link>haz clic aquí</link> para continuar.",
					"Welcome <bold>:name</bold>!": "¡Bienvenido <bold>:name</bold>!",
					"One item|:count items": "Un artículo|:count artículos",
					"Break<br />here": "Salto<br />aquí",
				},
			},
		});
	});

	it("renders plain text translation", () => {
		render(
			<Wrapper>
				<Trans i18nKey="Hello, :name!" values={{ name: "World" }} />
			</Wrapper>,
		);

		expect(screen.getByText("¡Hola, World!")).toBeTruthy();
	});

	it("renders with component interpolation", () => {
		render(
			<Wrapper>
				<Trans
					i18nKey="Please <link>click here</link> to continue."
					components={{ link: <a href="/next" data-testid="link" /> }}
				/>
			</Wrapper>,
		);

		const link = screen.getByTestId("link");
		expect(link.tagName).toBe("A");
		expect(link.getAttribute("href")).toBe("/next");
		expect(link.textContent).toBe("haz clic aquí");
	});

	it("renders with combined components and interpolation", () => {
		render(
			<Wrapper>
				<Trans
					i18nKey="Welcome <bold>:name</bold>!"
					values={{ name: "Alessandro" }}
					components={{ bold: <strong data-testid="bold" /> }}
				/>
			</Wrapper>,
		);

		const bold = screen.getByTestId("bold");
		expect(bold.tagName).toBe("STRONG");
		expect(bold.textContent).toBe("Alessandro");
	});

	it("handles pluralization with count", () => {
		render(
			<Wrapper>
				<Trans i18nKey="One item|:count items" count={5} />
			</Wrapper>,
		);

		expect(screen.getByText("5 artículos")).toBeTruthy();
	});

	it("handles self-closing tags", () => {
		render(
			<Wrapper>
				<Trans
					i18nKey="Break<br />here"
					components={{ br: <br data-testid="br" /> }}
				/>
			</Wrapper>,
		);

		expect(screen.getByTestId("br")).toBeTruthy();
	});

	it("renders unknown tags as plain text", () => {
		render(
			<Wrapper>
				<Trans
					i18nKey="Please <link>click here</link> to continue."
					components={{}}
				/>
			</Wrapper>,
		);

		// Without a matching component, renders the tag as text
		expect(
			screen.getByText((content) => content.includes("haz clic aquí")),
		).toBeTruthy();
	});

	it("renders with wrapper element via as prop", () => {
		render(
			<Wrapper>
				<Trans i18nKey="Hello, :name!" values={{ name: "World" }} as="span" />
			</Wrapper>,
		);

		const span = screen.getByText("¡Hola, World!");
		expect(span.tagName).toBe("SPAN");
	});

	it("falls back to key when translation not found", () => {
		render(
			<Wrapper>
				<Trans i18nKey="Not translated" />
			</Wrapper>,
		);

		expect(screen.getByText("Not translated")).toBeTruthy();
	});

	it("throws when used outside I18nProvider", () => {
		setPageProps({});
		expect(() => {
			render(<Trans i18nKey="test" />);
		}).toThrow("<Trans> must be used within an <I18nProvider>");
	});

	describe("nested tags", () => {
		beforeEach(() => {
			setPageProps({
				i18n: {
					locale: "es",
					fallbackLocale: "en",
					translations: {
						"Read the <bold>important <link>docs</link></bold>.":
							"Lee los <bold>importantes <link>documentos</link></bold>.",
						"<outer>Hello <inner>world</inner></outer>":
							"<outer>Hola <inner>mundo</inner></outer>",
						"<a>one <b>two <c>three</c> two</b> one</a>":
							"<a>uno <b>dos <c>tres</c> dos</b> uno</a>",
					},
				},
			});
		});

		it("renders nested tags with different component types", () => {
			render(
				<Wrapper>
					<Trans
						i18nKey="Read the <bold>important <link>docs</link></bold>."
						components={{
							bold: <strong data-testid="bold" />,
							link: <a href="/docs" data-testid="link" />,
						}}
					/>
				</Wrapper>,
			);

			const bold = screen.getByTestId("bold");
			expect(bold.tagName).toBe("STRONG");
			expect(bold.textContent).toBe("importantes documentos");

			const link = screen.getByTestId("link");
			expect(link.tagName).toBe("A");
			expect(link.getAttribute("href")).toBe("/docs");
			expect(link.textContent).toBe("documentos");

			// link should be inside bold
			expect(bold.contains(link)).toBe(true);
		});

		it("renders simple nested wrapper", () => {
			render(
				<Wrapper>
					<Trans
						i18nKey="<outer>Hello <inner>world</inner></outer>"
						components={{
							outer: <div data-testid="outer" />,
							inner: <em data-testid="inner" />,
						}}
					/>
				</Wrapper>,
			);

			const outer = screen.getByTestId("outer");
			const inner = screen.getByTestId("inner");
			expect(outer.contains(inner)).toBe(true);
			expect(inner.textContent).toBe("mundo");
			expect(outer.textContent).toBe("Hola mundo");
		});

		it("renders three levels of nesting", () => {
			render(
				<Wrapper>
					<Trans
						i18nKey="<a>one <b>two <c>three</c> two</b> one</a>"
						components={{
							a: <div data-testid="a" />,
							b: <span data-testid="b" />,
							c: <em data-testid="c" />,
						}}
					/>
				</Wrapper>,
			);

			const a = screen.getByTestId("a");
			const b = screen.getByTestId("b");
			const c = screen.getByTestId("c");

			expect(a.contains(b)).toBe(true);
			expect(b.contains(c)).toBe(true);
			expect(c.textContent).toBe("tres");
			expect(a.textContent).toBe("uno dos tres dos uno");
		});
	});
});
