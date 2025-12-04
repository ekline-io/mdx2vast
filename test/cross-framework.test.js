import { describe, test, expect, afterEach } from '@jest/globals';
import { toValeAST } from '../bin/lib.js';

describe('MDX2VAST_FRAMEWORK Environment Variable', () => {
  afterEach(() => {
    delete process.env.MDX2VAST_FRAMEWORK;
  });

  test('env var overrides auto-detection', () => {
    process.env.MDX2VAST_FRAMEWORK = 'mintlify';
    const mdx = `import { Card } from '@astrojs/starlight/components';

<CardGroup>Mintlify component via env override</CardGroup>`;
    const output = toValeAST(mdx);
    expect(output).toContain('data-component="CardGroup"');
  });

  test('starlight framework via env var', () => {
    process.env.MDX2VAST_FRAMEWORK = 'starlight';
    const mdx = `<FileTree>Starlight component</FileTree>`;
    const output = toValeAST(mdx);
    expect(output).toContain('data-component="FileTree"');
  });

  test('fern framework via env var', () => {
    process.env.MDX2VAST_FRAMEWORK = 'fern';
    const mdx = `<Info>Fern info</Info>`;
    const output = toValeAST(mdx);
    expect(output).toContain('data-component="Info"');
  });

  test('mintlify framework via env var', () => {
    process.env.MDX2VAST_FRAMEWORK = 'mintlify';
    const mdx = `<Note>Mintlify note</Note>`;
    const output = toValeAST(mdx);
    expect(output).toContain('data-component="Note"');
  });

  test('case-insensitive framework name', () => {
    process.env.MDX2VAST_FRAMEWORK = 'STARLIGHT';
    const mdx = `<Aside>Content</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain('data-component="Aside"');
  });

  test('mixed case framework name', () => {
    process.env.MDX2VAST_FRAMEWORK = 'Mintlify';
    const mdx = `<Callout>Content</Callout>`;
    const output = toValeAST(mdx);
    expect(output).toContain('data-component="Callout"');
  });

  test('invalid env value falls back to auto-detection', () => {
    process.env.MDX2VAST_FRAMEWORK = 'invalid';
    const mdx = `import { Card } from '@astrojs/starlight/components';

<Card>Starlight card</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain('data-component="Card"');
  });

  test('invalid env value with no imports returns raw JSX', () => {
    process.env.MDX2VAST_FRAMEWORK = 'unknown';
    const mdx = `<Card>No framework detected</Card>`;
    const output = toValeAST(mdx);
    expect(output).not.toContain('data-component');
    expect(output).toContain('<code');
  });
});

describe('Framework Priority', () => {
  test('Starlight takes priority over Mintlify when both present', () => {
    const mdx = `import { Card } from '@astrojs/starlight/components';
import { Note } from '@mintlify/components';

<Card>Starlight card</Card>`;
    const output = toValeAST(mdx);
    expect(output).toContain('data-component="Card"');
  });

  test('Starlight takes priority over Fern when both present', () => {
    const mdx = `import { Info } from '@fern-ui/components';
import { Aside } from '@astrojs/starlight/components';

<Aside>Starlight aside</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain('data-component="Aside"');
  });

  test('Fern takes priority over Mintlify when both present', () => {
    const mdx = `import { Info } from '@fern-ui/components';
import { Note } from '@mintlify/components';

<Info>Fern info</Info>`;
    const output = toValeAST(mdx);
    expect(output).toContain('data-component="Info"');
  });

  test('all three frameworks imported - Starlight wins', () => {
    const mdx = `import { Info } from '@fern-ui/components';
import { Aside } from '@astrojs/starlight/components';
import { Note } from '@mintlify/components';

<Aside>Content</Aside>`;
    const output = toValeAST(mdx);
    expect(output).toContain('data-component="Aside"');
  });
});

describe('Cross-Framework Component Recognition', () => {
  test('Starlight recognizes its components, not Mintlify ones', () => {
    const mdx = `import { Card } from '@astrojs/starlight/components';

<CardGroup>
  Mintlify-only component
</CardGroup>`;
    const output = toValeAST(mdx);
    expect(output).toContain('<pre><code');
    expect(output).not.toContain('data-component="CardGroup"');
  });

  test('Fern recognizes its components, not Starlight ones', () => {
    const mdx = `import { Info } from '@fern-ui/components';

<FileTree>
  Starlight-only component
</FileTree>`;
    const output = toValeAST(mdx);
    expect(output).toContain('<pre><code');
    expect(output).not.toContain('data-component="FileTree"');
  });

  test('shared component names work with correct framework - Card', () => {
    const starlightMdx = `import { Card } from '@astrojs/starlight/components';

<Card>Starlight card</Card>`;
    const fernMdx = `import { Card } from '@fern-ui/components';

<Card>Fern card</Card>`;
    const mintlifyMdx = `import { Card } from '@mintlify/components';

<Card>Mintlify card</Card>`;

    expect(toValeAST(starlightMdx)).toContain('data-component="Card"');
    expect(toValeAST(fernMdx)).toContain('data-component="Card"');
    expect(toValeAST(mintlifyMdx)).toContain('data-component="Card"');
  });

  test('shared component names work with correct framework - Aside', () => {
    const starlightMdx = `import { Aside } from '@astrojs/starlight/components';

<Aside>Starlight aside</Aside>`;
    const fernMdx = `import { Aside } from '@fern-ui/components';

<Aside>Fern aside</Aside>`;

    expect(toValeAST(starlightMdx)).toContain('data-component="Aside"');
    expect(toValeAST(fernMdx)).toContain('data-component="Aside"');
  });
});
