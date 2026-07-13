import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const packageRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: [`${packageRoot}tests/setup.ts`],
	},
});
