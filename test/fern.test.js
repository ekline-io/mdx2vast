import { describe, test, expect } from '@jest/globals';
import { toValeAST } from '../bin/lib.js';

const fernImport = `import { Info, Warning, Success, Error, Note, Launch, Tip, Check, Accordion, Aside, Card, Frame, Step, Tab, Tooltip, Indent, ParamField, Steps, Tabs, AccordionGroup, CodeBlock, Button } from '@fern-ui/components';\n\n`;

// =============================================================================
// MODE DETECTION
// =============================================================================

describe('Fern Mode Detection', () => {
  test('detects @fern-ui/components import', () => {
    const mdx = `import { Info } from '@fern-ui/components';

<Info>content</Info>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Info"');
    expect(output).toContain( '<div');
  });

  test('detects any @fern-ui/* import', () => {
    const mdx = `import Something from '@fern-ui/whatever';

<Warning>content</Warning>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Warning"');
  });

  test('detects @fern-ui in dynamic import', () => {
    const mdx = `// Using @fern-ui components
import { Info } from '@fern-ui/components';

<Info>Note content</Info>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Info"');
  });

  test('no Fern import = original behavior (multiline)', () => {
    const mdx = `import { Info } from 'other-library';

<Info>
  content
</Info>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<pre><code');
    expect(output).toContain( '&#x3C;Info>');
  });

  test('no Fern import = original behavior (single line)', () => {
    const mdx = `<Info>content</Info>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<code class="mdxNode');
    expect(output).toContain( '&#x3C;Info>');
  });
});

// =============================================================================
// CALLOUT VARIANTS (ALL 8)
// =============================================================================

describe('Fern Callout Variants', () => {
  const callouts = ['Info', 'Warning', 'Success', 'Error', 'Note', 'Launch', 'Tip', 'Check'];

  test.each(callouts)('%s callout converts children to HTML', (name) => {
    const mdx = fernImport + `<${name}>Important info</${name}>`;
    const output = toValeAST(mdx);
    expect(output).toContain( `data-component="${name}"`);
    expect(output).toContain( '<div');
    expect(output).not.toContain( `&#x3C;${name}>`);
  });

  describe('Info Callout', () => {
    test('Info with markdown formatting', () => {
      const mdx = fernImport + `<Info>
Use \`inline code\` and **bold** and *italic* text.
</Info>`;
      const output = toValeAST(mdx);
      expect(output).toContain( 'data-component="Info"');
      expect(output).toContain( '<code>inline code</code>');
      expect(output).toContain( '<strong>bold</strong>');
      expect(output).toContain( '<em>italic</em>');
    });

    test('Info with title prop', () => {
      const mdx = fernImport + `<Info title="Did you know?">
Interesting fact here.
</Info>`;
      const output = toValeAST(mdx);
      expect(output).toContain( 'data-component="Info"');
      expect(output).toContain( 'Interesting fact');
    });

    test('Info with links', () => {
      const mdx = fernImport + `<Info>
Check out [the documentation](https://docs.example.com) for more.
</Info>`;
      const output = toValeAST(mdx);
      expect(output).toContain( '<a href="https://docs.example.com">');
    });

    test('Info with bullet list', () => {
      const mdx = fernImport + `<Info>
Key points:
- Point A
- Point B
- Point C
</Info>`;
      const output = toValeAST(mdx);
      expect(output).toContain( '<ul>');
      expect(output).toContain( '<li>');
    });
  });

  describe('Warning Callout', () => {
    test('Warning with strong emphasis', () => {
      const mdx = fernImport + `<Warning>
**Important:** This action cannot be undone!
</Warning>`;
      const output = toValeAST(mdx);
      expect(output).toContain( 'data-component="Warning"');
      expect(output).toContain( '<strong>Important:</strong>');
    });
  });

  describe('Error Callout', () => {
    test('Error with code example', () => {
      const mdx = fernImport + `<Error>
The following code will fail:

\`\`\`js
throw new Error("Something went wrong");
\`\`\`
</Error>`;
      const output = toValeAST(mdx);
      expect(output).toContain( 'data-component="Error"');
      expect(output).toContain( '<pre>');
    });
  });

  describe('Success Callout', () => {
    test('Success with completion message', () => {
      const mdx = fernImport + `<Success>
Installation complete! You can now use the SDK.
</Success>`;
      const output = toValeAST(mdx);
      expect(output).toContain( 'data-component="Success"');
      expect(output).toContain( 'Installation complete');
    });
  });

  describe('Launch Callout', () => {
    test('Launch announcement', () => {
      const mdx = fernImport + `<Launch>
🚀 New feature released: **Dark Mode** is now available!
</Launch>`;
      const output = toValeAST(mdx);
      expect(output).toContain( 'data-component="Launch"');
      expect(output).toContain( '🚀');
      expect(output).toContain( '<strong>Dark Mode</strong>');
    });
  });
});

// =============================================================================
// ACCORDION COMPONENTS
// =============================================================================

describe('Fern Accordion Components', () => {
  test('Accordion with title', () => {
    const mdx = fernImport + `<Accordion title="Frequently Asked Questions">
**Q: How does it work?**

It works seamlessly with your existing setup.
</Accordion>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Accordion"');
    expect(output).toContain( '<strong>');
    expect(output).toContain( 'seamlessly');
  });

  test('Accordion with complex content', () => {
    const mdx = fernImport + `<Accordion title="Advanced Configuration">
## Options

- \`debug\`: Enable debug mode
- \`timeout\`: Request timeout in ms

\`\`\`json
{
  "debug": true,
  "timeout": 5000
}
\`\`\`
</Accordion>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Accordion"');
    expect(output).toContain( '<h2>');
    expect(output).toContain( '<ul>');
    expect(output).toContain( '<pre>');
  });

  test('AccordionGroup with multiple Accordions', () => {
    const mdx = fernImport + `<AccordionGroup>
  <Accordion title="First">First content</Accordion>
  <Accordion title="Second">Second content</Accordion>
  <Accordion title="Third">Third content</Accordion>
</AccordionGroup>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="AccordionGroup"');
    expect(output.match(/data-component="Accordion"/g)).toHaveLength(3);
  });

  test('nested Accordion with callout', () => {
    const mdx = fernImport + `<Accordion title="Details">
<Warning>
Pay attention to this important detail!
</Warning>
</Accordion>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Accordion"');
    expect(output).toContain( 'data-component="Warning"');
  });
});

// =============================================================================
// CARD COMPONENT
// =============================================================================

describe('Fern Card Component', () => {
  test('Card with title and prose', () => {
    const mdx = fernImport + `<Card title="Getting Started">
Learn how to set up your project with **Fern**.
</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
    expect(output).toContain( '<strong>Fern</strong>');
  });

  test('Card with icon', () => {
    const mdx = fernImport + `<Card title="Settings" icon="gear">
Configure your preferences.
</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
    expect(output).toContain( 'Configure');
  });

  test('Card with href (link card)', () => {
    const mdx = fernImport + `<Card title="Documentation" href="/docs">
View the full documentation.
</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
    expect(output).toContain( 'View the full documentation');
  });

  test('multiple Cards', () => {
    const mdx = fernImport + `
<Card title="A">Content A</Card>
<Card title="B">Content B</Card>
<Card title="C">Content C</Card>`;
    const output = toValeAST(mdx);
    expect(output.match(/data-component="Card"/g)).toHaveLength(3);
  });
});

// =============================================================================
// STEPS/STEP COMPONENTS
// =============================================================================

describe('Fern Steps Components', () => {
  test('Steps container with Step children', () => {
    const mdx = fernImport + `<Steps>
  <Step title="Install">
    Run \`npm install @fern-api/sdk\`
  </Step>
  <Step title="Configure">
    Create a config file
  </Step>
  <Step title="Use">
    Import and use the SDK
  </Step>
</Steps>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Steps"');
    expect(output.match(/data-component="Step"/g)).toHaveLength(3);
    expect(output).toContain( '<code>npm install @fern-api/sdk</code>');
  });

  test('Step with complex content', () => {
    const mdx = fernImport + `<Step title="Setup Environment">
## Prerequisites

- Node.js 18+
- npm or yarn

<Info>
We recommend using the latest LTS version.
</Info>
</Step>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Step"');
    expect(output).toContain( '<h2>');
    expect(output).toContain( '<ul>');
    expect(output).toContain( 'data-component="Info"');
  });

  test('standalone Step', () => {
    const mdx = fernImport + `<Step title="Single Step">
Do this one thing.
</Step>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Step"');
    expect(output).toContain( 'Do this one thing');
  });
});

// =============================================================================
// TABS COMPONENTS
// =============================================================================

describe('Fern Tabs Components', () => {
  test('Tabs with Tab children', () => {
    const mdx = fernImport + `<Tabs>
  <Tab title="JavaScript">
    JavaScript documentation
  </Tab>
  <Tab title="Python">
    Python documentation
  </Tab>
  <Tab title="Go">
    Go documentation
  </Tab>
</Tabs>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Tabs"');
    expect(output.match(/data-component="Tab"/g)).toHaveLength(3);
  });

  test('Tab with markdown content', () => {
    const mdx = fernImport + `<Tab title="Usage">
## Basic Usage

\`\`\`js
import { Client } from '@fern-api/sdk';
const client = new Client();
\`\`\`

See [the guide](/guide) for more examples.
</Tab>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Tab"');
    expect(output).toContain( '<h2>');
    expect(output).toContain( '<pre>');
    expect(output).toContain( '<a href="/guide">');
  });

  test('nested Tabs', () => {
    const mdx = fernImport + `<Tabs>
  <Tab title="Frontend">
    <Tabs>
      <Tab title="React">React setup</Tab>
      <Tab title="Vue">Vue setup</Tab>
    </Tabs>
  </Tab>
</Tabs>`;
    const output = toValeAST(mdx);
    expect(output.match(/data-component="Tabs"/g)).toHaveLength(2);
    expect(output.match(/data-component="Tab"/g)).toHaveLength(3);
  });
});

// =============================================================================
// OTHER PROSE COMPONENTS
// =============================================================================

describe('Fern Other Prose Components', () => {
  test('Frame component', () => {
    const mdx = fernImport + `<Frame>
This content is framed for emphasis.
</Frame>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Frame"');
    expect(output).toContain( 'framed for emphasis');
  });

  test('Frame with image description', () => {
    const mdx = fernImport + `<Frame caption="Dashboard screenshot">
The dashboard provides an overview of your API usage.
</Frame>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Frame"');
    expect(output).toContain( 'dashboard');
  });

  test('Tooltip component', () => {
    const mdx = fernImport + `<Tooltip>
Hover text explanation
</Tooltip>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Tooltip"');
  });

  test('Tooltip with formatting', () => {
    const mdx = fernImport + `<Tooltip>
**Important term**: This is the definition with \`code\`.
</Tooltip>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Tooltip"');
    expect(output).toContain( '<strong>Important term</strong>');
    expect(output).toContain( '<code>code</code>');
  });

  test('Indent component', () => {
    const mdx = fernImport + `<Indent>
This content is indented for visual hierarchy.
</Indent>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Indent"');
    expect(output).toContain( 'indented');
  });

  test('nested Indent', () => {
    const mdx = fernImport + `<Indent>
First level
<Indent>
Second level
<Indent>
Third level
</Indent>
</Indent>
</Indent>`;
    const output = toValeAST(mdx);
    expect(output.match(/data-component="Indent"/g)).toHaveLength(3);
  });

  test('Aside component', () => {
    const mdx = fernImport + `<Aside>
This is supplementary information.
</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Aside"');
    expect(output).toContain( 'supplementary');
  });
});

// =============================================================================
// PARAMFIELD (API DOCUMENTATION)
// =============================================================================

describe('Fern ParamField Component', () => {
  test('basic ParamField', () => {
    const mdx = fernImport + `<ParamField path="id" type="string">
The unique identifier for the resource.
</ParamField>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="ParamField"');
    expect(output).toContain( 'unique identifier');
  });

  test('ParamField with required', () => {
    const mdx = fernImport + `<ParamField path="email" type="string" required>
The user's email address. Must be a valid email format.
</ParamField>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="ParamField"');
    expect(output).toContain( 'email address');
  });

  test('ParamField with default value', () => {
    const mdx = fernImport + `<ParamField path="limit" type="number" default="10">
Maximum number of results to return. Default is 10.
</ParamField>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="ParamField"');
    expect(output).toContain( 'Maximum number');
  });

  test('ParamField with markdown', () => {
    const mdx = fernImport + `<ParamField path="config" type="object">
Configuration object. See [config options](/config) for details.

Supports:
- \`debug\`: Enable debug mode
- \`timeout\`: Request timeout
</ParamField>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="ParamField"');
    expect(output).toContain( '<a href="/config">');
    expect(output).toContain( '<ul>');
    expect(output).toContain( '<code>debug</code>');
  });

  test('multiple ParamFields', () => {
    const mdx = fernImport + `
<ParamField path="name" type="string" required>User's name</ParamField>
<ParamField path="age" type="number">User's age</ParamField>
<ParamField path="email" type="string">User's email</ParamField>`;
    const output = toValeAST(mdx);
    expect(output.match(/data-component="ParamField"/g)).toHaveLength(3);
  });
});

// =============================================================================
// NON-PROSE COMPONENTS (should use default behavior)
// =============================================================================

describe('Fern Non-Prose Components', () => {
  test('CodeBlock is NOT a prose component', () => {
    const mdx = fernImport + `<CodeBlock>
const x = 1;
</CodeBlock>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<pre><code');
    expect(output).toContain( '&#x3C;CodeBlock>');
    expect(output).not.toContain( 'data-component="CodeBlock"');
  });

  test('Button is NOT a prose component', () => {
    const mdx = fernImport + `<Button href="/signup">Sign Up</Button>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<code class="mdxNode');
    expect(output).toContain( '&#x3C;Button');
  });

  test('self-closing components use default behavior', () => {
    const mdx = fernImport + `<Icon name="star" />`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<code class="mdxNode');
  });

  test('unknown component uses default behavior', () => {
    const mdx = fernImport + `<CustomWidget>
  Some content
</CustomWidget>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<pre><code');
    expect(output).toContain( '&#x3C;CustomWidget>');
  });
});

// =============================================================================
// NESTED COMPONENTS (COMPLEX SCENARIOS)
// =============================================================================

describe('Fern Nested Components', () => {
  test('callout inside Accordion', () => {
    const mdx = fernImport + `<Accordion title="Important">
<Warning>
Read this carefully before proceeding.
</Warning>
</Accordion>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Accordion"');
    expect(output).toContain( 'data-component="Warning"');
  });

  test('Card with callouts and steps', () => {
    const mdx = fernImport + `<Card title="Quick Start">
<Info>
This guide takes about 5 minutes.
</Info>

<Steps>
  <Step title="Install">Run npm install</Step>
  <Step title="Configure">Edit config</Step>
</Steps>
</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Card"');
    expect(output).toContain( 'data-component="Info"');
    expect(output).toContain( 'data-component="Steps"');
    expect(output.match(/data-component="Step"/g)).toHaveLength(2);
  });

  test('Tabs with callouts in each Tab', () => {
    const mdx = fernImport + `<Tabs>
  <Tab title="Production">
    <Warning>Production changes are permanent!</Warning>
    Use production settings.
  </Tab>
  <Tab title="Development">
    <Info>Safe to experiment here.</Info>
    Use dev settings.
  </Tab>
</Tabs>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Tabs"');
    expect(output).toContain( 'data-component="Tab"');
    expect(output).toContain( 'data-component="Warning"');
    expect(output).toContain( 'data-component="Info"');
  });

  test('4 levels deep nesting', () => {
    const mdx = fernImport + `<AccordionGroup>
  <Accordion title="Outer">
    <Tabs>
      <Tab title="Inner">
        <Info>
          **Critical**: Very deep nesting with *emphasis*
        </Info>
      </Tab>
    </Tabs>
  </Accordion>
</AccordionGroup>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="AccordionGroup"');
    expect(output).toContain( 'data-component="Accordion"');
    expect(output).toContain( 'data-component="Tabs"');
    expect(output).toContain( 'data-component="Tab"');
    expect(output).toContain( 'data-component="Info"');
    expect(output).toContain( '<strong>Critical</strong>');
    expect(output).toContain( '<em>emphasis</em>');
  });

  test('ParamField with nested callout', () => {
    const mdx = fernImport + `<ParamField path="apiKey" type="string" required>
Your API key for authentication.

<Warning>
Never expose your API key in client-side code!
</Warning>
</ParamField>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="ParamField"');
    expect(output).toContain( 'data-component="Warning"');
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('Fern Edge Cases', () => {
  test('empty Info uses default behavior', () => {
    const mdx = fernImport + `<Info></Info>`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<code class="mdxNode');
    expect(output).not.toContain( 'data-component="Info"');
  });

  test('Info with only whitespace', () => {
    const mdx = fernImport + `<Info>   </Info>`;
    const output = toValeAST(mdx);
    expect(output).toBeDefined();
  });

  test('self-closing callout (should not crash)', () => {
    const mdx = fernImport + `<Info />`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<code class="mdxNode');
  });

  test('Accordion with JSX expression', () => {
    const mdx = fernImport + `<Accordion title="Dynamic">
{someVariable}
</Accordion>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Accordion"');
    expect(output).toContain( '{someVariable}');
  });

  test('multiple callouts on same line', () => {
    const mdx = fernImport + `<Info>Info text</Info><Warning>Warning text</Warning>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Info"');
    expect(output).toContain( 'data-component="Warning"');
  });

  test('callout with HTML entities', () => {
    const mdx = fernImport + `<Info>
Use &lt;div&gt; for containers and &amp; for ampersands.
</Info>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Info"');
  });

  test('callout with emoji', () => {
    const mdx = fernImport + `<Success>
🎉 Congratulations! You did it! 🚀
</Success>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Success"');
    expect(output).toContain( '🎉');
    expect(output).toContain( '🚀');
  });

  test('all 8 callouts in same document', () => {
    const mdx = fernImport + `
<Info>Info</Info>
<Warning>Warning</Warning>
<Success>Success</Success>
<Error>Error</Error>
<Note>Note</Note>
<Launch>Launch</Launch>
<Tip>Tip</Tip>
<Check>Check</Check>`;
    const output = toValeAST(mdx);
    expect(output).toContain( 'data-component="Info"');
    expect(output).toContain( 'data-component="Warning"');
    expect(output).toContain( 'data-component="Success"');
    expect(output).toContain( 'data-component="Error"');
    expect(output).toContain( 'data-component="Note"');
    expect(output).toContain( 'data-component="Launch"');
    expect(output).toContain( 'data-component="Tip"');
    expect(output).toContain( 'data-component="Check"');
  });
});

// =============================================================================
// REAL-WORLD PATTERNS
// =============================================================================

describe('Fern Real-World Patterns', () => {
  test('typical API docs page', () => {
    const mdx = fernImport + `
# Create User

<Info>
This endpoint requires authentication.
</Info>

## Request Parameters

<ParamField path="name" type="string" required>
The user's display name.
</ParamField>

<ParamField path="email" type="string" required>
The user's email address.
</ParamField>

<ParamField path="role" type="string" default="user">
The user's role. One of: \`admin\`, \`user\`, \`guest\`.
</ParamField>

<Tabs>
  <Tab title="cURL">
    Use curl to make the request.
  </Tab>
  <Tab title="JavaScript">
    Use the SDK to make the request.
  </Tab>
</Tabs>

<Warning>
Rate limit: 100 requests per minute.
</Warning>
`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<h1>Create User</h1>');
    expect(output).toContain( '<h2>Request Parameters</h2>');
    expect(output).toContain( 'data-component="Info"');
    expect(output.match(/data-component="ParamField"/g)).toHaveLength(3);
    expect(output).toContain( 'data-component="Tabs"');
    expect(output).toContain( 'data-component="Warning"');
  });

  test('SDK quickstart page', () => {
    const mdx = fernImport + `
# SDK Quickstart

<Success>
The SDK is available on npm!
</Success>

<Steps>
  <Step title="Install">
    \`\`\`bash
    npm install @fern-api/sdk
    \`\`\`
  </Step>
  <Step title="Initialize">
    \`\`\`js
    import { Client } from '@fern-api/sdk';
    const client = new Client({ apiKey: 'your-key' });
    \`\`\`
  </Step>
  <Step title="Make your first call">
    \`\`\`js
    const users = await client.users.list();
    \`\`\`
  </Step>
</Steps>

<Tip>
Check out the [examples](/examples) for more use cases.
</Tip>
`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<h1>SDK Quickstart</h1>');
    expect(output).toContain( 'data-component="Success"');
    expect(output).toContain( 'data-component="Steps"');
    expect(output.match(/data-component="Step"/g)).toHaveLength(3);
    expect(output).toContain( 'data-component="Tip"');
    expect(output).toContain( '<pre>');
  });

  test('FAQ page with accordions', () => {
    const mdx = fernImport + `
# Frequently Asked Questions

<AccordionGroup>
  <Accordion title="What is Fern?">
    Fern is a **developer-first** API development platform.
  </Accordion>
  <Accordion title="How do I get started?">
    <Steps>
      <Step title="Sign up">Create an account</Step>
      <Step title="Create API">Define your API</Step>
    </Steps>
  </Accordion>
  <Accordion title="Is there a free tier?">
    <Success>
    Yes! We offer a generous free tier.
    </Success>
  </Accordion>
</AccordionGroup>
`;
    const output = toValeAST(mdx);
    expect(output).toContain( '<h1>Frequently Asked Questions</h1>');
    expect(output).toContain( 'data-component="AccordionGroup"');
    expect(output.match(/data-component="Accordion"/g)).toHaveLength(3);
    expect(output).toContain( 'data-component="Steps"');
    expect(output).toContain( 'data-component="Success"');
  });
});
