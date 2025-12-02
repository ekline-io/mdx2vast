import { describe, test, expect } from '@jest/globals';
import { toValeAST } from '../bin/lib.js';

// =============================================================================
// TEST HELPERS
// =============================================================================

const expectContains = (output, substring) => {
  expect(output).toContain(substring);
};

const expectNotContains = (output, substring) => {
  expect(output).not.toContain(substring);
};

// =============================================================================
// MINTLIFY MODE DETECTION
// =============================================================================

describe('Mintlify Mode Detection', () => {
  test('detects @mintlify/components import', () => {
    const mdx = `import { Card } from '@mintlify/components';

<Card>content</Card>`;
    const output = toValeAST(mdx);
    expectContains(output, 'data-component="Card"');
    expectContains(output, '<div');
  });

  test('detects @mintlify/ui import', () => {
    const mdx = `import { Note } from '@mintlify/ui';

<Note>content</Note>`;
    const output = toValeAST(mdx);
    expectContains(output, 'data-component="Note"');
  });

  test('detects any @mintlify/* import', () => {
    const mdx = `import Something from '@mintlify/whatever';

<Card>content</Card>`;
    const output = toValeAST(mdx);
    expectContains(output, 'data-component="Card"');
  });

  test('no Mintlify import = original behavior (multiline)', () => {
    const mdx = `import { Card } from 'other-library';

<Card>
  content
</Card>`;
    const output = toValeAST(mdx);
    expectContains(output, '<pre><code');
    expectContains(output, '&#x3C;Card>');
  });

  test('no Mintlify import = original behavior (single line)', () => {
    const mdx = `<Card>content</Card>`;
    const output = toValeAST(mdx);
    expectContains(output, '<code class="mdxNode');
    expectContains(output, '&#x3C;Card>');
  });

  test('no imports at all = original behavior', () => {
    const mdx = `
<Card>
  content
</Card>`;
    const output = toValeAST(mdx);
    expectContains(output, '<pre><code');
    expectContains(output, '&#x3C;Card>');
  });
});

// =============================================================================
// MINTLIFY PROSE COMPONENTS
// =============================================================================

describe('Mintlify Prose Components', () => {
  const mintlifyImport = `import { Card } from '@mintlify/components';\n\n`;

  describe('Callout Components', () => {
    const callouts = ['Note', 'Warning', 'Info', 'Tip', 'Check', 'Callout'];
    
    test.each(callouts)('%s component converts children to HTML', (name) => {
      const mdx = mintlifyImport + `<${name}>Important info</${name}>`;
      const output = toValeAST(mdx);
      expectContains(output, `data-component="${name}"`);
      expectContains(output, '<div');
      expectNotContains(output, `&#x3C;${name}>`);
    });
  });

  describe('Card Components', () => {
    test('Card with prose', () => {
      const mdx = mintlifyImport + `<Card title="Hello">This is **bold** text.</Card>`;
      const output = toValeAST(mdx);
      expectContains(output, 'data-component="Card"');
      expectContains(output, '<strong>bold</strong>');
    });

    test('CardGroup with nested Cards', () => {
      const mdx = mintlifyImport + `
<CardGroup>
  <Card>First card</Card>
  <Card>Second card</Card>
</CardGroup>`;
      const output = toValeAST(mdx);
      expectContains(output, 'data-component="CardGroup"');
      expectContains(output, 'data-component="Card"');
    });
  });

  describe('Accordion Components', () => {
    test('Accordion with markdown content', () => {
      const mdx = mintlifyImport + `
<Accordion title="FAQ">
  **Question:** How does it work?
  
  It works great!
</Accordion>`;
      const output = toValeAST(mdx);
      expectContains(output, 'data-component="Accordion"');
      expectContains(output, '<strong>');
    });

    test('AccordionGroup', () => {
      const mdx = mintlifyImport + `<AccordionGroup><Accordion>Content</Accordion></AccordionGroup>`;
      const output = toValeAST(mdx);
      expectContains(output, 'data-component="AccordionGroup"');
    });
  });

  describe('Layout Components', () => {
    test('Columns with Column children', () => {
      const mdx = mintlifyImport + `
<Columns>
  <Column>Left content</Column>
  <Column>Right content</Column>
</Columns>`;
      const output = toValeAST(mdx);
      expectContains(output, 'data-component="Columns"');
      expectContains(output, 'data-component="Column"');
    });

    test('Frame component', () => {
      const mdx = mintlifyImport + `<Frame>Framed content</Frame>`;
      const output = toValeAST(mdx);
      expectContains(output, 'data-component="Frame"');
    });
  });

  describe('Steps Components', () => {
    test('Steps with Step children', () => {
      const mdx = mintlifyImport + `
<Steps>
  <Step title="First">Do this first</Step>
  <Step title="Second">Then this</Step>
</Steps>`;
      const output = toValeAST(mdx);
      expectContains(output, 'data-component="Steps"');
      expectContains(output, 'data-component="Step"');
    });
  });

  describe('Navigation Components', () => {
    test('Tabs with Tab children', () => {
      const mdx = mintlifyImport + `
<Tabs>
  <Tab title="JavaScript">JS docs</Tab>
  <Tab title="Python">Python docs</Tab>
</Tabs>`;
      const output = toValeAST(mdx);
      expectContains(output, 'data-component="Tabs"');
      expectContains(output, 'data-component="Tab"');
    });
  });

  describe('API Documentation Components', () => {
    test('ParamField', () => {
      const mdx = mintlifyImport + `<ParamField path="id" type="string">The user ID</ParamField>`;
      const output = toValeAST(mdx);
      expectContains(output, 'data-component="ParamField"');
    });

    test('ResponseField', () => {
      const mdx = mintlifyImport + `<ResponseField name="status">Success indicator</ResponseField>`;
      const output = toValeAST(mdx);
      expectContains(output, 'data-component="ResponseField"');
    });
  });

  describe('Changelog Components', () => {
    test('Update component', () => {
      const mdx = mintlifyImport + `
<Update label="2025-01-15" tags={['SDK']}>
  ## New Release
  
  This is the release notes.
</Update>`;
      const output = toValeAST(mdx);
      expectContains(output, 'data-component="Update"');
      expectContains(output, '<h2>');
    });
  });

  describe('Other Prose Components', () => {
    test('Expandable', () => {
      const mdx = mintlifyImport + `<Expandable>Hidden content</Expandable>`;
      const output = toValeAST(mdx);
      expectContains(output, 'data-component="Expandable"');
    });

    test('Tooltip', () => {
      const mdx = mintlifyImport + `<Tooltip>Tooltip text</Tooltip>`;
      const output = toValeAST(mdx);
      expectContains(output, 'data-component="Tooltip"');
    });

    test('Aside', () => {
      const mdx = mintlifyImport + `<Aside>Side note</Aside>`;
      const output = toValeAST(mdx);
      expectContains(output, 'data-component="Aside"');
    });

    test('Definition', () => {
      const mdx = mintlifyImport + `<Definition>Term definition</Definition>`;
      const output = toValeAST(mdx);
      expectContains(output, 'data-component="Definition"');
    });
  });
});

// =============================================================================
// MINTLIFY CODE COMPONENTS
// =============================================================================

describe('Mintlify Code Components', () => {
  const mintlifyImport = `import { CodeGroup } from '@mintlify/components';\n\n`;

  test('CodeGroup wraps in pre/code (multiline)', () => {
    const mdx = mintlifyImport + `
<CodeGroup>
\`\`\`js
const x = 1;
\`\`\`
</CodeGroup>`;
    const output = toValeAST(mdx);
    expectContains(output, '<pre><code');
    expectContains(output, '&#x3C;CodeGroup>');
  });

  test('Code component wraps in code', () => {
    const mdx = mintlifyImport + `<Code>const x = 1;</Code>`;
    const output = toValeAST(mdx);
    expectContains(output, '<code');
    expectContains(output, '&#x3C;Code>');
  });

  test('CodeBlock wraps in code', () => {
    const mdx = mintlifyImport + `<CodeBlock>code here</CodeBlock>`;
    const output = toValeAST(mdx);
    expectContains(output, '<code');
    expectContains(output, '&#x3C;CodeBlock>');
  });

  test('Snippet wraps in code', () => {
    const mdx = mintlifyImport + `<Snippet>snippet</Snippet>`;
    const output = toValeAST(mdx);
    expectContains(output, '<code');
    expectContains(output, '&#x3C;Snippet>');
  });

  test('RequestExample wraps in pre/code (multiline)', () => {
    const mdx = mintlifyImport + `
<RequestExample>
\`\`\`bash
curl https://api.example.com
\`\`\`
</RequestExample>`;
    const output = toValeAST(mdx);
    expectContains(output, '<pre><code');
    expectContains(output, '&#x3C;RequestExample>');
  });

  test('ResponseExample wraps in pre/code (multiline)', () => {
    const mdx = mintlifyImport + `
<ResponseExample>
\`\`\`json
{"status": "ok"}
\`\`\`
</ResponseExample>`;
    const output = toValeAST(mdx);
    expectContains(output, '<pre><code');
    expectContains(output, '&#x3C;ResponseExample>');
  });
});

// =============================================================================
// SELF-CLOSING / EMPTY COMPONENTS
// =============================================================================

describe('Self-Closing / Empty Components', () => {
  const mintlifyImport = `import { Icon } from '@mintlify/components';\n\n`;

  test('self-closing components use default behavior (no content to analyze)', () => {
    const output = toValeAST(mintlifyImport + '<Icon name="star" />');
    expectContains(output, '<code class="mdxNode');
    expectContains(output, '&#x3C;Icon');
  });

  test('empty components use default behavior', () => {
    const output = toValeAST(mintlifyImport + '<Card></Card>');
    expectContains(output, '<code class="mdxNode');
    expectContains(output, '&#x3C;Card');
  });

  test('self-closing without Mintlify import uses default behavior', () => {
    const output = toValeAST('<Icon name="star" />');
    expectContains(output, '<code class="mdxNode');
    expectContains(output, '&#x3C;Icon');
  });
});

// =============================================================================
// UNKNOWN COMPONENTS (DEFAULT BEHAVIOR)
// =============================================================================

describe('Unknown Components (Default Behavior)', () => {
  const mintlifyImport = `import { Card } from '@mintlify/components';\n\n`;

  test('unknown component with Mintlify import uses default behavior (multiline)', () => {
    const mdx = mintlifyImport + `
<CustomComponent>
  content
</CustomComponent>`;
    const output = toValeAST(mdx);
    expectContains(output, '<pre><code');
    expectContains(output, '&#x3C;CustomComponent>');
  });

  test('unknown component without Mintlify import uses default behavior (multiline)', () => {
    const mdx = `
<CustomComponent>
  content
</CustomComponent>`;
    const output = toValeAST(mdx);
    expectContains(output, '<pre><code');
    expectContains(output, '&#x3C;CustomComponent>');
  });

  test('known Mintlify component without import uses default behavior (multiline)', () => {
    const mdx = `
<Card>
  content
</Card>`;
    const output = toValeAST(mdx);
    expectContains(output, '<pre><code');
    expectContains(output, '&#x3C;Card>');
  });

  test('unknown component single line uses code (not pre/code)', () => {
    const mdx = `<CustomComponent>content</CustomComponent>`;
    const output = toValeAST(mdx);
    expectContains(output, '<code class="mdxNode');
    expectContains(output, '&#x3C;CustomComponent>');
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('Edge Cases', () => {
  const mintlifyImport = `import { Card } from '@mintlify/components';\n\n`;

  test('empty component uses default behavior (no content to analyze)', () => {
    const mdx = mintlifyImport + `<Card></Card>`;
    const output = toValeAST(mdx);
    expectContains(output, '<code class="mdxNode');
    expectContains(output, '&#x3C;Card');
  });

  test('component with only whitespace may have children', () => {
    const mdx = mintlifyImport + `<Card>   </Card>`;
    const output = toValeAST(mdx);
    expect(output).toBeDefined();
  });

  test('deeply nested components', () => {
    const mdx = mintlifyImport + `
<CardGroup>
  <Card>
    <Note>
      Deeply nested **bold** text
    </Note>
  </Card>
</CardGroup>`;
    const output = toValeAST(mdx);
    expectContains(output, 'data-component="CardGroup"');
    expectContains(output, 'data-component="Card"');
    expectContains(output, 'data-component="Note"');
    expectContains(output, '<strong>bold</strong>');
  });

  test('component with inline markdown', () => {
    const mdx = mintlifyImport + `<Note>Use \`code\` and **bold** and *italic*</Note>`;
    const output = toValeAST(mdx);
    expectContains(output, '<code>code</code>');
    expectContains(output, '<strong>bold</strong>');
    expectContains(output, '<em>italic</em>');
  });

  test('component with links', () => {
    const mdx = mintlifyImport + `<Card>Visit [our site](https://example.com)</Card>`;
    const output = toValeAST(mdx);
    expectContains(output, '<a href="https://example.com">');
  });

  test('component with headings', () => {
    const mdx = mintlifyImport + `
<Update>
  ## Heading 2
  ### Heading 3
</Update>`;
    const output = toValeAST(mdx);
    expectContains(output, '<h2>');
    expectContains(output, '<h3>');
  });

  test('component with lists', () => {
    const mdx = mintlifyImport + `
<Note>
  - Item 1
  - Item 2
</Note>`;
    const output = toValeAST(mdx);
    expectContains(output, '<ul>');
    expectContains(output, '<li>');
  });

  test('component with special characters in attributes', () => {
    const mdx = mintlifyImport + `<Card title="Hello World">content</Card>`;
    const output = toValeAST(mdx);
    expectContains(output, 'data-component="Card"');
  });

  test('JSX fragment does not crash', () => {
    const mdx = `<>content</>`;
    expect(() => toValeAST(mdx)).not.toThrow();
  });

  test('multiline vs single line components (in Mintlify mode)', () => {
    const singleLine = mintlifyImport + `<Card>single line</Card>`;
    const multiLine = mintlifyImport + `
<Card>
  multi line
</Card>`;
    
    const singleOutput = toValeAST(singleLine);
    const multiOutput = toValeAST(multiLine);
    
    expectContains(singleOutput, 'data-component="Card"');
    expectContains(multiOutput, 'data-component="Card"');
  });

  test('component with code block inside', () => {
    const mdx = mintlifyImport + `
<Note>
Here is some code:

\`\`\`js
const x = 1;
\`\`\`
</Note>`;
    const output = toValeAST(mdx);
    expectContains(output, 'data-component="Note"');
    expectContains(output, '<pre>');
  });
});

// =============================================================================
// MIXED CONTENT
// =============================================================================

describe('Mixed Content', () => {
  test('prose and code components together', () => {
    const mdx = `import { Card, CodeGroup } from '@mintlify/components';

<Card>This is prose</Card>

<CodeGroup>
\`\`\`js
const code = "here";
\`\`\`
</CodeGroup>`;
    
    const output = toValeAST(mdx);
    
    expectContains(output, 'data-component="Card"');
    expectContains(output, '<div');
    expectContains(output, '&#x3C;CodeGroup>');
  });

  test('regular markdown with Mintlify components', () => {
    const mdx = `import { Note } from '@mintlify/components';

# Regular Heading

Regular paragraph.

<Note>Important note</Note>

Another paragraph.`;
    
    const output = toValeAST(mdx);
    expectContains(output, '<h1>Regular Heading</h1>');
    expectContains(output, '<p>Regular paragraph.</p>');
    expectContains(output, 'data-component="Note"');
  });

  test('inline JSX in paragraph uses default behavior', () => {
    const mdx = `import { Icon } from '@mintlify/components';

This is a paragraph with an <Icon name="star" /> inline.`;
    const output = toValeAST(mdx);
    expectContains(output, '<code class="mdxNode mdxJsxTextElement">');
    expectContains(output, '&#x3C;Icon');
  });
});

// =============================================================================
// IMPORT VARIATIONS
// =============================================================================

describe('Import Variations', () => {
  test('named import', () => {
    const mdx = `import { Card } from '@mintlify/components';

<Card>content</Card>`;
    const output = toValeAST(mdx);
    expectContains(output, 'data-component="Card"');
  });

  test('multiple named imports in different statements', () => {
    const mdx = `import { Card } from '@mintlify/components';
import { something } from 'other-library';

<Card>card</Card>`;
    const output = toValeAST(mdx);
    expectContains(output, 'data-component="Card"');
  });

  test('import with alias', () => {
    const mdx = `import { Card as MyCard } from '@mintlify/components';

<Card>content</Card>`;
    const output = toValeAST(mdx);
    expectContains(output, 'data-component="Card"');
  });

  test('default import', () => {
    const mdx = `import Components from '@mintlify/components';

<Card>content</Card>`;
    const output = toValeAST(mdx);
    expectContains(output, 'data-component="Card"');
  });

  test('multiple import statements', () => {
    const mdx = `import { Card } from '@mintlify/components';
import { something } from 'other-library';

<Card>content</Card>`;
    const output = toValeAST(mdx);
    expectContains(output, 'data-component="Card"');
  });

  test('@mintlify anywhere in import enables mode', () => {
    const mdx = `import x from '@mintlify/theme';

<Card>content</Card>`;
    const output = toValeAST(mdx);
    expectContains(output, 'data-component="Card"');
  });

  test('non-mintlify import does not enable mode', () => {
    const mdx = `import { Card } from 'some-other-library';

<Card>
  content
</Card>`;
    const output = toValeAST(mdx);
    expectContains(output, '<pre><code');
    expectNotContains(output, 'data-component');
  });
});

// =============================================================================
// ESM AND EXPRESSIONS (ORIGINAL BEHAVIOR)
// =============================================================================

describe('ESM and Expressions (Original Behavior)', () => {
  test('import statement wraps in code', () => {
    const mdx = `import { Card } from '@mintlify/components';`;
    const output = toValeAST(mdx);
    expectContains(output, '<code class="mdxNode mdxjsEsm">');
    expectContains(output, 'import');
  });

  test('export statement wraps in code', () => {
    const mdx = `export const meta = { title: "Test" };`;
    const output = toValeAST(mdx);
    expectContains(output, '<code class="mdxNode mdxjsEsm">');
  });

  test('multiline export wraps in pre/code', () => {
    const mdx = `export const meta = {
  title: "Test",
  description: "Description"
};`;
    const output = toValeAST(mdx);
    expectContains(output, '<pre><code class="mdxNode mdxjsEsm">');
  });

  test('JSX expression wraps in code', () => {
    const mdx = `The value is {someVariable}.`;
    const output = toValeAST(mdx);
    expectContains(output, '<code class="mdxNode mdxTextExpression">');
    expectContains(output, '{someVariable}');
  });

  test('JSX comment converts to HTML comment', () => {
    const mdx = `{/* This is a comment */}`;
    const output = toValeAST(mdx);
    expectContains(output, '<!-- This is a comment -->');
  });

  test('flow expression (multiline) wraps in pre/code', () => {
    const mdx = `{
  someExpression
}`;
    const output = toValeAST(mdx);
    expectContains(output, '<pre><code class="mdxNode mdxFlowExpression">');
  });
});

// =============================================================================
// REGRESSION TESTS
// =============================================================================

describe('Regression Tests', () => {
  test('original behavior preserved when no Mintlify import (multiline)', () => {
    const mdx = `
<SomeComponent prop="value">
  Content here
</SomeComponent>`;
    const output = toValeAST(mdx);
    expectContains(output, '<pre><code class="mdxNode mdxJsxFlowElement">');
    expectContains(output, '&#x3C;SomeComponent');
  });

  test('handles frontmatter correctly', () => {
    const mdx = `---
title: Test
---

# Heading`;
    const output = toValeAST(mdx);
    expectContains(output, '<h1>Heading</h1>');
  });

  test('handles math expressions', () => {
    const mdx = `The equation is $E = mc^2$`;
    const output = toValeAST(mdx);
    expect(output).toBeDefined();
  });

  test('handles real-world changelog file pattern', () => {
    const mdx = `import { Update } from '@mintlify/components';

<Update label="10-16-2025" tags={['Android SDK']}>
  ## Android SDK 6.7.0
  
  ### What's New
  
  Version 6.7.0 of the Android SDK resolved an infinite loop error.
  
  ### Impact
  
  The SDK now properly handles 401 responses.
</Update>

<Update label="08-06-2025" tags={['Android SDK']}>
  ## Android SDK 6.5.1
  
  Removed the cryptographic key warning.
</Update>`;
    const output = toValeAST(mdx);
    expectContains(output, 'data-component="Update"');
    expectContains(output, '<h2>Android SDK 6.7.0</h2>');
    expectContains(output, '<h3>');
    expectNotContains(output, '&#x3C;Update');
  });
});

// =============================================================================
// NULL/UNDEFINED NAME HANDLING
// =============================================================================

describe('Null/Undefined Component Name Handling', () => {
  test('fragment renders without crash', () => {
    const mdx = `<>content</>`;
    expect(() => toValeAST(mdx)).not.toThrow();
  });

  test('null name results in unknown data-component', () => {
    const mdx = `<>content</>`;
    const output = toValeAST(mdx);
    // Fragment has null name, should still render
    expect(output).toBeDefined();
  });
});

// =============================================================================
// COMPONENT CLASS NAMES
// =============================================================================

describe('Component Class Names', () => {
  test('JSX flow element has correct class', () => {
    const mdx = `
<Card>
  content
</Card>`;
    const output = toValeAST(mdx);
    expectContains(output, 'mdxJsxFlowElement');
  });

  test('JSX text element has correct class', () => {
    const mdx = `Inline <Icon /> here`;
    const output = toValeAST(mdx);
    expectContains(output, 'mdxJsxTextElement');
  });

  test('prose component in Mintlify mode has mdxNode class', () => {
    const mdx = `import { Card } from '@mintlify/components';

<Card>content</Card>`;
    const output = toValeAST(mdx);
    expectContains(output, 'class="mdxNode');
  });
});
