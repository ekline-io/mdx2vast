import { mdxjs } from "micromark-extension-mdxjs";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mathFromMarkdown } from "mdast-util-math";
import { math } from "micromark-extension-math";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { toHast } from "mdast-util-to-hast";
import { h } from "hastscript";
import { toHtml } from "hast-util-to-html";

const mdxNodes = [
  "mdxjsEsm",
  "mdxFlowExpression",
  "mdxJsxFlowElement",
  "mdxJsxTextElement",
  "mdxTextExpression",
];

// Mintlify components that contain prose (should convert children to HTML for Vale)
const MINTLIFY_PROSE_COMPONENTS = new Set([
  "Note", "Warning", "Info", "Tip", "Check", "Callout",
  "Card", "CardGroup", "Accordion", "AccordionGroup", "Expandable",
  "Columns", "Column", "Frame", "Steps", "Step", "Tabs", "Tab",
  "Tooltip", "ParamField", "ResponseField", "Param", "Update",
  "Aside", "Definition",
]);

function isComment(source) {
  return source.startsWith("{/*") && source.endsWith("*/}");
}

function createCustomHandler(doc) {
  return function customHandler(state, node, parent) {
    const start = node.position.start.offset;
    const end = node.position.end.offset;

    const source = doc.slice(start, end);
    if (node.type === "mdxFlowExpression" && isComment(source)) {
      return { type: "comment", value: source.slice(3, -3) };
    } else if (mdxNodes.includes(node.type)) {
      const className = `mdxNode ${node.type}`;
      if (source.includes("\n")) {
        return h("pre", h("code", { className }, source));
      } else {
        return h("code", { className }, source);
      }
    }

    return null;
  };
}

// JSX handler with Mintlify support
function createJsxHandler(doc) {
  const mintlifyMode = /@mintlify\//.test(doc);

  return function jsxHandler(state, node) {
    const source = doc.slice(node.position.start.offset, node.position.end.offset);
    const name = node.name;
    const className = `mdxNode ${node.type}`;
    const hasChildren = node.children && node.children.length > 0;

    // Mintlify mode - convert prose component children to HTML for Vale analysis
    if (mintlifyMode && hasChildren && MINTLIFY_PROSE_COMPONENTS.has(name)) {
      return h("div", { className, "data-component": name }, state.all(node));
    }

    // Default (original behavior) - wrap in code/pre+code
    return source.includes("\n")
      ? h("pre", h("code", { className }, source))
      : h("code", { className }, source);
  };
}

function toValeAST(doc) {
  const mdast = fromMarkdown(doc, {
    extensions: [mdxjs(), math()],
    mdastExtensions: [mdxFromMarkdown(), mathFromMarkdown()],
  });

  const customHandler = createCustomHandler(doc);
  const jsxHandler = createJsxHandler(doc);

  const hast = toHast(mdast, {
    allowDangerousHtml: true,
    passThrough: mdxNodes,
    handlers: {
      mdxjsEsm: customHandler,
      mdxFlowExpression: customHandler,
      mdxTextExpression: customHandler,
      mdxJsxFlowElement: jsxHandler,
      mdxJsxTextElement: jsxHandler,
    },
  });

  return toHtml(hast);
}

export { toValeAST };
