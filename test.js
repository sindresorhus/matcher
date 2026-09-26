/* eslint-disable node-test/no-conditional-assertion -- Many tests here sweep generated cases, so the assertions sit inside a loop over them. The loops always run, and every case is checked. */
import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {matcher, isMatch} from './index.js';

test('matcher()', () => {
	assert.deepEqual(matcher(['foo', 'bar'], ['foo']), ['foo']);
	assert.deepEqual(matcher(['foo', 'bar'], ['bar']), ['bar']);
	assert.deepEqual(matcher(['foo', 'bar'], ['fo*', 'ba*', '!bar']), ['foo']);
	assert.deepEqual(matcher(['foo', 'bar', 'moo'], ['!*o']), ['bar']);
	assert.deepEqual(matcher(['moo', 'MOO'], ['*oo'], {caseSensitive: true}), ['moo']);
	assert.deepEqual(matcher(['moo', 'MOO'], ['*oo'], {caseSensitive: false}), ['moo', 'MOO']);

	assert.deepEqual(matcher([], []), []);
});

test('isMatch()', () => {
	assert.ok(isMatch('unicorn', 'unicorn'));
	assert.ok(isMatch('MOO', 'MOO'));
	assert.ok(isMatch('unicorn', 'uni*'));
	assert.ok(isMatch('UNICORN', 'unicorn', {caseSensitive: false}));
	assert.ok(isMatch('unicorn', '*corn'));
	assert.ok(isMatch('unicorn', 'un*rn'));
	assert.ok(isMatch('foo unicorn bar', '*unicorn*'));
	assert.ok(isMatch('unicorn', '*'));
	assert.ok(isMatch('UNICORN', 'UNI*', {caseSensitive: true}));
	assert.ok(!isMatch('UNICORN', 'unicorn', {caseSensitive: true}));
	assert.ok(!isMatch('unicorn', ''));
	assert.ok(!isMatch('unicorn', '!unicorn'));
	assert.ok(!isMatch('unicorn', '!uni*'));
	assert.ok(!isMatch('unicorn', String.raw`uni\*`));
	assert.ok(isMatch('unicorn', '!tricorn'));
	assert.ok(isMatch('unicorn', '!tri*'));

	assert.ok(isMatch(['foo', 'bar', 'moo'], '*oo'));
	assert.ok(isMatch(['foo', 'bar', 'moo'], ['*oo', '!f*']));
	assert.ok(isMatch('moo', ['*oo', '!f*']));
	assert.ok(isMatch('UNICORN', ['!*oo', 'UNI*'], {caseSensitive: true}));

	assert.ok(!isMatch(['unicorn', 'bar', 'wizard'], '*oo'));
	assert.ok(!isMatch(['foo', 'bar', 'unicorn'], ['*horn', '!b*']));
	assert.ok(!isMatch('moo', ['*oo', '!m*']));
	assert.ok(!isMatch('UNICORN', ['!*oo', 'uni*'], {caseSensitive: true}));
});

test('matches across newlines', () => {
	assert.deepEqual(matcher(['foo\nbar'], ['foo*']), ['foo\nbar']);
	assert.deepEqual(matcher(['foo\nbar'], ['foo*r']), ['foo\nbar']);
	assert.ok(isMatch(['foo\nbar'], ['foo*']));
	assert.ok(isMatch(['foo\nbar'], ['foo*r']));
});

test('handles empty arguments consistently', () => {
	assert.deepEqual(matcher(['phoenix'], ['bar', '']), []);
	assert.deepEqual(matcher(['phoenix'], ['', 'bar']), []);
	assert.deepEqual(matcher(['phoenix'], ['', 'bar', '']), []);
	assert.deepEqual(matcher(['phoenix'], ['bar', '', 'bar']), []);
	assert.deepEqual(matcher(['phoenix'], [undefined, '']), []);
	assert.deepEqual(matcher(['phoenix'], ['', undefined]), []);
	assert.deepEqual(matcher(['phoenix'], ['', undefined, '']), []);
	assert.deepEqual(matcher(['phoenix'], [undefined, '', undefined]), []);
	assert.deepEqual(matcher(['phoenix'], ['', '']), []);
	assert.deepEqual(matcher(['phoenix'], ['']), []);
	assert.deepEqual(matcher(['phoenix'], ''), []);
	assert.deepEqual(matcher(['phoenix'], []), []);
	assert.deepEqual(matcher(['phoenix'], [undefined]), []);
	assert.deepEqual(matcher(['phoenix'], undefined), []);

	assert.deepEqual(matcher(['phoenix', ''], ['bar']), []);
	assert.deepEqual(matcher(['', 'phoenix'], ['bar']), []);
	assert.deepEqual(matcher(['', 'phoenix', ''], ['bar']), []);
	assert.deepEqual(matcher(['phoenix', '', 'phoenix'], ['bar']), []);
	assert.deepEqual(matcher([undefined, ''], ['bar']), []);
	assert.deepEqual(matcher(['', undefined], ['bar']), []);
	assert.deepEqual(matcher(['', undefined, ''], ['bar']), []);
	assert.deepEqual(matcher([undefined, '', undefined], ['bar']), []);
	assert.deepEqual(matcher(['', ''], ['bar']), []);
	assert.deepEqual(matcher([''], ['bar']), []);
	assert.deepEqual(matcher('', ['bar']), []);
	assert.deepEqual(matcher([], ['bar']), []);
	assert.deepEqual(matcher([undefined], ['bar']), []);
	assert.deepEqual(matcher(undefined, ['bar']), []);

	assert.ok(!isMatch(['phoenix'], ['bar', '']));
	assert.ok(!isMatch(['phoenix'], ['', 'bar']));
	assert.ok(!isMatch(['phoenix'], ['', 'bar', '']));
	assert.ok(!isMatch(['phoenix'], ['bar', '', 'bar']));
	assert.ok(!isMatch(['phoenix'], [undefined, '']));
	assert.ok(!isMatch(['phoenix'], ['', undefined]));
	assert.ok(!isMatch(['phoenix'], ['', undefined, '']));
	assert.ok(!isMatch(['phoenix'], [undefined, '', undefined]));
	assert.ok(!isMatch(['phoenix'], ['', '']));
	assert.ok(!isMatch(['phoenix'], ['']));
	assert.ok(!isMatch(['phoenix'], ''));
	assert.ok(!isMatch(['phoenix'], []));
	assert.ok(!isMatch(['phoenix'], [undefined]));
	assert.ok(!isMatch(['phoenix'], undefined));

	assert.ok(!isMatch(['phoenix', ''], ['bar']));
	assert.ok(!isMatch(['', 'phoenix'], ['bar']));
	assert.ok(!isMatch(['', 'phoenix', ''], ['bar']));
	assert.ok(!isMatch(['phoenix', '', 'phoenix'], ['bar']));
	assert.ok(!isMatch([undefined, ''], ['bar']));
	assert.ok(!isMatch(['', undefined], ['bar']));
	assert.ok(!isMatch(['', undefined, ''], ['bar']));
	assert.ok(!isMatch([undefined, '', undefined], ['bar']));
	assert.ok(!isMatch(['', ''], ['bar']));
	assert.ok(!isMatch([''], ['bar']));
	assert.ok(!isMatch('', ['bar']));
	assert.ok(!isMatch([], ['bar']));
	assert.ok(!isMatch([undefined], ['bar']));
	assert.ok(!isMatch(undefined, ['bar']));

	assert.deepEqual(matcher([''], ['bar', '']), ['']);
	assert.deepEqual(matcher([''], ['', 'bar']), ['']);
	assert.deepEqual(matcher([''], [undefined, '']), ['']);
	assert.deepEqual(matcher([''], ['', undefined]), ['']);
	assert.deepEqual(matcher([''], ['', '']), ['']);

	assert.deepEqual(matcher(['phoenix', ''], ['']), ['']);
	assert.deepEqual(matcher(['', 'phoenix'], ['']), ['']);
	assert.deepEqual(matcher([undefined, ''], ['']), ['']);
	assert.deepEqual(matcher(['', undefined], ['']), ['']);
	assert.deepEqual(matcher(['', ''], ['']), ['', '']);

	assert.deepEqual(matcher([''], ['']), ['']);
	assert.deepEqual(matcher([''], ['*']), ['']);

	assert.deepEqual(matcher([undefined], ['bar', undefined]), []);
	assert.deepEqual(matcher([undefined], [undefined, 'bar']), []);
	assert.deepEqual(matcher([undefined], ['', undefined]), []);
	assert.deepEqual(matcher([undefined], [undefined, '']), []);
	assert.deepEqual(matcher([undefined], [undefined, undefined]), []);
	assert.deepEqual(matcher([undefined], [undefined]), []);
	assert.deepEqual(matcher([undefined], undefined), []);

	assert.deepEqual(matcher(['phoenix', undefined], [undefined]), []);
	assert.deepEqual(matcher([undefined, 'phoenix'], [undefined]), []);
	assert.deepEqual(matcher(['', undefined], [undefined]), []);
	assert.deepEqual(matcher([undefined, ''], [undefined]), []);
	assert.deepEqual(matcher([undefined, undefined], [undefined]), []);
	assert.deepEqual(matcher([undefined], [undefined]), []);
	assert.deepEqual(matcher(undefined, [undefined]), []);

	assert.deepEqual(matcher([], []), []);
	assert.deepEqual(matcher([], ['*']), []);

	assert.ok(isMatch([''], [undefined, '']));
	assert.ok(isMatch([''], ['', undefined]));
	assert.ok(isMatch([''], ['', '']));

	assert.ok(isMatch(['phoenix', ''], ['']));
	assert.ok(isMatch(['', 'phoenix'], ['']));
	assert.ok(isMatch([undefined, ''], ['']));
	assert.ok(isMatch(['', undefined], ['']));
	assert.ok(isMatch(['', ''], ['']));

	assert.ok(isMatch([''], ['']));
	assert.ok(isMatch([''], ['*']));

	assert.ok(!isMatch([undefined], ['bar', undefined]));
	assert.ok(!isMatch([undefined], [undefined, 'bar']));
	assert.ok(!isMatch([undefined], ['', undefined]));
	assert.ok(!isMatch([undefined], [undefined, '']));
	assert.ok(!isMatch([undefined], [undefined, undefined]));
	assert.ok(!isMatch([undefined], [undefined]));
	assert.ok(!isMatch([undefined], undefined));

	assert.ok(!isMatch(['phoenix', undefined], [undefined]));
	assert.ok(!isMatch([undefined, 'phoenix'], [undefined]));
	assert.ok(!isMatch(['', undefined], [undefined]));
	assert.ok(!isMatch([undefined, ''], [undefined]));
	assert.ok(!isMatch([undefined, undefined], [undefined]));
	assert.ok(!isMatch([undefined], [undefined]));
	assert.ok(!isMatch(undefined, [undefined]));

	assert.ok(!isMatch([], []));
	assert.ok(!isMatch([], ['*']));

	assert.throws(() => {
		matcher(['phoenix'], [0]);
	}, TypeError);

	assert.throws(() => {
		matcher(['phoenix'], [null]);
	}, TypeError);

	assert.throws(() => {
		matcher(['phoenix'], [false]);
	}, TypeError);

	assert.throws(() => {
		matcher(['phoenix'], 0);
	}, TypeError);

	assert.throws(() => {
		matcher(['phoenix'], null);
	}, TypeError);

	assert.throws(() => {
		matcher(['phoenix'], false);
	}, TypeError);

	assert.throws(() => {
		matcher([0], ['bar']);
	}, TypeError);

	assert.throws(() => {
		matcher([null], ['bar']);
	}, TypeError);

	assert.throws(() => {
		matcher([false], ['bar']);
	}, TypeError);

	assert.throws(() => {
		matcher(0, ['bar']);
	}, TypeError);

	assert.throws(() => {
		matcher(null, ['bar']);
	}, TypeError);

	assert.throws(() => {
		matcher(false, ['bar']);
	}, TypeError);

	assert.throws(() => {
		isMatch(['phoenix'], [0]);
	}, TypeError);

	assert.throws(() => {
		isMatch(['phoenix'], [null]);
	}, TypeError);

	assert.throws(() => {
		isMatch(['phoenix'], [false]);
	}, TypeError);

	assert.throws(() => {
		isMatch(['phoenix'], 0);
	}, TypeError);

	assert.throws(() => {
		isMatch(['phoenix'], null);
	}, TypeError);

	assert.throws(() => {
		isMatch(['phoenix'], false);
	}, TypeError);

	assert.throws(() => {
		isMatch([0], ['bar']);
	}, TypeError);

	assert.throws(() => {
		isMatch([null], ['bar']);
	}, TypeError);

	assert.throws(() => {
		isMatch([false], ['bar']);
	}, TypeError);

	assert.throws(() => {
		isMatch(0, ['bar']);
	}, TypeError);

	assert.throws(() => {
		isMatch(null, ['bar']);
	}, TypeError);

	assert.throws(() => {
		isMatch(false, ['bar']);
	}, TypeError);
});

test('matcher() negated pattern placement', () => {
	assert.deepEqual(matcher(['foo', 'bar'], ['fo*', '!bar', 'ba*']), ['foo']);
	assert.deepEqual(matcher(['foo', 'bar'], ['!bar', 'fo*', 'ba*']), ['foo']);
	assert.deepEqual(matcher(['foo', 'bar'], ['!bar']), ['foo']);
	assert.deepEqual(matcher(['foo', 'bar'], ['!bar', 'fu']), []);
});

test('isMatch() negated pattern placement', () => {
	assert.ok(isMatch(['foo', 'bar'], ['fo*', '*oo', '!bar']));
	assert.ok(isMatch(['foo', 'bar'], ['!bar', 'fo*', '*oo']));
	assert.ok(isMatch(['foo', 'bar'], ['!bar']));
});

test('matcher() with allPatterns option', () => {
	const flags = {allPatterns: true};

	assert.deepEqual(matcher('foo', '!x*', flags), ['foo']);
	assert.deepEqual(matcher(['foo', 'bar', 'for'], ['f*', 'b*'], flags), []);
	assert.deepEqual(matcher(['foo', 'bar', 'for'], ['f*', 'x*'], flags), []);
	assert.deepEqual(matcher(['foo', 'bar', 'for'], ['f*', '!b*'], flags), ['foo', 'for']);
	assert.deepEqual(matcher(['foo', 'bar', 'for'], ['f*', '!x*'], flags), ['foo', 'for']);

	assert.deepEqual(
		matcher(
			['Hey, tiger!', 'tiger has edge over hyenas', 'pushing a tiger over the edge is a stunt'],
			['*edge*', '*tiger*', '!*stunt*'],
			flags,
		),
		['tiger has edge over hyenas'],
	);
});

test('isMatch() with allPatterns option', () => {
	const flags = {allPatterns: true};

	assert.ok(isMatch('foo', '!x*', flags));
	assert.ok(!isMatch(['foo', 'bar', 'for'], ['f*', 'b*'], flags));
	assert.ok(!isMatch(['foo', 'bar', 'for'], ['f*', 'x*'], flags));
	assert.ok(isMatch(['foo', 'bar', 'for'], ['f*', '!b*'], flags));
	assert.ok(isMatch(['foo', 'bar', 'for'], ['f*', '!x*'], flags));
	assert.ok(isMatch(['foo', 'bar'], ['!bar'], flags));
	assert.ok(isMatch(
		['Hey, tiger!', 'tiger has edge over hyenas', 'pushing a tiger over the edge is a stunt'],
		['*edge*', '*tiger*', '!*stunt*'],
		flags,
	));
});

test('isMatch() uses OR logic by default (matches ANY pattern)', () => {
	// Default behavior: input matches if it matches ANY of the patterns (OR logic)

	// Single input, multiple patterns
	assert.ok(isMatch('foo', ['f*', 'b*'])); // Matches first pattern
	assert.ok(isMatch('bar', ['f*', 'b*'])); // Matches second pattern
	assert.ok(!isMatch('zoo', ['f*', 'b*'])); // Matches neither pattern

	// Multiple inputs, multiple patterns
	assert.ok(isMatch(['foo', 'bar'], ['f*', 'b*'])); // Both inputs match at least one pattern
	assert.ok(isMatch(['foo', 'zoo'], ['f*', 'b*'])); // At least one input matches a pattern
	assert.ok(!isMatch(['zoo', 'moo'], ['f*', 'b*'])); // No input matches any pattern

	// Issue #31 use case - CORS origin matching
	const allowedOrigins = ['*.example.com', '*.dev.example.com'];
	assert.ok(isMatch('https://my.example.com', allowedOrigins)); // Matches first pattern
	assert.ok(isMatch('https://my.dev.example.com', allowedOrigins)); // Matches second pattern
	assert.ok(!isMatch('https://my.other.com', allowedOrigins)); // Matches neither pattern
});

test('isMatch() with allPatterns option uses AND logic (matches ALL patterns)', () => {
	// With allPatterns: true, input must match ALL non-negated patterns (AND logic)

	// Single input must match all patterns
	assert.ok(isMatch('foobar', ['f*', '*bar'], {allPatterns: true})); // Matches both
	assert.ok(!isMatch('foo', ['f*', '*bar'], {allPatterns: true})); // Matches only first
	assert.ok(!isMatch('bar', ['f*', '*bar'], {allPatterns: true})); // Matches only second

	// Multiple inputs - at least one must match all patterns
	assert.ok(isMatch(['foobar', 'zoo'], ['f*', '*bar'], {allPatterns: true})); // Foobar matches both
	assert.ok(!isMatch(['foo', 'bar'], ['f*', '*bar'], {allPatterns: true})); // No single input matches both

	// Issue #31 scenario with allPatterns would require matching both patterns
	const allowedOrigins = ['*.example.com', '*.dev.example.com'];
	assert.ok(!isMatch('https://my.example.com', allowedOrigins, {allPatterns: true})); // Doesn't match both
	assert.ok(isMatch('https://my.dev.example.com', allowedOrigins, {allPatterns: true})); // Actually matches both because * matches any prefix
});

test('isMatch() documentation examples with allPatterns', () => {
	// Test the exact examples from the documentation
	assert.ok(isMatch('foobar', ['foo*', '*bar'], {allPatterns: true}));
	assert.ok(!isMatch('foo', ['foo*', '*bar'], {allPatterns: true}));
});

test('special regex characters are literal', () => {
	// Dots should be literal, not regex wildcard
	assert.ok(isMatch('a.b', 'a.b'));
	assert.ok(!isMatch('axb', 'a.b'));

	// Other special regex chars should be literal
	assert.ok(isMatch('a+b', 'a+b'));
	assert.ok(isMatch('a?b', 'a?b'));
	assert.ok(isMatch('a(b)', 'a(b)'));
	assert.ok(isMatch('a[b]', 'a[b]'));
	assert.ok(isMatch('a{b}', 'a{b}'));
	assert.ok(isMatch('a^b$', 'a^b$'));

	// But * should still work as wildcard
	assert.ok(isMatch('axb', 'a*b'));
});

test('complex allPatterns scenarios with negations', () => {
	// Multiple negations - all must not match
	assert.ok(isMatch('abc', ['a*', '!*x', '!*y'], {allPatterns: true}));
	assert.ok(!isMatch('abx', ['a*', '!*x', '!*y'], {allPatterns: true}));
	assert.ok(!isMatch('aby', ['a*', '!*x', '!*y'], {allPatterns: true}));

	// Only negations - should match if none match
	assert.ok(isMatch('foo', ['!bar', '!baz'], {allPatterns: true}));
	assert.ok(!isMatch('bar', ['!bar', '!baz'], {allPatterns: true}));
});

test('issue #32 regression test', () => {
	// This was a bug in v4.0.0 that returned false instead of true
	assert.ok(isMatch(['foo', 'bar'], ['a*', 'b*'])); // 'bar' matches 'b*'
	assert.ok(isMatch(['apple', 'zoo'], ['a*', 'b*'])); // 'apple' matches 'a*'
	assert.ok(!isMatch(['foo', 'zoo'], ['a*', 'b*'])); // Neither matches
});

test('escaped characters handling', () => {
	// Escaped asterisks must stay literal (critical correctness)
	assert.ok(!isMatch('unicorn', String.raw`uni\*`)); // Per README promise
	assert.ok(isMatch('uni*', String.raw`uni\*`)); // Should match literal asterisk
	assert.ok(!isMatch('unixcorn', String.raw`uni\*`)); // Should not wildcard

	// Escaped spaces
	assert.ok(isMatch('a b', String.raw`a\ b`)); // Should match literal space
	assert.ok(!isMatch('ab', String.raw`a\ b`)); // Should require space
	assert.ok(!isMatch('axb', String.raw`a\ b`)); // Should not wildcard

	// Escaped backslashes
	assert.ok(isMatch('test\\', 'test\\\\'));
	assert.ok(!isMatch('test', 'test\\\\'));

	// Multiple escapes
	assert.ok(isMatch(String.raw`a\*b`, String.raw`a\\\*b`));
	assert.ok(!isMatch('axb', String.raw`a\\\*b`));
});

test('matches across newlines in wildcards', () => {
	// The README promises foo*r matches foo\nbar (critical correctness)
	assert.ok(isMatch('foo\nbar', 'foo*r'));
	assert.ok(isMatch('foo\nbar', 'foo*'));
	assert.ok(isMatch('foo\n\nbar', 'foo*bar'));
	assert.ok(isMatch('foo\r\nbar', 'foo*bar')); // Windows line endings
});

test('pattern cache with different case sensitivity', () => {
	// Test potential cache collision bug
	assert.ok(isMatch('FOO', 'foo', {caseSensitive: false}));
	assert.ok(!isMatch('FOO', 'foo', {caseSensitive: true}));
	// If cache is broken, second call might return wrong result
	assert.ok(isMatch('FOO', 'foo', {caseSensitive: false}));
	assert.ok(!isMatch('FOO', 'foo', {caseSensitive: true}));
});

test('unicode case handling', () => {
	// Standard JS case insensitive behavior - Turkish İ lowercases to i̇, not i
	assert.ok(!isMatch('İstanbul', 'i*', {caseSensitive: false})); // İ ≠ i in Unicode
	assert.ok(!isMatch('İstanbul', 'i*', {caseSensitive: true}));

	// But ASCII case insensitivity works as expected
	assert.ok(isMatch('Istanbul', 'i*', {caseSensitive: false}));
	assert.ok(!isMatch('Istanbul', 'i*', {caseSensitive: true}));
});

test('allPatterns edge cases', () => {
	// Only negations - should match if none match
	assert.ok(isMatch('foo', ['!bar', '!baz'], {allPatterns: true}));
	assert.ok(!isMatch('bar', ['!bar', '!baz'], {allPatterns: true}));

	// Mixed order should work the same
	assert.ok(isMatch('foo', ['!bar', 'f*'], {allPatterns: true}));
	assert.ok(isMatch('foo', ['f*', '!bar'], {allPatterns: true}));
	assert.ok(!isMatch('foobar', ['f*', '!*bar'], {allPatterns: true}));

	// No patterns at all
	assert.ok(!isMatch('test', [], {allPatterns: true}));
});

test('multiple escaped stars in one pattern', () => {
	assert.ok(isMatch('a*b*c', String.raw`a\*b\*c`));
	assert.ok(!isMatch('axbxc', String.raw`a\*b\*c`));
	assert.ok(isMatch('a*b*c*d', String.raw`a\*b\*c\*d`));
});

test('mixed escaped and unescaped wildcards', () => {
	assert.ok(isMatch('a*bcd', String.raw`a\*b*`)); // Literal * then wildcard
	assert.ok(isMatch('a*bxd', String.raw`a\*b*`)); // Literal * then wildcard matching x
	assert.ok(!isMatch('axbcd', String.raw`a\*b*`)); // Missing literal *
	assert.ok(isMatch('test*end', String.raw`*\*end`)); // Wildcard then literal *
	assert.ok(!isMatch('testend', String.raw`*\*end`)); // Missing literal *
});

test('consecutive wildcards optimization', () => {
	// Multiple * should work like single *
	assert.ok(isMatch('test', '**'));
	assert.ok(isMatch('test', '*****'));
	assert.ok(isMatch('a/b/c', '***'));
	assert.deepEqual(matcher(['foo', 'bar'], '**'), ['foo', 'bar']);
});

test('empty string with wildcards', () => {
	assert.ok(isMatch('', '*'));
	assert.ok(!isMatch('', '!*'));
	assert.ok(isMatch('', ''));
	assert.ok(!isMatch('', 'a*')); // Requires 'a' at start
	assert.ok(!isMatch('', '*a*')); // Requires 'a' somewhere
	assert.ok(isMatch('', '**')); // Multiple wildcards still match empty
});

test('pattern ending with escape character', () => {
	// A backslash with nothing after it is not an escape, so it matches itself.
	assert.ok(isMatch('test\\', 'test\\'));
	assert.ok(!isMatch('test', 'test\\'));
	assert.ok(isMatch('test\\', 'test\\\\'));
	assert.ok(!isMatch(String.raw`test\x`, 'test\\'));
});

test('real-world file matching scenarios', () => {
	// Common gitignore patterns
	assert.ok(isMatch('node_modules/foo', 'node_modules/*'));
	assert.ok(isMatch('.env.local', '.env*'));
	assert.ok(!isMatch('src/.env', '.env*'));

	// File extensions
	assert.ok(isMatch('test.js', '*.js'));
	assert.ok(!isMatch('test.jsx', '*.js'));
	assert.ok(isMatch('test.test.js', '*.test.js'));
	assert.ok(isMatch('component.test.tsx', '*.test.*'));
});

test('performance with many patterns', () => {
	const manyPatterns = Array.from({length: 100}, (_, i) => `pattern${i}*`);
	manyPatterns.push('test*'); // Add one that matches

	assert.ok(isMatch('test123', manyPatterns));
	assert.ok(!isMatch('nomatch', manyPatterns));

	// With allPatterns - should be false as not all patterns match
	assert.ok(!isMatch('test123', manyPatterns, {allPatterns: true}));
});

test('whitespace in patterns', () => {
	assert.ok(isMatch('hello world', 'hello world'));
	assert.ok(isMatch('hello world', 'hello*world'));
	assert.ok(isMatch('hello   world', 'hello*world'));
	assert.ok(!isMatch('helloworld', 'hello world'));

	// Tabs and other whitespace
	assert.ok(isMatch('hello\tworld', 'hello*world'));
	assert.ok(isMatch('hello\nworld', 'hello*world'));
});

test('negation edge cases', () => {
	// Negation with no positive patterns
	assert.ok(isMatch('foo', ['!bar']));
	assert.ok(!isMatch('bar', ['!bar']));

	// Multiple negations
	assert.ok(isMatch('foo', ['!bar', '!baz', '!qux']));
	assert.ok(!isMatch('bar', ['!bar', '!baz', '!qux']));

	// Negation that would match everything
	assert.ok(!isMatch('anything', ['!*']));
	assert.ok(!isMatch('', ['!*']));
});

test('case sensitivity edge cases', () => {
	// Patterns with mixed case
	assert.ok(isMatch('FooBar', 'foo*', {caseSensitive: false}));
	assert.ok(!isMatch('FooBar', 'foo*', {caseSensitive: true}));
	assert.ok(isMatch('FooBar', 'Foo*', {caseSensitive: true}));

	// Numbers and special chars (should not be affected by case sensitivity)
	assert.ok(isMatch('test123', 'test*', {caseSensitive: false}));
	assert.ok(isMatch('test123', 'test*', {caseSensitive: true}));
	assert.ok(isMatch('test-123', '*-123', {caseSensitive: false}));
	assert.ok(isMatch('test-123', '*-123', {caseSensitive: true}));
});

test('spaces in single pattern (README example)', () => {
	// Prove the README "spaces in a single pattern" example works
	assert.ok(isMatch('foo bar baz', 'foo b* b*'));
	assert.ok(!isMatch('foo bar', 'foo b* b*'));
	assert.ok(isMatch('foo bx bz', 'foo b* b*'));
	assert.ok(isMatch('foo b b', 'foo b* b*'));
});

test('allPatterns with only negations', () => {
	// Should include items not matching any negation
	assert.ok(isMatch('foo', ['!bar', '!baz'], {allPatterns: true}));
	assert.ok(!isMatch('bar', ['!bar', '!baz'], {allPatterns: true}));
	assert.ok(!isMatch('baz', ['!bar', '!baz'], {allPatterns: true}));
	assert.ok(isMatch('qux', ['!bar', '!baz'], {allPatterns: true}));

	// With multiple inputs
	assert.ok(isMatch(['foo', 'qux'], ['!bar', '!baz'], {allPatterns: true}));
	assert.ok(isMatch(['foo', 'bar'], ['!bar', '!baz'], {allPatterns: true})); // Only `bar` is excluded
	assert.ok(!isMatch(['bar', 'baz'], ['!bar', '!baz'], {allPatterns: true})); // Both are excluded
});

test('massive pattern set with duplicates', () => {
	// Test cache behavior and performance with duplicates
	const patterns = [
		...Array.from({length: 50}, () => 'test*'), // 50 duplicates
		...Array.from({length: 50}, () => 'foo*'), // 50 more duplicates
		'unique*',
	];

	assert.ok(isMatch('test123', patterns));
	assert.ok(isMatch('foo123', patterns));
	assert.ok(isMatch('unique123', patterns));
	assert.ok(!isMatch('nomatch', patterns));

	// Ensure it works with matcher() too
	const results = matcher(['test1', 'foo2', 'unique3', 'nomatch'], patterns);
	assert.deepEqual(results, ['test1', 'foo2', 'unique3']);
});

test('matching time does not grow exponentially with the number of wildcards', () => {
	const start = performance.now();
	assert.ok(!isMatch('a'.repeat(60), '*a'.repeat(30) + 'b'));
	assert.ok(!isMatch('a'.repeat(100_000), '*a*a*a*b'));
	assert.ok(!isMatch('a'.repeat(100_000), '*a*a*a*b', {caseSensitive: true}));
	assert.ok(isMatch('a'.repeat(100_000) + 'b', '*a*a*a*b'));
	assert.ok(performance.now() - start < 1000);
});

test('case-insensitive matching of long non-ASCII input is fast', () => {
	const start = performance.now();
	assert.ok(!isMatch('é'.repeat(2_000_000), '*a'));
	assert.ok(!isMatch('a'.repeat(2_000_000) + 'é', '*b'));
	assert.ok(!isMatch('a'.repeat(2_000_000) + 'ß', '*b'));
	assert.ok(performance.now() - start < 1000);
});

test('escaped backslash before a wildcard', () => {
	assert.ok(isMatch(String.raw`a\bc`, String.raw`a\\*`));
	assert.ok(!isMatch('a*', String.raw`a\\*`));
});

test('placeholder-like text in patterns is literal', () => {
	assert.ok(isMatch('__ESCAPED_STAR__', '__ESCAPED_STAR__'));
	assert.ok(!isMatch('*', '__ESCAPED_STAR__'));
	assert.ok(isMatch('__ESCAPED_BACKSLASH__', '__ESCAPED_BACKSLASH__'));
});

test('case-insensitive matching does not fold lookalike characters into ASCII', () => {
	assert.ok(!isMatch('https://gıthub.com/login', 'https://github.com/*'));
	assert.ok(!isMatch('https://claßic.com/x', 'https://classic.com/*'));
	assert.ok(!isMatch('report.jſ', '*.js'));
	assert.ok(!isMatch('ﬁle', 'file'));
	assert.ok(isMatch('ÆBLE', 'æble'));
	assert.ok(isMatch('ΣΊΣΥΦΟΣ', 'σίσυφος'));
});

/* eslint-disable no-extend-native, no-use-extend-native/no-use-extend-native, unicorn/no-nonstandard-builtin-properties -- These tests pollute the prototype on purpose, and restore it afterwards. */
test('ignores polluted options on the prototype', () => {
	Object.prototype.caseSensitive = true;
	Object.prototype.allPatterns = true;

	try {
		assert.ok(isMatch('SECRET.txt', 'secret*'));
		assert.deepEqual(matcher(['SECRET'], ['*', '!secret'], {}), []);
		assert.ok(isMatch('foo', ['f*', 'b*']));
	} finally {
		delete Object.prototype.caseSensitive;
		delete Object.prototype.allPatterns;
	}
});

test('an empty pattern is not negated by a polluted prototype', () => {
	Object.prototype[0] = '!';

	let result;
	try {
		result = matcher(['a', ''], '', {caseSensitive: true});
	} finally {
		delete Object.prototype[0];
	}

	assert.deepEqual(result, ['']);
});
/* eslint-enable no-extend-native, no-use-extend-native/no-use-extend-native, unicorn/no-nonstandard-builtin-properties */

test('patterns still match correctly after the cache evicts them', () => {
	for (let index = 0; index < 3000; index++) {
		assert.ok(isMatch(`foo${index}bar`, `foo${index}*`));
		assert.ok(!isMatch(`FOO${index}bar`, `foo${index}*`, {caseSensitive: true}));
	}

	assert.ok(isMatch('foo0bar', 'foo0*'));
	assert.ok(isMatch('FOO0bar', 'foo0*'));
	assert.ok(!isMatch('FOO0bar', 'foo0*', {caseSensitive: true}));
	assert.ok(!isMatch('foo1bar', 'foo0*'));
});

test('a single call with more patterns than the cache holds', () => {
	// One call compiling thousands of patterns evicts its own earlier entries. The compiled patterns are already held by that call, so nothing may be lost.
	const patterns = Array.from({length: 5000}, (_, index) => `item${index}`);
	patterns.push('!item4999');

	assert.deepEqual(matcher(['item0', 'item2500', 'item4999', 'item5000', 'nope'], patterns, {caseSensitive: true}), ['item0', 'item2500']);

	// The same, with nothing but negations, which is the case that once depended on how many there were.
	const negations = Array.from({length: 3000}, (_, index) => `!no${index}`);
	const kept = ['yes', 'no0', 'no2999', 'no3000'];
	const all = {allPatterns: true};

	assert.deepEqual(matcher(kept, negations), ['yes', 'no3000']);
	assert.deepEqual(matcher(kept, negations, all), ['yes', 'no3000']);
	assert.ok(isMatch(kept, negations, all));
	assert.ok(!isMatch(['no0'], negations, all));

	// Repeating one pattern many times must not change the answer either.
	const repeated = Array.from({length: 5000}, () => 'a*');

	assert.deepEqual(matcher(['ab', 'b'], repeated), ['ab']);
	assert.deepEqual(matcher(['ab', 'b'], repeated, {allPatterns: true}), ['ab']);
});

// Deterministic pseudo-random numbers (Park-Miller), so that failures can be reproduced.
const createRandom = seed => () => {
	seed = (seed * 16_807) % 2_147_483_647;
	return (seed - 1) / 2_147_483_646;
};

const randomString = (random, alphabet, maximumLength) => Array.from({length: Math.floor(random() * (maximumLength + 1))}, () => alphabet[Math.floor(random() * alphabet.length)]).join('');

const randomAlphabet = ['a', 'b', 'A', '.', '*', '\\', '!', '\n', 'ß', 'ı', 'ſ', 'K', 'é', 'É', 'Σ', 'ς', '😀', '\u{D83D}'];

// Every string of length 0..maximumLength over the alphabet, in length order.
const enumerateStrings = (alphabet, maximumLength) => {
	const strings = [''];
	let frontier = [''];

	for (let length = 1; length <= maximumLength; length++) {
		frontier = frontier.flatMap(prefix => alphabet.map(character => prefix + character));
		strings.push(...frontier);
	}

	return strings;
};

// Makes a pattern that only matches the given string.
const escapePattern = string => string.replaceAll(/[!*\\]/gv, String.raw`\$&`);

const escapeForRegex = string => string.replaceAll(/[$\(\)*+\-.?\[\\\]^\{\|\}]/gv, String.raw`\$&`);

// The sweeps below reuse a few hundred patterns across tens of thousands of inputs, so the compiled form is kept. Building the source and the RegExp each time costs far more than the test itself does.
const referenceRegexpCache = new Map();

// The documented semantics of the pattern body, as a regex. Only safe for short patterns.
const referenceBodyMatch = (input, pattern, caseSensitive) => {
	const cacheKey = (caseSensitive ? 'S' : 'I') + pattern;
	let regexp = referenceRegexpCache.get(cacheKey);

	if (regexp === undefined) {
		let source = '';

		for (let index = pattern.startsWith('!') ? 1 : 0; index < pattern.length; index++) {
			let character = pattern[index];

			if (character === '*') {
				source += '.*';
				continue;
			}

			if (character === '\\' && index + 1 < pattern.length) {
				index++;
				character = pattern[index];
			}

			source += escapeForRegex(character);
		}

		regexp = new RegExp(`^${source}$`, caseSensitive ? 's' : 'si');
		referenceRegexpCache.set(cacheKey, regexp);
	}

	return regexp.test(input);
};

const referenceIsMatch = (input, pattern, caseSensitive) => {
	const matches = referenceBodyMatch(input, pattern, caseSensitive);
	return pattern.startsWith('!') ? !matches : matches;
};

// The documented per-input semantics of a whole pattern list, as the readme describes it: omit the input if it matches a negation, if it matches none of the non-negated patterns while any exist (or not all of them with `allPatterns`), or if there is no pattern at all.
const referenceMatchesInput = (input, patterns, {caseSensitive, allPatterns}) => {
	if (patterns.length === 0) {
		return false;
	}

	const positives = patterns.filter(pattern => !pattern.startsWith('!'));

	if (patterns.some(pattern => pattern.startsWith('!') && referenceBodyMatch(input, pattern, caseSensitive))) {
		return false;
	}

	if (positives.length === 0) {
		return true;
	}

	return allPatterns
		? positives.every(pattern => referenceBodyMatch(input, pattern, caseSensitive))
		: positives.some(pattern => referenceBodyMatch(input, pattern, caseSensitive));
};

// Returns the first `[input, pattern, caseSensitive]` case where `isMatch()` disagrees with the reference, so that a regression fails with one readable case instead of thousands.
const findReferenceMismatch = cases => cases.find(([input, pattern, caseSensitive]) => isMatch(input, pattern, {caseSensitive}) !== referenceIsMatch(input, pattern, caseSensitive));

// The same for whole lists: `matcher()` has to keep exactly the inputs the reference keeps, and `isMatch()` has to be true exactly when it keeps any.
const findListReferenceMismatch = cases => cases.find(([inputs, patterns, options]) => {
	const expected = inputs.filter(input => referenceMatchesInput(input, patterns, options));
	const isAnyExpected = expected.length > 0;

	return JSON.stringify(matcher(inputs, patterns, options)) !== JSON.stringify(expected)
		|| isMatch(inputs, patterns, options) !== isAnyExpected;
});

const randomCases = ({seed, alphabet, maximumLength, count}) => {
	const random = createRandom(seed);
	return Array.from({length: count}, () => [randomString(random, alphabet, maximumLength), randomString(random, alphabet, maximumLength), random() < 0.5]);
};

test('matches like the equivalent regex for random patterns and inputs', () => {
	assert.equal(findReferenceMismatch(randomCases({
		seed: 1,
		alphabet: randomAlphabet,
		maximumLength: 6,
		count: 5000,
	})), undefined);
});

test('matches like the equivalent regex for random wildcard-heavy patterns', () => {
	// A small alphabet makes repeated and overlapping parts common.
	assert.equal(findReferenceMismatch(randomCases({
		seed: 4,
		alphabet: ['a', 'b', '*'],
		maximumLength: 8,
		count: 10_000,
	})), undefined);
});

test('an escaped pattern matches only its own text', () => {
	const random = createRandom(2);

	for (let index = 0; index < 2000; index++) {
		const string = randomString(random, randomAlphabet, 10);
		const pattern = escapePattern(string);

		assert.ok(isMatch(string, pattern, {caseSensitive: true}));
		assert.ok(!isMatch(string + 'x', pattern, {caseSensitive: true}));
		assert.ok(!isMatch('x' + string, pattern, {caseSensitive: true}));
		assert.ok(isMatch('x' + string + 'x', `*${pattern}*`, {caseSensitive: true}));
	}
});

test('matcher() keeps the input order and duplicates', () => {
	assert.deepEqual(matcher(['b', 'a', 'c', 'b'], ['a', 'b']), ['b', 'a', 'b']);
	assert.deepEqual(matcher(['b', 'a', 'c', 'b'], ['!c']), ['b', 'a', 'b']);
});

test('does not mutate the arguments', () => {
	const inputs = Object.freeze(['foo', 'bar']);
	const patterns = Object.freeze(['f*', '!bar']);
	const options = Object.freeze({caseSensitive: true, allPatterns: true});

	assert.deepEqual(matcher(inputs, patterns, options), ['foo']);
	assert.ok(isMatch(inputs, patterns, options));
	assert.deepEqual(inputs, ['foo', 'bar']);
	assert.deepEqual(patterns, ['f*', '!bar']);
});

test('a lone `!` pattern excludes only the empty string', () => {
	assert.ok(isMatch('a', '!'));
	assert.ok(!isMatch('', '!'));
	assert.deepEqual(matcher(['', 'a', ''], '!'), ['a']);
});

test('the rule for omitting an input', () => {
	// No pattern at all omits everything.
	assert.deepEqual(matcher(['foo'], []), []);
	assert.deepEqual(matcher(['foo'], undefined), []);

	// A negated pattern omits the inputs it matches.
	assert.deepEqual(matcher(['foo', 'bar'], ['!bar']), ['foo']);

	// When every pattern is negated, an input survives as long as it matches none of them.
	assert.deepEqual(matcher(['foo', 'bar'], ['!bar', '!baz']), ['foo']);
	assert.deepEqual(matcher(['foo', 'bar', 'baz'], ['!bar', '!baz']), ['foo']);

	// A non-negated pattern present means the input has to match it.
	assert.deepEqual(matcher(['foo', 'bar'], ['bar']), ['bar']);
	assert.deepEqual(matcher(['foo'], ['bar']), []);

	// Negations win over non-negated patterns, whatever the order.
	assert.deepEqual(matcher(['foo', 'bar'], ['bar', '!bar']), []);
	assert.deepEqual(matcher(['foo', 'bar'], ['!bar', 'bar']), []);
});

test('only a leading `!` negates', () => {
	assert.ok(isMatch('!foo', String.raw`\!foo`));
	assert.ok(!isMatch('foo', String.raw`\!foo`));
	assert.ok(isMatch('a!b', 'a!*'));
	assert.ok(!isMatch('!foo', '!!foo'));
	assert.ok(isMatch('foo', '!!foo'));
	assert.ok(isMatch('!', String.raw`\!`));
});

test('the same pattern with and without negation', () => {
	assert.ok(isMatch('foo', 'foo'));
	assert.ok(!isMatch('foo', '!foo'));
	assert.ok(!isMatch('foo', ['foo', '!foo']));
	assert.ok(!isMatch('foo', ['!foo', 'foo']));
});

test('literal parts around a wildcard must not overlap', () => {
	assert.ok(!isMatch('a', 'a*a'));
	assert.ok(isMatch('aa', 'a*a'));
	assert.ok(!isMatch('abc', 'ab*bc'));
	assert.ok(isMatch('abbc', 'ab*bc'));
	assert.ok(!isMatch('ab', '*ab*b'));
	assert.ok(isMatch('abb', '*ab*b'));
	assert.ok(!isMatch('aba', 'aba*aba'));
	assert.ok(isMatch('abaaba', 'aba*aba'));
});

test('middle parts must appear in order', () => {
	assert.ok(isMatch('xaxbx', '*a*b*'));
	assert.ok(!isMatch('xbxax', '*a*b*'));
	assert.ok(isMatch('aab', '*a*ab'));
	assert.ok(isMatch('abcabc', '*bc*ab*'));
	assert.ok(!isMatch('abcab', '*bc*abc'));
	assert.ok(isMatch('foo.min.js', '*.min.*js'));
	assert.ok(!isMatch('foo.js.min', '*.min.*js'));
});

test('middle parts must not overlap each other', () => {
	assert.ok(!isMatch('a', '*a*a*'));
	assert.ok(isMatch('aa', '*a*a*'));
	assert.ok(!isMatch('aba', '*ab*ba*'));
	assert.ok(isMatch('abba', '*ab*ba*'));
	assert.ok(!isMatch('aaa', '*aa*aa*'));
	assert.ok(isMatch('aaaa', '*aa*aa*'));
});

test('an escaped wildcard between wildcards', () => {
	assert.ok(isMatch('a*b', String.raw`*\**`));
	assert.ok(isMatch('*', String.raw`*\**`));
	assert.ok(!isMatch('ab', String.raw`*\**`));
	assert.ok(isMatch('**', String.raw`\*\*`));
	assert.ok(!isMatch('*x*', String.raw`\*\*`));
});

test('a backslash escapes any character', () => {
	assert.ok(isMatch('abc', String.raw`\a\b\c`));
	assert.ok(isMatch('\n', '\\\n'));
	assert.ok(isMatch('😀', String.raw`\😀`));
	assert.ok(isMatch(String.raw`\a`, String.raw`\\a`));
	assert.ok(!isMatch('a', String.raw`\\a`));
});

test('consecutive wildcards around literals', () => {
	assert.ok(isMatch('abc', '**b**'));
	assert.ok(isMatch('b', '**b**'));
	assert.ok(!isMatch('ac', '**b**'));
	assert.ok(isMatch('ab', 'a***b'));
	assert.ok(!isMatch('a', 'a***b'));
});

test('wildcards match surrogate pairs and lone surrogates', () => {
	assert.ok(isMatch('😀', '*'));
	assert.ok(isMatch('a😀b', 'a*b'));
	assert.ok(isMatch('😀🦄', '😀*'));
	assert.ok(isMatch('\u{D800}', '*'));
	assert.ok(isMatch('a\u{DC00}', 'A\u{DC00}'));
	// Like a regex without the `u` flag, patterns work on UTF-16 code units, so a wildcard can match half of a surrogate pair.
	assert.ok(isMatch('😀', '\u{D83D}*'));
});

test('case-insensitive matching of non-ASCII letters', () => {
	assert.ok(isMatch('ÉCOLE', 'école'));
	assert.ok(isMatch('ΟΔΟΣ', 'οδος'));
	assert.ok(isMatch('ς', 'σ'));
	assert.ok(isMatch('ДОМ', 'дом'));
	assert.ok(!isMatch('ÉCOLE', 'école', {caseSensitive: true}));
	assert.ok(!isMatch('ß', 'ẞ'));
	assert.ok(!isMatch('\u{212A}', 'k')); // Kelvin sign
	assert.ok(!isMatch('𐐀', '𐐨')); // Astral case pairs are not folded, like a regex without the `u` flag
});

test('options can be null or have truthy values', () => {
	assert.ok(isMatch('FOO', 'foo', null));
	assert.deepEqual(matcher(['FOO'], 'foo', null), ['FOO']);
	assert.ok(!isMatch('FOO', 'foo', {caseSensitive: 1}));
	assert.ok(!isMatch(['foo', 'bar'], ['f*', 'b*'], {allPatterns: 'yes'}));
});

test('throws descriptive errors for invalid arguments', () => {
	assert.throws(() => {
		matcher(1, 'a');
	}, {name: 'TypeError', message: 'Expected \'inputs\' to be a string or an array, but got a type of \'number\''});

	assert.throws(() => {
		isMatch('a', [null]);
	}, {name: 'TypeError', message: 'Expected \'patterns\' to be an array of strings, but found a type of \'object\' in the array'});

	assert.throws(() => {
		matcher(new Set(['a']), 'a');
	}, {name: 'TypeError', message: /'inputs'/v});

	// Inputs are validated before patterns
	assert.throws(() => {
		isMatch(1, 1);
	}, {message: /'inputs'/v});
});

test('holes in arrays are ignored', () => {
	const inputs = ['a', 'b'];
	inputs[3] = 'c';
	const patterns = ['a', 'c'];
	patterns[5] = 'b';

	assert.deepEqual(matcher(inputs, '*'), ['a', 'b', 'c']);
	assert.deepEqual(matcher(['a', 'b', 'c'], patterns), ['a', 'b', 'c']);
});

test('matcher() with many inputs and patterns', () => {
	const inputs = Array.from({length: 1000}, (_, index) => `item${index}`);

	assert.equal(matcher(inputs, 'item1*').length, 111); // 1, 10-19, 100-199
	assert.equal(matcher(inputs, ['item1*', '!*0']).length, 100);
	assert.equal(matcher(inputs, ['item*', '!item?*']).length, 1000); // `?` is not a wildcard
	assert.equal(matcher(inputs, ['*1*', '*2*'], {allPatterns: true}).length, 54); // 1000 - 729 without a 1 - 729 without a 2 + 512 without both
	assert.equal(matcher(inputs, Array.from({length: 100}, (_, index) => `item${index * 10}`)).length, 100);
});

test('allPatterns with only negations: each input is checked on its own', () => {
	const options = {allPatterns: true};

	// An input is kept when it matches none of the negations. `isMatch()` is just "did any input survive", so it must agree with `matcher()` here too.
	assert.deepEqual(matcher(['foo', 'bar'], ['!bar', '!baz'], options), ['foo']);
	assert.ok(isMatch(['foo', 'bar'], ['!bar', '!baz'], options));
	assert.ok(!isMatch(['bar', 'baz'], ['!bar', '!baz'], options));
	assert.ok(!isMatch([], ['!bar', '!baz'], options));

	// Listing the same negation twice used to flip the answer, because the number of negated patterns decided whether `isMatch()` required every input to pass.
	assert.ok(isMatch(['foo', 'bar'], ['!bar'], options));
	assert.ok(isMatch(['foo', 'bar'], ['!bar', '!bar'], options));
	assert.ok(isMatch(['foo', 'bar'], ['!bar', '!bar', '!bar'], options));
	assert.ok(!isMatch(['bar'], ['!bar', '!bar'], options));
});

test('allPatterns with empty and wildcard patterns', () => {
	assert.ok(isMatch('', ['', '*'], {allPatterns: true}));
	assert.ok(!isMatch('a', ['', '*'], {allPatterns: true}));
	assert.deepEqual(matcher(['', 'a'], ['*', '!'], {allPatterns: true}), ['a']);
});

test('long literal patterns and many wildcards', () => {
	const long = 'ab'.repeat(50_000);

	assert.ok(isMatch(long, long));
	assert.ok(!isMatch(long + 'a', long));
	assert.ok(isMatch(long, `a*${'*'.repeat(10_000)}b`));
	assert.ok(isMatch(long, `*${'b*'.repeat(1000)}`));
	assert.ok(!isMatch(long, `*${'c*'.repeat(1000)}`));
});

// Extracts the fenced code blocks from a markdown file, including the ones indented inside the doc comments of `index.d.ts`. A fence is three or more backticks or tildes with an optional language tag; anything not matching that is not a fence at all, since mistaking prose for a fence would silently swallow the block after it.
const extractCodeBlocks = markdown => {
	const blocks = [];
	let openFence;
	let language;
	let current;

	for (const line of markdown.split('\n')) {
		const fence = line.match(/^\s*(?<marker>`{3,}|~{3,})[\t ]*(?<language>[\w\-]*)/v);

		if (fence) {
			// Only the same character and at least as many of them closes a block.
			const isClosingFence = openFence !== undefined
				&& fence.groups.marker[0] === openFence[0]
				&& fence.groups.marker.length >= openFence.length;

			if (isClosingFence) {
				blocks.push({language, source: current.join('\n')});
				openFence = undefined;
				language = undefined;
				current = undefined;
			} else if (openFence === undefined) {
				openFence = fence.groups.marker;
				language = fence.groups.language;
				current = [];
			}

			continue;
		}

		if (current) {
			// Doc comments indent their content by one tab.
			current.push(line.replace(/^\t/v, ''));
		}
	}

	if (openFence !== undefined) {
		throw new Error('A fenced code block is never closed');
	}

	return blocks;
};

// Rewrites `expression` followed by `//=> value` into a recorded comparison, and drops the `import` lines so the block can run against this module directly. An expression with no `//=>` line under it is recorded as undocumented, so that dropping one is noticed rather than quietly reducing what the suite checks.
const rewriteBlock = block => {
	const output = [];
	// The expression most recently seen, waiting for a `//=>` line to describe it.
	let pending;

	const isSkippable = line => line.trim() === '' || line.trimStart().startsWith('//');
	const isDeclaration = line => /^(?:const|let|var|function|class|return)\b/v.test(line.trim());
	const record = (expression, documented) => `__checks__.push([() => (${expression}), ${JSON.stringify(documented)}, ${JSON.stringify(expression)}]);`;
	const recordUndocumented = expression => record(expression, null);

	for (const line of block.split('\n')) {
		if (/^import\s/v.test(line.trim())) {
			continue;
		}

		const expected = line.match(/^\s*\/\/=>(?<value>.*)$/v);

		if (expected) {
			if (pending === undefined) {
				throw new Error(`A "//=>" comment has no expression above it:\n${block}`);
			}

			output.push(record(pending, expected.groups.value.trim()));
			pending = undefined;
			continue;
		}

		if (isSkippable(line)) {
			output.push(line);
			continue;
		}

		if (isDeclaration(line)) {
			pending = undefined;
			output.push(line);
			continue;
		}

		if (pending !== undefined) {
			output.push(recordUndocumented(pending));
		}

		pending = line.trim().replace(/;$/v, '');
		output.push(line);
	}

	if (pending !== undefined) {
		output.push(recordUndocumented(pending));
	}

	return output.join('\n');
};

// The documented values are plain literals, so evaluating them as an expression is safe.
// eslint-disable-next-line no-new-func
const evaluateLiteral = source => new Function(`"use strict"; return (${source});`)();

// Runs every `//=> example` in the given file, compares it to the real result, and returns how many there were. The tests assert that count exactly, so that deleting an example has to be deliberate.
const checkDocumentedExamples = file => {
	const blocks = extractCodeBlocks(readFileSync(new URL(file, import.meta.url), 'utf8'));
	const annotated = blocks.filter(({source}) => source.includes('//=>'));
	// Examples belong in `js` or untagged blocks. One under any other tag is reported, so that retagging a block cannot quietly turn its examples into something the docs no longer present as JavaScript.
	const otherLanguages = annotated.filter(({language}) => language !== '' && language !== 'js');

	assert.deepEqual(otherLanguages.map(({language}) => language), [], `${file} has example blocks tagged with another language`);

	let total = 0;

	for (const {source} of annotated) {
		// eslint-disable-next-line no-new-func
		const run = new Function('__checks__', 'matcher', 'isMatch', `"use strict";\n${rewriteBlock(source)}`);
		const collected = [];
		run(collected, matcher, isMatch);

		for (const [getResult, documented, label] of collected) {
			total++;

			if (documented === null) {
				assert.fail(`${file}: \`${label}\` has no "//=>" line documenting its result`);
			}

			assert.deepEqual(getResult(), evaluateLiteral(documented), `${file}: ${label}`);
		}
	}

	return total;
};

test('every example in the readme produces the documented result', () => {
	assert.equal(checkDocumentedExamples('readme.md'), 30);
});

test('every example in the type declarations produces the documented result', () => {
	assert.equal(checkDocumentedExamples('index.d.ts'), 27);
});

const codePointName = codePoint => `U+${codePoint.toString(16).toUpperCase()}`;

test('matches the equivalent regex for every short pattern and input', () => {
	// Exhaustive over every pattern of up to four characters and every input of up to three, in both case modes. The alphabet has a letter in both cases and every metacharacter, so nothing in the parser or in case folding is left to chance.
	const patterns = enumerateStrings(['a', 'A', '*', '\\', '!'], 4);
	const inputs = patterns.filter(pattern => pattern.length <= 3);
	const cases = [true, false].flatMap(caseSensitive => patterns.flatMap(pattern => inputs.map(input => [input, pattern, caseSensitive])));

	assert.equal(cases.length, 2 * 781 * 156);
	assert.equal(findReferenceMismatch(cases), undefined);
});

test('matcher() keeps exactly the inputs the reference keeps, for every pair of patterns', () => {
	const patterns = enumerateStrings(['a', '*', '!', '\\'], 2);
	const inputs = enumerateStrings(['a', 'b'], 3);
	// No character here has another case in the inputs, so only `allPatterns` is varied. Case folding is covered by the sweep above.
	const pairs = patterns.flatMap(first => patterns.map(second => [first, second]));
	const cases = [true, false].flatMap(allPatterns => pairs.map(pair => [inputs, pair, {allPatterns}]));

	assert.equal(cases.length, 2 * 21 * 21);
	assert.equal(findListReferenceMismatch(cases), undefined);
});

test('matcher() and isMatch() agree with the reference for random lists, whatever the order or repetition of the patterns', () => {
	const random = createRandom(31_337);
	const cases = [];

	for (let index = 0; index < 1500; index++) {
		const inputs = Array.from({length: Math.floor(random() * 5)}, () => randomString(random, randomAlphabet, 5));
		const patterns = Array.from({length: Math.floor(random() * 4)}, () => randomString(random, randomAlphabet, 5));
		const options = {caseSensitive: random() < 0.5, allPatterns: random() < 0.5};

		// The reference ignores order and repetition, so agreeing with it for all three lists proves that `matcher()` and `isMatch()` do too.
		cases.push([inputs, patterns, options], [inputs, [...patterns, ...patterns], options], [inputs, patterns.toReversed(), options]);
	}

	assert.equal(findListReferenceMismatch(cases), undefined);
});

test('case-insensitive matching folds every case-mapped character like a regex does', () => {
	// Every character that has a case mapping has to match its own uppercase and lowercase form exactly like `/^<char>$/i` without the `u` flag, which is what `normalizeCase()` is built to reproduce.
	let checked = 0;

	for (let codePoint = 0; codePoint <= 0x10_FF_FF; codePoint++) {
		const character = String.fromCodePoint(codePoint);
		const upper = character.toUpperCase();
		const lower = character.toLowerCase();

		if (upper === character && lower === character) {
			continue;
		}

		checked += 2;

		for (const [form, description] of [[upper, 'uppercase'], [lower, 'lowercase']]) {
			// eslint-disable-next-line require-unicode-regexp -- The reference deliberately has no `u` or `v` flag, since case folding without it is what is being reproduced.
			const shouldMatch = new RegExp(`^${escapeForRegex(form)}$`, 'is').test(character);

			if (isMatch(character, form) !== shouldMatch) {
				assert.fail(`the ${description} form of ${codePointName(codePoint)} should ${shouldMatch ? '' : 'not '}match case-insensitively`);
			}
		}
	}

	assert.ok(checked > 5000, `only checked ${checked} case-mapped characters`);
});

test('every string without a backslash or a leading `!` matches itself', () => {
	// A string only matches itself if it has no `\` to escape with and no leading `!` to negate it, so the alphabet leaves both out. The strings are sampled, since every distinct pattern costs a cache miss and sweeping all 1.1 million code points takes far longer than the rest of the suite.
	const random = createRandom(20_250_926);
	const alphabet = ['a', 'A', '0', ' ', '\n', '*', 'é', 'É', 'ß', 'ı', 'ſ', 'K', 'Σ', 'ς', '中', '😀', '\u{D83D}'];
	const strings = Array.from({length: 2000}, () => randomString(random, alphabet, 3));

	// A regular stride over the astral planes, where the code points live that the hand-picked alphabet above cannot reach.
	for (let codePoint = 0x1_00_00; codePoint <= 0x10_FF_FF; codePoint += 4096) {
		strings.push(String.fromCodePoint(codePoint));
	}

	for (const caseSensitive of [true, false]) {
		assert.deepEqual(strings.filter(string => !isMatch(string, string, {caseSensitive})), [], `caseSensitive: ${caseSensitive}`);
	}
});

test('a string containing a metacharacter does not necessarily match itself', () => {
	// The two reasons a string stops matching itself, spelled out so the invariant above does not look like it should hold for these.
	assert.ok(!isMatch(String.raw`\a`, String.raw`\a`)); // The pattern `\a` asks for a literal `a`
	assert.ok(isMatch('a', String.raw`\a`));
	assert.ok(!isMatch(String.raw`a\b`, String.raw`a\b`));
	assert.ok(!isMatch('!*', '!*')); // A leading `!` negates, and the body is a wildcard
	assert.ok(isMatch('!x', '!x')); // True only because `!x` is not `x`
	assert.ok(isMatch('a!', 'a!')); // A `!` that is not leading is literal

	// Escaping every metacharacter makes any string match itself again.
	for (const string of [String.raw`\a`, '!*', String.raw`a\*b!`, '*', '!', '\\']) {
		assert.ok(isMatch(string, escapePattern(string), {caseSensitive: true}), `escaped self-match of ${JSON.stringify(string)}`);
	}
});

test('matches the equivalent regex for random code points from all of Unicode', () => {
	const random = createRandom(4242);

	// Draw from the whole range instead of a fixed alphabet, so astral letters, CJK, RTL scripts, combining marks and punctuation all get exercised.
	const drawCodePoint = () => {
		for (;;) {
			const roll = random();
			let codePoint;

			if (roll < 0.45) {
				codePoint = Math.floor(random() * 0x80);
			} else if (roll < 0.6) {
				codePoint = Math.floor(random() * 0x6_00);
			} else if (roll < 0.8) {
				codePoint = 0x30_00 + Math.floor(random() * 0x30_00);
			} else if (roll < 0.9) {
				codePoint = 0x1_00_00 + Math.floor(random() * 0x10_00);
			} else {
				codePoint = 0x10_00 + Math.floor(random() * 0x10_00);
			}

			if (codePoint >= 0xD8_00 && codePoint <= 0xDF_FF) {
				continue; // Skip surrogates so the string stays well-formed.
			}

			return String.fromCodePoint(codePoint);
		}
	};

	const metacharacters = String.raw`*\!`;
	const drawCharacter = metacharacterChance => random() < metacharacterChance ? metacharacters[Math.floor(random() * metacharacters.length)] : drawCodePoint();
	const randomText = metacharacterChance => Array.from({length: Math.floor(random() * 5)}, () => drawCharacter(metacharacterChance)).join('');
	const cases = [];

	for (let index = 0; index < 2000; index++) {
		const input = randomText(0.25);
		const pattern = randomText(0.35);
		cases.push([input, pattern, true], [input, pattern, false]);
	}

	assert.equal(findReferenceMismatch(cases), undefined);
});
