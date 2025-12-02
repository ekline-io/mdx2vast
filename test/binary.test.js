import { describe, test, expect } from '@jest/globals';
import { execa } from 'execa';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const BUNDLED_FILE = path.join(rootDir, 'dist/bundled/index.js');
const MACOS_BINARY = path.join(rootDir, 'dist/mdx2vast-macos');
const LINUX_BINARY = path.join(rootDir, 'dist/mdx2vast-linux');
const WINDOWS_BINARY = path.join(rootDir, 'dist/mdx2vast-windows.exe');

const getBinaryPath = () => {
  switch (process.platform) {
    case 'darwin': return MACOS_BINARY;
    case 'linux': return LINUX_BINARY;
    case 'win32': return WINDOWS_BINARY;
    default: return LINUX_BINARY;
  }
};

const binaryPath = getBinaryPath();
const cliPath = path.join(rootDir, 'bin/cli.js');

describe('Build Validation', () => {
  test('bundled file exists', () => {
    expect(fs.existsSync(BUNDLED_FILE)).toBe(true);
  });

  test('bundled file has exactly one shebang on line 1', () => {
    const content = fs.readFileSync(BUNDLED_FILE, 'utf8');
    const lines = content.split('\n');
    
    expect(lines[0]).toBe('#!/usr/bin/env node');
    expect(lines[1]).not.toMatch(/^#!/); // No duplicate shebang (the bug!)
  });

  test('all platform binaries exist', () => {
    expect(fs.existsSync(MACOS_BINARY)).toBe(true);
    expect(fs.existsSync(LINUX_BINARY)).toBe(true);
    expect(fs.existsSync(WINDOWS_BINARY)).toBe(true);
  });
});

describe('Binary Execution', () => {
  test('binary --version works', async () => {
    const { stdout, exitCode } = await execa(binaryPath, ['--version']);
    expect(exitCode).toBe(0);
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('binary converts MDX', async () => {
    const { stdout, exitCode } = await execa(binaryPath, [], { 
      input: '# Hello\n\nWorld.' 
    });
    expect(exitCode).toBe(0);
    expect(stdout).toContain('<h1>Hello</h1>');
  });

  test('binary matches CLI output', async () => {
    const input = '# Test\n\n**bold**';
    const [cli, binary] = await Promise.all([
      execa('node', [cliPath], { input }),
      execa(binaryPath, [], { input })
    ]);
    expect(cli.stdout).toBe(binary.stdout);
  });
});
