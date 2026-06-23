import { describe, test, expect } from '@jest/globals';
import { toValeAST } from '../bin/lib.js';

// GFM tables must render as real <table>/<td> so Vale scopes each cell as its
// own sentence. Without GFM parsing the whole table collapses into one <p>,
// which Vale reads as a single over-long sentence (e.g. false EK00021 hits).
describe('GFM Tables', () => {
  const table = `# Title

| Name | Type | Description |
| --- | --- | --- |
| token | string | the authentication token used by the client |
| count | number | total number of items returned in the response |
`;

  test('renders a pipe table as an HTML table, not a paragraph', () => {
    const output = toValeAST(table);

    expect(output).toContain('<table>');
    expect(output).toContain('<td>');
    expect(output).not.toMatch(/<p>\s*\|/);
  });

  test('keeps each cell as a separate table cell', () => {
    const output = toValeAST(table);

    expect(output).toContain('<td>the authentication token used by the client</td>');
    expect(output).toContain('<td>total number of items returned in the response</td>');
  });

  test('header cells render as <th>', () => {
    const output = toValeAST(table);

    expect(output).toContain('<th>Name</th>');
    expect(output).toContain('<th>Description</th>');
  });

  test('a wide table does not concatenate cells into one block', () => {
    const columns = 33;
    const header = `| ${Array.from({ length: columns }, (_, i) => `H${i + 1}`).join(' | ')} |`;
    const separator = `| ${Array.from({ length: columns }, () => '---').join(' | ')} |`;
    const row = `| ${Array.from({ length: columns }, (_, i) => `word${i + 1}`).join(' | ')} |`;
    const wide = ['# Wide', '', header, separator, row, ''].join('\n');

    const output = toValeAST(wide);

    expect(output).toContain('<table>');
    expect(output.match(/<td>/g)).toHaveLength(columns);
    expect(output.match(/<th>/g)).toHaveLength(columns);
  });
});

describe('Other GFM constructs', () => {
  test('strikethrough renders as <del>, not literal tildes', () => {
    const output = toValeAST('This is ~~removed~~ text.');

    expect(output).toContain('<del>removed</del>');
    expect(output).not.toContain('~~');
  });
});
