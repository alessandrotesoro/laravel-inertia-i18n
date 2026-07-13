import { fileURLToPath } from "node:url";
import { defineConfig } from "tsup";

const packageRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	entry: [`${packageRoot}src/index.ts`],
	outDir: `${packageRoot}dist`,
	tsconfig: `${packageRoot}tsconfig.json`,
	format: ["esm", "cjs"],
	dts: true,
	sourcemap: true,
	clean: true,
	external: ["react", "react-dom", "@inertiajs/react", "@inertiajs/core"],
	jsx: "automatic",
});
