import { describe, test, expect } from '@jest/globals';
import { toValeAST } from '../bin/lib.js';

describe('Mintlify Mode Detection', () => {
  test('detects @mintlify/components import', () => {
    const mdx = `import { Card } from '@mintlify/components';

<Card>content</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
    expect(output).toContain( '<div');
  });

  test('detects @mintlify/ui import', () => {
    const mdx = `import { Note } from '@mintlify/ui';

<Note>content</Note>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Note"');
  });

  test('detects any @mintlify/* import', () => {
    const mdx = `import Something from '@mintlify/whatever';

<Card>content</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
  });

  test('no Mintlify import = original behavior (multiline)', () => {
    const mdx = `import { Card } from 'other-library';

<Card>
  content
</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<pre><code');
    expect(output).toContain( '&#x3C;Card>');
  });

  test('no Mintlify import = original behavior (single line)', () => {
    const mdx = `<Card>content</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<code class="mdxNode');
    expect(output).toContain( '&#x3C;Card>');
  });

  test('no imports at all = original behavior', () => {
    const mdx = `
<Card>
  content
</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<pre><code');
    expect(output).toContain( '&#x3C;Card>');
  });
});

describe('Mintlify Prose Components', () => {
  const mintlifyImport = `import { Card } from '@mintlify/components';\n\n`;

  describe('Callout Components', () => {
    const callouts = ['Note', 'Warning', 'Info', 'Tip', 'Check', 'Callout'];
    
    test.each(callouts)('%s component converts children to HTML', (name) => {
      const mdx = mintlifyImport + `<${name}>Important info</${name}>`;
      const output = toValeAST(mdx);
      expect(output).toContain( `data-component="${name}"`);
      expect(output).toContain( '<div');
      expect(output).not.toContain( `&#x3C;${name}>`);
    });
  });

  describe('Card Components', () => {
    test('Card with prose', () => {
      const mdx = mintlifyImport + `<Card title="Hello">This is **bold** text.</Card>`;
      const output = toValeAST(mdx);
      expect(output).toContain( 'data-component="Card"');
      expect(output).toContain( '<strong>bold</strong>');
    });

    test('CardGroup with nested Cards', () => {
      const mdx = mintlifyImport + `
<CardGroup>
  <Card>First card</Card>
  <Card>Second card</Card>
</CardGroup>`;
      const output = toValeAST(mdx);
      expect(output).toContain( 'data-component="CardGroup"');
      expect(output).toContain( 'data-component="Card"');
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
      expect(output).toContain( 'data-component="Accordion"');
      expect(output).toContain( '<strong>');
    });

    test('AccordionGroup', () => {
      const mdx = mintlifyImport + `<AccordionGroup><Accordion>Content</Accordion></AccordionGroup>`;
      const output = toValeAST(mdx);
      expect(output).toContain( 'data-component="AccordionGroup"');
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
      expect(output).toContain( 'data-component="Columns"');
      expect(output).toContain( 'data-component="Column"');
    });

    test('Frame component', () => {
      const mdx = mintlifyImport + `<Frame>Framed content</Frame>`;
      const output = toValeAST(mdx);
      expect(output).toContain( 'data-component="Frame"');
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
      expect(output).toContain( 'data-component="Steps"');
      expect(output).toContain( 'data-component="Step"');
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
      expect(output).toContain( 'data-component="Tabs"');
      expect(output).toContain( 'data-component="Tab"');
    });
  });

  describe('API Documentation Components', () => {
    test('ParamField', () => {
      const mdx = mintlifyImport + `<ParamField path="id" type="string">The user ID</ParamField>`;
      const output = toValeAST(mdx);
      expect(output).toContain( 'data-component="ParamField"');
    });

    test('ResponseField', () => {
      const mdx = mintlifyImport + `<ResponseField name="status">Success indicator</ResponseField>`;
      const output = toValeAST(mdx);
      expect(output).toContain( 'data-component="ResponseField"');
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
      expect(output).toContain( 'data-component="Update"');
      expect(output).toContain( '<h2>');
    });
  });

  describe('Other Prose Components', () => {
    test('Expandable', () => {
      const mdx = mintlifyImport + `<Expandable>Hidden content</Expandable>`;
      const output = toValeAST(mdx);
      expect(output).toContain( 'data-component="Expandable"');
    });

    test('Tooltip', () => {
      const mdx = mintlifyImport + `<Tooltip>Tooltip text</Tooltip>`;
      const output = toValeAST(mdx);
      expect(output).toContain( 'data-component="Tooltip"');
    });

    test('Aside', () => {
      const mdx = mintlifyImport + `<Aside>Side note</Aside>`;
      const output = toValeAST(mdx);
      expect(output).toContain( 'data-component="Aside"');
    });

    test('Definition', () => {
      const mdx = mintlifyImport + `<Definition>Term definition</Definition>`;
      const output = toValeAST(mdx);
      expect(output).toContain( 'data-component="Definition"');
    });
  });
});

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
    expect(output).toContain( '<pre><code');
    expect(output).toContain( '&#x3C;CodeGroup>');
  });

  test('Code component wraps in code', () => {
    const mdx = mintlifyImport + `<Code>const x = 1;</Code>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<code');
    expect(output).toContain( '&#x3C;Code>');
  });

  test('CodeBlock wraps in code', () => {
    const mdx = mintlifyImport + `<CodeBlock>code here</CodeBlock>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<code');
    expect(output).toContain( '&#x3C;CodeBlock>');
  });

  test('Snippet wraps in code', () => {
    const mdx = mintlifyImport + `<Snippet>snippet</Snippet>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<code');
    expect(output).toContain( '&#x3C;Snippet>');
  });

  test('RequestExample wraps in pre/code (multiline)', () => {
    const mdx = mintlifyImport + `
<RequestExample>
\`\`\`bash
curl https://api.example.com
\`\`\`
</RequestExample>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<pre><code');
    expect(output).toContain( '&#x3C;RequestExample>');
  });

  test('ResponseExample wraps in pre/code (multiline)', () => {
    const mdx = mintlifyImport + `
<ResponseExample>
\`\`\`json
{"status": "ok"}
\`\`\`
</ResponseExample>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<pre><code');
    expect(output).toContain( '&#x3C;ResponseExample>');
  });
});

describe('Mintlify Import Variations', () => {
  test('named import', () => {
    const mdx = `import { Card } from '@mintlify/components';

<Card>content</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
  });

  test('multiple named imports in different statements', () => {
    const mdx = `import { Card } from '@mintlify/components';
import { something } from 'other-library';

<Card>card</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
  });

  test('import with alias', () => {
    const mdx = `import { Card as MyCard } from '@mintlify/components';

<Card>content</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
  });

  test('default import', () => {
    const mdx = `import Components from '@mintlify/components';

<Card>content</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
  });

  test('@mintlify anywhere in import enables mode', () => {
    const mdx = `import x from '@mintlify/theme';

<Card>content</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
  });

  test('non-mintlify import does not enable mode', () => {
    const mdx = `import { Card } from 'some-other-library';

<Card>
  content
</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<pre><code');
    expect(output).not.toContain( 'data-component');
  });
});

describe('Mintlify Mixed Content', () => {
  test('prose and code components together', () => {
    const mdx = `import { Card, CodeGroup } from '@mintlify/components';

<Card>This is prose</Card>

<CodeGroup>
\`\`\`js
const code = "here";
\`\`\`
</CodeGroup>`;
    
    const output = toValeAST(mdx);
    
    expect(output).toContain( 'data-component="Card"');
    expect(output).toContain( '<div');
    expect(output).toContain( '&#x3C;CodeGroup>');
  });

  test('regular markdown with Mintlify components', () => {
    const mdx = `import { Note } from '@mintlify/components';

# Regular Heading

Regular paragraph.

<Note>Important note</Note>

Another paragraph.`;
    
    const output = toValeAST(mdx);
    expect(output).toContain( '<h1>Regular Heading</h1>');
    expect(output).toContain( '<p>Regular paragraph.</p>');
    expect(output).toContain( 'data-component="Note"');
  });

  test('inline JSX in paragraph uses default behavior', () => {
    const mdx = `import { Icon } from '@mintlify/components';

This is a paragraph with an <Icon name="star" /> inline.`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<code class="mdxNode mdxJsxTextElement">');
    expect(output).toContain( '&#x3C;Icon');
  });
});

