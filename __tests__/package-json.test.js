/**
 * Test suite for package.json
 *
 * Testing library/framework: Node.js built-in test runner (node:test) + assert/strict.
 * Rationale:
 * - Focuses on validating configuration changes reflected in package.json.
 * - Covers schema presence, critical script commands, lint-staged config, dependency pinning,
 *   and inter-package compatibility expectations tied to Next.js + React stack.
 * - Includes edge-case tests for internal helpers to validate version constraints.
 */

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const test = require('node:test');

const PKG_PATH = path.join(process.cwd(), 'package.json');

function readPkg() {
  const raw = fs.readFileSync(PKG_PATH, 'utf8');
  return JSON.parse(raw);
}

function isExactSemver(v) {
  return typeof v === 'string' && /^\d+\.\d+\.\d+$/.test(v);
}

function majorOf(v) {
  assert.ok(isExactSemver(v), `Version is not exact semver: ${v}`);
  return Number(v.split('.')[0]);
}

test('package.json parses as valid JSON', () => {
  const pkg = readPkg();
  assert.ok(pkg && typeof pkg === 'object');
});

test('has required top-level keys and expected basic values', () => {
  const pkg = readPkg();
  assert.equal(pkg.name, 'dozu-ui-service');
  assert.equal(pkg.version, '0.1.0');
  assert.equal(pkg.private, true);
  assert.ok(pkg.scripts && typeof pkg.scripts === 'object', 'scripts should exist');
  assert.ok(pkg.dependencies && typeof pkg.dependencies === 'object', 'dependencies should exist');
  assert.ok(pkg.devDependencies && typeof pkg.devDependencies === 'object', 'devDependencies should exist');
});

test('scripts contain expected commands (dev/build/start/lint/prepare)', () => {
  const { scripts } = readPkg();
  assert.equal(scripts.dev, 'next dev');
  assert.equal(scripts.build, 'next build');
  assert.equal(scripts.start, 'next start');
  assert.equal(scripts.lint, 'next lint');
  assert.equal(scripts.prepare, 'husky install');
});

test('scripts include Windows production variants (dev:prod and build:prod)', () => {
  const { scripts } = readPkg();
  // These are Windows-style env settings; validate exact presence as defined
  assert.equal(scripts['dev:prod'], 'set NODE_ENV=production&& next dev');
  assert.equal(scripts['build:prod'], 'set NODE_ENV=production&& next build');
});

test('test script exists and uses node --test (built-in runner)', () => {
  const { scripts } = readPkg();
  assert.ok(typeof scripts.test === 'string', 'scripts.test should be defined');
  assert.equal(scripts.test, 'node --test');
});

test('lint-staged config exists with expected pattern and tasks', () => {
  const pkg = readPkg();
  const ls = pkg['lint-staged'];
  assert.ok(ls && typeof ls === 'object', 'lint-staged should exist');
  const patternKey = '*.{ts,tsx,js,jsx}';
  assert.ok(patternKey in ls, `lint-staged should define key "${patternKey}"`);
  const tasks = ls[patternKey];
  assert.ok(Array.isArray(tasks), 'lint-staged tasks should be an array');
  assert.ok(tasks.includes('prettier --write'), 'should include prettier --write');
  assert.ok(tasks.includes('eslint --fix'), 'should include eslint --fix');
});

test('all dependencies are pinned to exact versions (no ^, ~, ranges, tags)', () => {
  const { dependencies, devDependencies } = readPkg();
  for (const [name, ver] of Object.entries(dependencies)) {
    assert.ok(isExactSemver(ver), `Dependency "${name}" must be exact semver, got: ${ver}`);
  }
  for (const [name, ver] of Object.entries(devDependencies)) {
    assert.ok(isExactSemver(ver), `DevDependency "${name}" must be exact semver, got: ${ver}`);
  }
});

test('no package appears in both dependencies and devDependencies', () => {
  const { dependencies, devDependencies } = readPkg();
  const dupes = Object.keys(dependencies).filter((k) => k in devDependencies);
  assert.equal(dupes.length, 0, `Packages duplicated across deps/devDeps: ${dupes.join(', ')}`);
});

test('core framework compatibility: Next 14 with React 18.x', () => {
  const { dependencies } = readPkg();
  assert.ok(dependencies.next, 'next should be present');
  assert.ok(dependencies.react, 'react should be present');
  assert.ok(dependencies['react-dom'], 'react-dom should be present');

  assert.equal(majorOf(dependencies.next), 14, `next major should be 14, got ${dependencies.next}`);
  assert.equal(majorOf(dependencies.react), 18, `react major should be 18, got ${dependencies.react}`);
  assert.equal(majorOf(dependencies['react-dom']), 18, `react-dom major should be 18, got ${dependencies['react-dom']}`);
});

test('critical libraries are present at expected versions', () => {
  const pkg = readPkg();
  const expectExact = (section, name, version) => {
    assert.ok(pkg[section] && pkg[section][name], `Missing ${section}.${name}`);
    assert.equal(pkg[section][name], version, `Expected ${section}.${name}=${version}`);
  };

  // Key runtime deps
  expectExact('dependencies', 'next', '14.2.30');
  expectExact('dependencies', 'react', '18.3.1');
  expectExact('dependencies', 'react-dom', '18.3.1');
  expectExact('dependencies', '@reduxjs/toolkit', '2.5.0');
  expectExact('dependencies', 'react-redux', '9.2.0');
  expectExact('dependencies', 'zod', '3.24.2');
  expectExact('dependencies', 'axios', '1.10.0');

  // Key dev deps
  expectExact('devDependencies', 'typescript', '5.8.3');
  expectExact('devDependencies', 'eslint', '8.57.1');
  expectExact('devDependencies', 'eslint-config-next', '14.2.9');
});

test('helper isExactSemver handles edge cases and rejects ranges/tags', () => {
  // Valid cases
  ['0.0.1', '1.2.3', '10.20.30', '4.8.69'].forEach((v) => {
    assert.equal(isExactSemver(v), true, `Expected valid exact semver: ${v}`);
  });

  // Invalid cases
  [
    '^1.2.3', '~1.2.3', '>=1.2.3', '<2.0.0', '1.2', '1.2.3-beta.1', 'latest', '1.2.x',
    '', null, undefined, 123, {}, []
  ].forEach((v) => {
    assert.equal(isExactSemver(v), false, `Expected invalid exact semver: ${String(v)}`);
  });
});