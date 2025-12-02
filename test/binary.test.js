import { describe, test, expect } from '@jest/globals';
import { execa } from 'execa';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// =============================================================================
// TEST CONFIGURATION
// =============================================================================

const BUNDLED_FILE = path.join(rootDir, 'dist/bundled/index.js');
const MACOS_BINARY = path.join(rootDir, 'dist/mdx2vast-macos');
const LINUX_BINARY = path.join(rootDir, 'dist/mdx2vast-linux');
const WINDOWS_BINARY = path.join(rootDir, 'dist/mdx2vast-windows.exe');

// Determine which binary to test based on platform
const getBinaryPath = () => {
  switch (process.platform) {
    case 'darwin':
      return MACOS_BINARY;
    case 'linux':
      return LINUX_BINARY;
    case 'win32':
      return WINDOWS_BINARY;
    default:
      return LINUX_BINARY; // Default to Linux for CI
  }
};

const binaryPath = getBinaryPath();
const cliPath = path.join(rootDir, 'bin/cli.js');

// =============================================================================
// BUNDLED FILE VALIDATION
// =============================================================================

describe('Bundled File Validation', () => {
  test('bundled file exists', () => {
    expect(fs.existsSync(BUNDLED_FILE)).toBe(true);
  });

  test('bundled file is not empty', () => {
    const stats = fs.statSync(BUNDLED_FILE);
    expect(stats.size).toBeGreaterThan(0);
  });

  test('bundled file has exactly one shebang on line 1', () => {
    const content = fs.readFileSync(BUNDLED_FILE, 'utf8');
    const lines = content.split('\n');
    
    // First line should be a shebang
    expect(lines[0]).toBe('#!/usr/bin/env node');
    
    // Second line should NOT be a shebang (this was the bug!)
    expect(lines[1]).not.toMatch(/^#!/);
  });

  test('bundled file does not have duplicate shebangs anywhere', () => {
    const content = fs.readFileSync(BUNDLED_FILE, 'utf8');
    const shebangMatches = content.match(/^#!\/usr\/bin\/env node$/gm) || [];
    
    // Should only have exactly 1 shebang
    expect(shebangMatches.length).toBe(1);
  });

  test('bundled file starts with valid JavaScript after shebang', () => {
    const content = fs.readFileSync(BUNDLED_FILE, 'utf8');
    const lines = content.split('\n');
    
    // Line 2 (index 1) should start valid JS, not another shebang
    // A shebang on line 2 would cause: "Babel parse has failed: Unexpected token"
    const secondLine = lines[1];
    expect(secondLine).not.toBe('#!/usr/bin/env node');
    expect(secondLine).not.toMatch(/^#!/);
  });

  test('bundled file contains expected exports', () => {
    const content = fs.readFileSync(BUNDLED_FILE, 'utf8');
    
    // Should contain Commander setup
    expect(content).toContain('commander');
    
    // Should contain version string
    expect(content).toContain('0.4.0');
  });
});

// =============================================================================
// BINARY FILE VALIDATION
// =============================================================================

describe('Binary File Validation', () => {
  test('platform-specific binary exists', () => {
    expect(fs.existsSync(binaryPath)).toBe(true);
  });

  test('binary is executable', () => {
    const stats = fs.statSync(binaryPath);
    // Check if file has executable permission (on Unix-like systems)
    if (process.platform !== 'win32') {
      const isExecutable = (stats.mode & fs.constants.S_IXUSR) !== 0;
      expect(isExecutable).toBe(true);
    }
  });

  test('binary has reasonable size (> 10MB for pkg bundle)', () => {
    const stats = fs.statSync(binaryPath);
    // pkg bundles are typically > 10MB due to embedded Node.js runtime
    expect(stats.size).toBeGreaterThan(10 * 1024 * 1024);
  });
});

// =============================================================================
// BINARY EXECUTION TESTS
// =============================================================================

describe('Binary Execution', () => {
  test('binary --version returns version number', async () => {
    const { stdout, exitCode } = await execa(binaryPath, ['--version']);
    
    expect(exitCode).toBe(0);
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/); // Semantic version format
  });

  test('binary --help returns help text', async () => {
    const { stdout, exitCode } = await execa(binaryPath, ['--help']);
    
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Usage:');
    expect(stdout).toContain('MDX');
  });

  test('binary converts MDX from stdin', async () => {
    const mdxInput = '# Hello World\n\nThis is a test.';
    const { stdout, exitCode } = await execa(binaryPath, [], { input: mdxInput });
    
    expect(exitCode).toBe(0);
    expect(stdout).toContain('<h1>Hello World</h1>');
    expect(stdout).toContain('<p>This is a test.</p>');
  });

  test('binary converts MDX file', async () => {
    const testMdxPath = path.join(__dirname, 'mdx/1/test.mdx');
    const { stdout, exitCode } = await execa(binaryPath, [testMdxPath]);
    
    expect(exitCode).toBe(0);
    expect(stdout.length).toBeGreaterThan(0);
  });

  test('binary exits with error for non-existent file', async () => {
    try {
      await execa(binaryPath, ['/non/existent/file.mdx']);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error.exitCode).toBe(1);
    }
  });

  test('binary exits with error for empty stdin', async () => {
    try {
      await execa(binaryPath, [], { input: '' });
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error.exitCode).toBe(1);
      expect(error.stderr).toContain('No input provided');
    }
  });
});

// =============================================================================
// CLI VS BINARY PARITY
// =============================================================================

describe('CLI vs Binary Parity', () => {
  test('CLI and binary produce same output for simple MDX', async () => {
    const mdxInput = '# Test Heading\n\nSome **bold** text.';
    
    const [cliResult, binaryResult] = await Promise.all([
      execa('node', [cliPath], { input: mdxInput }),
      execa(binaryPath, [], { input: mdxInput })
    ]);

    expect(cliResult.stdout).toBe(binaryResult.stdout);
  });

  test('CLI and binary produce same version', async () => {
    const [cliResult, binaryResult] = await Promise.all([
      execa('node', [cliPath, '--version']),
      execa(binaryPath, ['--version'])
    ]);

    expect(cliResult.stdout.trim()).toBe(binaryResult.stdout.trim());
  });
});

// =============================================================================
// BUILD ARTIFACT CONSISTENCY
// =============================================================================

describe('Build Artifact Consistency', () => {
  test('all platform binaries exist', () => {
    expect(fs.existsSync(BUNDLED_FILE)).toBe(true);
    expect(fs.existsSync(MACOS_BINARY)).toBe(true);
    expect(fs.existsSync(LINUX_BINARY)).toBe(true);
    expect(fs.existsSync(WINDOWS_BINARY)).toBe(true);
  });

  test('bundled file is smaller than binaries', () => {
    const bundledSize = fs.statSync(BUNDLED_FILE).size;
    const binarySize = fs.statSync(binaryPath).size;

    // Bundled JS should be much smaller than the binary (which includes Node.js runtime)
    expect(bundledSize).toBeLessThan(binarySize);
  });
});
