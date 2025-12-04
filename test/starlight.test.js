import { describe, test, expect } from '@jest/globals';
import { toValeAST } from '../bin/lib.js';

const starlightImport = `import { Aside, Card, CardGrid, LinkCard, Steps, Tabs, TabItem, FileTree, Badge, Icon } from '@astrojs/starlight/components';\n\n`;

// =============================================================================
// MODE DETECTION
// =============================================================================

describe('Astro Starlight Mode Detection', () => {
  test('detects @astrojs/starlight/components import', () => {
    const mdx = `import { Card } from '@astrojs/starlight/components';

<Card>content</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
    expect(output).toContain( '<div');
  });

  test('detects @astrojs/starlight import', () => {
    const mdx = `import { Aside } from '@astrojs/starlight/components';

<Aside>content</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Aside"');
  });

  test('detects any @astrojs/* import', () => {
    const mdx = `import Something from '@astrojs/whatever';

<Card>content</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
  });

  test('detects @astrojs in dynamic import comment', () => {
    const mdx = `// Using @astrojs/starlight
import { Aside } from '@astrojs/starlight/components';

<Aside>Note content</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Aside"');
  });

  test('no Starlight import = original behavior (multiline)', () => {
    const mdx = `import { Card } from 'other-library';

<Card>
  content
</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<pre><code');
    expect(output).toContain( '&#x3C;Card>');
  });

  test('no Starlight import = original behavior (single line)', () => {
    const mdx = `<Aside>content</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<code class="mdxNode');
    expect(output).toContain( '&#x3C;Aside>');
  });
});

// =============================================================================
// ASIDE COMPONENT (ALL VARIANTS)
// =============================================================================

describe('Starlight Aside Component', () => {
  test('Aside with default type (note)', () => {
    const mdx = starlightImport + `<Aside>This is a note.</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Aside"');
    expect(output).toContain( '<div');
    expect(output).toContain( 'This is a note.');
    expect(output).not.toContain( '&#x3C;Aside>');
  });

  test('Aside with type="note"', () => {
    const mdx = starlightImport + `<Aside type="note">Explicit note type</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Aside"');
  });

  test('Aside with type="tip"', () => {
    const mdx = starlightImport + `<Aside type="tip">Helpful tip here</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Aside"');
    expect(output).toContain( 'Helpful tip here');
  });

  test('Aside with type="caution"', () => {
    const mdx = starlightImport + `<Aside type="caution">Be careful with this!</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Aside"');
    expect(output).toContain( 'Be careful');
  });

  test('Aside with type="danger"', () => {
    const mdx = starlightImport + `<Aside type="danger">**Critical warning!**</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Aside"');
    expect(output).toContain( '<strong>Critical warning!</strong>');
  });

  test('Aside with custom title', () => {
    const mdx = starlightImport + `<Aside type="tip" title="Pro Tip">Custom title content</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Aside"');
    expect(output).toContain( 'Custom title content');
  });

  test('Aside with markdown formatting', () => {
    const mdx = starlightImport + `<Aside>
Use \`inline code\` and **bold** and *italic* and ~~strikethrough~~.
</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<code>inline code</code>');
    expect(output).toContain( '<strong>bold</strong>');
    expect(output).toContain( '<em>italic</em>');
  });

  test('Aside with links', () => {
    const mdx = starlightImport + `<Aside>
Check out [the docs](https://docs.astro.build) for more info.
</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<a href="https://docs.astro.build">');
    expect(output).toContain( 'the docs');
  });

  test('Aside with bullet list', () => {
    const mdx = starlightImport + `<Aside type="tip">
Consider these options:
- Option A
- Option B
- Option C
</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<ul>');
    expect(output).toContain( '<li>');
    expect(output).toContain( 'Option A');
  });

  test('Aside with numbered list', () => {
    const mdx = starlightImport + `<Aside>
Follow these steps:
1. First step
2. Second step
3. Third step
</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<ol>');
    expect(output).toContain( '<li>');
  });

  test('Aside with code block inside', () => {
    const mdx = starlightImport + `<Aside type="tip">
Here's an example:

\`\`\`js
const greeting = "Hello";
\`\`\`
</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Aside"');
    expect(output).toContain( '<pre>');
  });

  test('Aside with heading inside', () => {
    const mdx = starlightImport + `<Aside>
### Important Note

This is the content.
</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<h3>');
    expect(output).toContain( 'Important Note');
  });
});

// =============================================================================
// CARD COMPONENTS
// =============================================================================

describe('Starlight Card Components', () => {
  test('Card with title and prose', () => {
    const mdx = starlightImport + `<Card title="Getting Started">
Learn how to set up your project with **Starlight**.
</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
    expect(output).toContain( '<strong>Starlight</strong>');
  });

  test('Card with icon prop', () => {
    const mdx = starlightImport + `<Card title="Settings" icon="setting">
Configure your preferences here.
</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
    expect(output).toContain( 'Configure your preferences');
  });

  test('Card with complex markdown content', () => {
    const mdx = starlightImport + `<Card title="Features">
## Key Features

- **Fast**: Built on Astro
- **Flexible**: Highly customizable
- **Modern**: Latest web standards

Learn more at [our site](https://example.com).
</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
    expect(output).toContain( '<h2>');
    expect(output).toContain( '<ul>');
    expect(output).toContain( '<strong>Fast</strong>');
    expect(output).toContain( '<a href="https://example.com">');
  });

  test('CardGrid with multiple Cards', () => {
    const mdx = starlightImport + `<CardGrid>
  <Card title="First">Content one</Card>
  <Card title="Second">Content two</Card>
  <Card title="Third">Content three</Card>
</CardGrid>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="CardGrid"');
    expect(output.match(/data-component="Card"/g)).toHaveLength(3);
  });

  test('CardGrid with stagger prop', () => {
    const mdx = starlightImport + `<CardGrid stagger>
  <Card title="A">First card</Card>
  <Card title="B">Second card</Card>
</CardGrid>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="CardGrid"');
    expect(output).toContain( 'data-component="Card"');
  });

  test('LinkCard basic usage', () => {
    const mdx = starlightImport + `<LinkCard
  title="Documentation"
  description="Read the full documentation"
  href="/docs"
>
Additional info about the documentation.
</LinkCard>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="LinkCard"');
    expect(output).toContain( 'Additional info');
  });

  test('LinkCard in CardGrid', () => {
    const mdx = starlightImport + `<CardGrid>
  <LinkCard title="Guide" href="/guide">Start here</LinkCard>
  <LinkCard title="API" href="/api">Reference docs</LinkCard>
</CardGrid>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="CardGrid"');
    expect(output.match(/data-component="LinkCard"/g)).toHaveLength(2);
  });
});

// =============================================================================
// STEPS COMPONENT
// =============================================================================

describe('Starlight Steps Component', () => {
  test('Steps with ordered list', () => {
    const mdx = starlightImport + `<Steps>
1. Install dependencies
2. Configure settings
3. Run the build
</Steps>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Steps"');
    expect(output).toContain( '<ol>');
    expect(output).toContain( '<li>');
  });

  test('Steps with markdown in list items', () => {
    const mdx = starlightImport + `<Steps>
1. Run \`npm install\`
2. Edit **config.js**
3. Execute *build* command
</Steps>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Steps"');
    expect(output).toContain( '<code>npm install</code>');
    expect(output).toContain( '<strong>config.js</strong>');
    expect(output).toContain( '<em>build</em>');
  });

  test('Steps with nested content', () => {
    const mdx = starlightImport + `<Steps>
1. First step with details:
   - Sub-point A
   - Sub-point B

2. Second step with code:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Final step
</Steps>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Steps"');
    expect(output).toContain( '<ul>');
    expect(output).toContain( '<pre>');
  });
});

// =============================================================================
// TABS COMPONENTS
// =============================================================================

describe('Starlight Tabs Components', () => {
  test('Tabs with TabItem children', () => {
    const mdx = starlightImport + `<Tabs>
  <TabItem label="npm">
    \`npm install astro\`
  </TabItem>
  <TabItem label="yarn">
    \`yarn add astro\`
  </TabItem>
  <TabItem label="pnpm">
    \`pnpm add astro\`
  </TabItem>
</Tabs>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Tabs"');
    expect(output.match(/data-component="TabItem"/g)).toHaveLength(3);
  });

  test('TabItem with icon', () => {
    const mdx = starlightImport + `<Tabs>
  <TabItem label="Stars" icon="star">
    Star content here
  </TabItem>
  <TabItem label="Settings" icon="setting">
    Settings content here
  </TabItem>
</Tabs>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Tabs"');
    expect(output).toContain( 'data-component="TabItem"');
    expect(output).toContain( 'Star content here');
  });

  test('TabItem with complex markdown', () => {
    const mdx = starlightImport + `<Tabs>
  <TabItem label="JavaScript">
## JavaScript Setup

Install the package:

\`\`\`js
import { setup } from 'mylib';
setup();
\`\`\`

See the [JS docs](/js) for more.
  </TabItem>
  <TabItem label="Python">
## Python Setup

Install with pip:

\`\`\`python
import mylib
mylib.setup()
\`\`\`
  </TabItem>
</Tabs>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Tabs"');
    expect(output).toContain( '<h2>');
    expect(output).toContain( '<pre>');
    expect(output).toContain( '<a href="/js">');
  });

  test('nested Tabs (tabs within tabs)', () => {
    const mdx = starlightImport + `<Tabs>
  <TabItem label="Frontend">
    <Tabs>
      <TabItem label="React">React framework</TabItem>
      <TabItem label="Vue">Vue framework</TabItem>
    </Tabs>
  </TabItem>
  <TabItem label="Backend">
    Backend content
  </TabItem>
</Tabs>`;
    const output = toValeAST(mdx);
    expect(output.match(/data-component="Tabs"/g)).toHaveLength(2);
    expect(output.match(/data-component="TabItem"/g)).toHaveLength(4);
  });
});

// =============================================================================
// FILETREE COMPONENT
// =============================================================================

describe('Starlight FileTree Component', () => {
  test('FileTree with basic structure', () => {
    const mdx = starlightImport + `<FileTree>
- src/
  - components/
    - Header.astro
    - Footer.astro
  - pages/
    - index.astro
- package.json
</FileTree>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="FileTree"');
    expect(output).toContain( '<ul>');
    expect(output).toContain( 'Header.astro');
  });

  test('FileTree with highlighted files', () => {
    const mdx = starlightImport + `<FileTree>
- src/
  - **index.ts** (entry point)
  - utils/
    - helpers.ts
</FileTree>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="FileTree"');
    expect(output).toContain( '<strong>index.ts</strong>');
  });

  test('FileTree with comments', () => {
    const mdx = starlightImport + `<FileTree>
- astro.config.mjs (configuration file)
- src/
  - content/ (your content)
</FileTree>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="FileTree"');
    expect(output).toContain( 'configuration file');
  });
});

// =============================================================================
// NON-PROSE COMPONENTS (should use default behavior)
// =============================================================================

describe('Starlight Non-Prose Components', () => {
  test('Badge is NOT a prose component (self-closing)', () => {
    const mdx = starlightImport + `<Badge text="New" />`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<code class="mdxNode');
    expect(output).toContain( '&#x3C;Badge');
    expect(output).not.toContain( 'data-component="Badge"');
  });

  test('Badge with variant is NOT prose', () => {
    const mdx = starlightImport + `<Badge text="Beta" variant="caution" />`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<code class="mdxNode');
    expect(output).not.toContain( 'data-component');
  });

  test('Icon is NOT a prose component', () => {
    const mdx = starlightImport + `<Icon name="star" />`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<code class="mdxNode');
    expect(output).toContain( '&#x3C;Icon');
  });

  test('Icon with all props is NOT prose', () => {
    const mdx = starlightImport + `<Icon name="rocket" label="Launch" size="1.5rem" color="goldenrod" />`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<code class="mdxNode');
  });

  test('Unknown component uses default behavior', () => {
    const mdx = starlightImport + `<CustomWidget>
  Some content
</CustomWidget>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<pre><code');
    expect(output).toContain( '&#x3C;CustomWidget>');
    expect(output).not.toContain( 'data-component');
  });
});

// =============================================================================
// NESTED COMPONENTS (COMPLEX SCENARIOS)
// =============================================================================

describe('Starlight Nested Components', () => {
  test('Aside inside Card', () => {
    const mdx = starlightImport + `<Card title="Important">
  <Aside type="caution">
    Please read this carefully.
  </Aside>
</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
    expect(output).toContain( 'data-component="Aside"');
    expect(output).toContain( 'Please read this carefully');
  });

  test('multiple Asides in CardGrid', () => {
    const mdx = starlightImport + `<CardGrid>
  <Card title="Tips">
    <Aside type="tip">Tip one</Aside>
    <Aside type="tip">Tip two</Aside>
  </Card>
  <Card title="Warnings">
    <Aside type="caution">Caution one</Aside>
  </Card>
</CardGrid>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="CardGrid"');
    expect(output.match(/data-component="Card"/g)).toHaveLength(2);
    expect(output.match(/data-component="Aside"/g)).toHaveLength(3);
  });

  test('Tabs inside Card with Aside', () => {
    const mdx = starlightImport + `<Card title="Installation">
  <Tabs>
    <TabItem label="npm">
      <Aside type="tip">Use npm for stability</Aside>
      Run: \`npm install\`
    </TabItem>
    <TabItem label="yarn">
      Run: \`yarn add\`
    </TabItem>
  </Tabs>
</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
    expect(output).toContain( 'data-component="Tabs"');
    expect(output).toContain( 'data-component="TabItem"');
    expect(output).toContain( 'data-component="Aside"');
  });

  test('4 levels deep nesting', () => {
    const mdx = starlightImport + `<CardGrid>
  <Card title="Outer">
    <Tabs>
      <TabItem label="Inner">
        <Aside type="danger">
          **Critical**: Very deep nesting with *emphasis*
        </Aside>
      </TabItem>
    </Tabs>
  </Card>
</CardGrid>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="CardGrid"');
    expect(output).toContain( 'data-component="Card"');
    expect(output).toContain( 'data-component="Tabs"');
    expect(output).toContain( 'data-component="TabItem"');
    expect(output).toContain( 'data-component="Aside"');
    expect(output).toContain( '<strong>Critical</strong>');
    expect(output).toContain( '<em>emphasis</em>');
  });

  test('FileTree inside TabItem', () => {
    const mdx = starlightImport + `<Tabs>
  <TabItem label="Project Structure">
    <FileTree>
    - src/
      - index.js
    </FileTree>
  </TabItem>
</Tabs>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Tabs"');
    expect(output).toContain( 'data-component="TabItem"');
    expect(output).toContain( 'data-component="FileTree"');
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('Starlight Edge Cases', () => {
  test('empty Aside uses default behavior', () => {
    const mdx = starlightImport + `<Aside></Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<code class="mdxNode');
    expect(output).not.toContain( 'data-component="Aside"');
  });

  test('Aside with only whitespace', () => {
    const mdx = starlightImport + `<Aside>   </Aside>`;
    const output = toValeAST(mdx);
    expect(output).toBeDefined();
  });

  test('self-closing Aside (invalid but should not crash)', () => {
    const mdx = starlightImport + `<Aside />`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<code class="mdxNode');
    expect(output).toContain( '&#x3C;Aside');
  });

  test('Card with JSX expression children', () => {
    const mdx = starlightImport + `<Card title="Dynamic">
{someVariable}
</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
    expect(output).toContain( '{someVariable}');
  });

  test('Aside with only inline code', () => {
    const mdx = starlightImport + `<Aside>\`just code\`</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Aside"');
    expect(output).toContain( '<code>just code</code>');
  });

  test('multiple components on same line', () => {
    const mdx = starlightImport + `<Aside>Note</Aside><Card>Card text</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Aside"');
    expect(output).toContain( 'data-component="Card"');
  });

  test('prose component followed by non-prose', () => {
    const mdx = starlightImport + `<Aside type="tip">A tip</Aside>
<Badge text="New" />`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Aside"');
    expect(output).toContain( '&#x3C;Badge');
  });

  test('component with HTML entities in content', () => {
    const mdx = starlightImport + `<Aside>
Use &lt;div&gt; for containers and &amp; for ampersands.
</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Aside"');
  });

  test('component with emoji', () => {
    const mdx = starlightImport + `<Aside type="tip">
🚀 This is a rocket tip! 🎉
</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Aside"');
    expect(output).toContain( '🚀');
    expect(output).toContain( '🎉');
  });
});

// =============================================================================
// REAL-WORLD PATTERNS
// =============================================================================

describe('Starlight Real-World Patterns', () => {
  test('typical docs page structure', () => {
    const mdx = starlightImport + `
# Getting Started

<Aside type="tip">
This guide assumes you have **Node.js** installed.
</Aside>

## Installation

<Steps>
1. Create a new project
2. Install dependencies
3. Start development server
</Steps>

## Configuration

<Tabs>
  <TabItem label="Basic">
    Minimal configuration needed.
  </TabItem>
  <TabItem label="Advanced">
    <Aside type="caution">
    Advanced users only!
    </Aside>
    Full customization available.
  </TabItem>
</Tabs>
`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<h1>Getting Started</h1>');
    expect(output).toContain( '<h2>Installation</h2>');
    expect(output).toContain( '<h2>Configuration</h2>');
    expect(output).toContain( 'data-component="Aside"');
    expect(output).toContain( 'data-component="Steps"');
    expect(output).toContain( 'data-component="Tabs"');
    expect(output).toContain( 'data-component="TabItem"');
  });

  test('API reference page pattern', () => {
    const mdx = starlightImport + `
# API Reference

<CardGrid>
  <Card title="Methods" icon="code">
    Core API methods
  </Card>
  <Card title="Types" icon="document">
    TypeScript definitions
  </Card>
</CardGrid>

<Aside type="note">
All methods are **async** by default.
</Aside>
`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<h1>API Reference</h1>');
    expect(output).toContain( 'data-component="CardGrid"');
    expect(output.match(/data-component="Card"/g)).toHaveLength(2);
    expect(output).toContain( 'data-component="Aside"');
  });
});
