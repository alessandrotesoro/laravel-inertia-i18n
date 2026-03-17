import HTML, { type ASTNode } from "html-parse-stringify";
import { cloneElement, Fragment, type ReactNode, useMemo } from "react";
import { translate } from "./translator";
import type { TranslationOptions, TransProps } from "./types";
import { useI18nContext } from "./useI18nContext";

// Prefix added to tag names before parsing to avoid collisions with HTML
// void elements (e.g. <link>, <br>, <hr>, <img>). The parser from
// html-parse-stringify treats void elements as self-closing and discards
// their content, so we namespace tags to prevent that.
const TAG_PREFIX = "i18n-";

/**
 * Adds a namespace prefix to all tag names in a translation string so that
 * html-parse-stringify doesn't treat them as HTML void elements.
 *
 * <link>text</link>   → <i18n-link>text</i18n-link>
 * <br />              → <i18n-br />
 */
function prefixTags(str: string): string {
	return str
		.replace(/<(\w+)([\s>/])/g, `<${TAG_PREFIX}$1$2`)
		.replace(/<\/(\w+)>/g, `</${TAG_PREFIX}$1>`);
}

/**
 * Strips the namespace prefix from a tag name to recover the original
 * component key used in the `components` prop.
 */
function stripPrefix(name: string): string {
	return name.startsWith(TAG_PREFIX) ? name.slice(TAG_PREFIX.length) : name;
}

/**
 * Recursively maps an AST (from html-parse-stringify) to React nodes,
 * replacing named tags with components from the `components` prop.
 */
function mapAST(
	nodes: ASTNode[],
	components: Record<string, React.ReactElement>,
	keyPrefix: string,
): ReactNode[] {
	return nodes.map((node, index) => {
		const key = `${keyPrefix}-${index}`;

		if (node.type === "text") {
			return node.content ?? "";
		}

		if (node.type === "comment") {
			return null;
		}

		const rawName = node.name ?? "";
		const name = stripPrefix(rawName);
		const component = components[name];

		// No matching component — render as plain text
		if (!component) {
			if (node.voidElement) {
				return `<${name} />`;
			}
			const inner = node.children ? mapAST(node.children, components, key) : [];
			return (
				<Fragment key={key}>
					{`<${name}>`}
					{inner}
					{`</${name}>`}
				</Fragment>
			);
		}

		// Void/self-closing element
		if (node.voidElement || !node.children?.length) {
			return cloneElement(component, { key });
		}

		const children = mapAST(node.children, components, key);
		return cloneElement(component, { key }, ...children);
	});
}

/**
 * Component for embedding React components within translation strings.
 *
 * Uses html-parse-stringify to build a proper AST, supporting nested tags.
 *
 * @example
 * ```json
 * // lang/es.json
 * { "Please <link>click here</link> to continue.": "Por favor <link>haz clic aquí</link> para continuar." }
 * ```
 *
 * ```tsx
 * <Trans
 *   i18nKey="Please <link>click here</link> to continue."
 *   components={{ link: <a href="/next" /> }}
 * />
 * // Renders: Por favor <a href="/next">haz clic aquí</a> para continuar.
 *
 * // Nested tags work too:
 * <Trans
 *   i18nKey="Read the <bold>important <link>docs</link></bold>."
 *   components={{ bold: <strong />, link: <a href="/docs" /> }}
 * />
 * ```
 */
export function Trans({
	i18nKey,
	values,
	count,
	components,
	as: Wrapper,
}: TransProps) {
	const ctx = useI18nContext("<Trans>");

	const serializedValues = JSON.stringify(values);
	const componentKeys = components
		? Object.keys(components).sort().join(",")
		: "";

	// biome-ignore lint/correctness/useExhaustiveDependencies: values and components are intentionally replaced by their serialized proxies (serializedValues, componentKeys) to avoid re-parsing on every render when consumers pass inline objects.
	const parsed = useMemo(() => {
		const options: TranslationOptions = { ...values };
		if (count !== undefined) {
			options.count = count;
		}

		const translated = translate(ctx.translations, i18nKey, options);

		if (!components || componentKeys === "") {
			return { text: translated, ast: null };
		}

		return { text: translated, ast: HTML.parse(prefixTags(translated)) };
	}, [ctx.translations, i18nKey, serializedValues, count, componentKeys]);

	let content: ReactNode;
	if (parsed.ast && components) {
		content = mapAST(parsed.ast, components, "trans");
	} else {
		content = parsed.text;
	}

	return Wrapper ? <Wrapper>{content}</Wrapper> : content;
}
