import { vi } from "vitest";

// Mock @inertiajs/react
vi.mock("@inertiajs/react", () => {
	let pageProps: Record<string, unknown> = {};

	return {
		usePage: () => ({ props: pageProps }),
		router: {
			visit: vi.fn(),
			reload: vi.fn(),
		},
		__setPageProps: (props: Record<string, unknown>) => {
			pageProps = props;
		},
	};
});
