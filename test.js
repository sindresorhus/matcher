import {readFileSync} from 'node:fs';
import test from 'ava';
import {matcher, isMatch} from './index.js';

test('matcher()', t => {
	t.deepEqual(matcher(['foo', 'bar'], ['foo']), ['foo']);
	t.deepEqual(matcher(['foo', 'bar'], ['bar']), ['bar']);
	t.deepEqual(matcher(['foo', 'bar'], ['fo*', 'ba*', '!bar']), ['foo']);
	t.deepEqual(matcher(['foo', 'bar', 'moo'], ['!*o']), ['bar']);
	t.deepEqual(matcher(['moo', 'MOO'], ['*oo'], {caseSensitive: true}), ['moo']);
	t.deepEqual(matcher(['moo', 'MOO'], ['*oo'], {caseSensitive: false}), ['moo', 'MOO']);

	t.notThrows(() => {
		matcher([], []);
	});
});

test('isMatch()', t => {
	t.true(isMatch('unicorn', 'unicorn'));
	t.true(isMatch('MOO', 'MOO'));
	t.true(isMatch('unicorn', 'uni*'));
	t.true(isMatch('UNICORN', 'unicorn', {caseSensitive: false}));
	t.true(isMatch('unicorn', '*corn'));
	t.true(isMatch('unicorn', 'un*rn'));
	t.true(isMatch('foo unicorn bar', '*unicorn*'));
	t.true(isMatch('unicorn', '*'));
	t.true(isMatch('UNICORN', 'UNI*', {caseSensitive: true}));
	t.false(isMatch('UNICORN', 'unicorn', {caseSensitive: true}));
	t.false(isMatch('unicorn', ''));
	t.false(isMatch('unicorn', '!unicorn'));
	t.false(isMatch('unicorn', '!uni*'));
	t.false(isMatch('unicorn', String.raw`uni\*`));
	t.true(isMatch('unicorn', '!tricorn'));
	t.true(isMatch('unicorn', '!tri*'));

	t.true(isMatch(['foo', 'bar', 'moo'], '*oo'));
	t.true(isMatch(['foo', 'bar', 'moo'], ['*oo', '!f*']));
	t.true(isMatch('moo', ['*oo', '!f*']));
	t.true(isMatch('UNICORN', ['!*oo', 'UNI*'], {caseSensitive: true}));

	t.false(isMatch(['unicorn', 'bar', 'wizard'], '*oo'));
	t.false(isMatch(['foo', 'bar', 'unicorn'], ['*horn', '!b*']));
	t.false(isMatch('moo', ['*oo', '!m*']));
	t.false(isMatch('UNICORN', ['!*oo', 'uni*'], {caseSensitive: true}));
});

test('matches across newlines', t => {
	t.deepEqual(matcher(['foo\nbar'], ['foo*']), ['foo\nbar']);
	t.deepEqual(matcher(['foo\nbar'], ['foo*r']), ['foo\nbar']);
	t.true(isMatch(['foo\nbar'], ['foo*']));
	t.true(isMatch(['foo\nbar'], ['foo*r']));
});

test('handles empty arguments consistently', t => {
	t.deepEqual(matcher(['phoenix'], ['bar', '']), []);
	t.deepEqual(matcher(['phoenix'], ['', 'bar']), []);
	t.deepEqual(matcher(['phoenix'], ['', 'bar', '']), []);
	t.deepEqual(matcher(['phoenix'], ['bar', '', 'bar']), []);
	t.deepEqual(matcher(['phoenix'], [undefined, '']), []);
	t.deepEqual(matcher(['phoenix'], ['', undefined]), []);
	t.deepEqual(matcher(['phoenix'], ['', undefined, '']), []);
	t.deepEqual(matcher(['phoenix'], [undefined, '', undefined]), []);
	t.deepEqual(matcher(['phoenix'], ['', '']), []);
	t.deepEqual(matcher(['phoenix'], ['']), []);
	t.deepEqual(matcher(['phoenix'], ''), []);
	t.deepEqual(matcher(['phoenix'], []), []);
	t.deepEqual(matcher(['phoenix'], [undefined]), []);
	t.deepEqual(matcher(['phoenix'], undefined), []);

	t.deepEqual(matcher(['phoenix', ''], ['bar']), []);
	t.deepEqual(matcher(['', 'phoenix'], ['bar']), []);
	t.deepEqual(matcher(['', 'phoenix', ''], ['bar']), []);
	t.deepEqual(matcher(['phoenix', '', 'phoenix'], ['bar']), []);
	t.deepEqual(matcher([undefined, ''], ['bar']), []);
	t.deepEqual(matcher(['', undefined], ['bar']), []);
	t.deepEqual(matcher(['', undefined, ''], ['bar']), []);
	t.deepEqual(matcher([undefined, '', undefined], ['bar']), []);
	t.deepEqual(matcher(['', ''], ['bar']), []);
	t.deepEqual(matcher([''], ['bar']), []);
	t.deepEqual(matcher('', ['bar']), []);
	t.deepEqual(matcher([], ['bar']), []);
	t.deepEqual(matcher([undefined], ['bar']), []);
	t.deepEqual(matcher(undefined, ['bar']), []);

	t.false(isMatch(['phoenix'], ['bar', '']));
	t.false(isMatch(['phoenix'], ['', 'bar']));
	t.false(isMatch(['phoenix'], ['', 'bar', '']));
	t.false(isMatch(['phoenix'], ['bar', '', 'bar']));
	t.false(isMatch(['phoenix'], [undefined, '']));
	t.false(isMatch(['phoenix'], ['', undefined]));
	t.false(isMatch(['phoenix'], ['', undefined, '']));
	t.false(isMatch(['phoenix'], [undefined, '', undefined]));
	t.false(isMatch(['phoenix'], ['', '']));
	t.false(isMatch(['phoenix'], ['']));
	t.false(isMatch(['phoenix'], ''));
	t.false(isMatch(['phoenix'], []));
	t.false(isMatch(['phoenix'], [undefined]));
	t.false(isMatch(['phoenix'], undefined));

	t.false(isMatch(['phoenix', ''], ['bar']));
	t.false(isMatch(['', 'phoenix'], ['bar']));
	t.false(isMatch(['', 'phoenix', ''], ['bar']));
	t.false(isMatch(['phoenix', '', 'phoenix'], ['bar']));
	t.false(isMatch([undefined, ''], ['bar']));
	t.false(isMatch(['', undefined], ['bar']));
	t.false(isMatch(['', undefined, ''], ['bar']));
	t.false(isMatch([undefined, '', undefined], ['bar']));
	t.false(isMatch(['', ''], ['bar']));
	t.false(isMatch([''], ['bar']));
	t.false(isMatch('', ['bar']));
	t.false(isMatch([], ['bar']));
	t.false(isMatch([undefined], ['bar']));
	t.false(isMatch(undefined, ['bar']));

	t.deepEqual(matcher([''], ['bar', '']), ['']);
	t.deepEqual(matcher([''], ['', 'bar']), ['']);
	t.deepEqual(matcher([''], [undefined, '']), ['']);
	t.deepEqual(matcher([''], ['', undefined]), ['']);
	t.deepEqual(matcher([''], ['', '']), ['']);

	t.deepEqual(matcher(['phoenix', ''], ['']), ['']);
	t.deepEqual(matcher(['', 'phoenix'], ['']), ['']);
	t.deepEqual(matcher([undefined, ''], ['']), ['']);
	t.deepEqual(matcher(['', undefined], ['']), ['']);
	t.deepEqual(matcher(['', ''], ['']), ['', '']);

	t.deepEqual(matcher([''], ['']), ['']);
	t.deepEqual(matcher([''], ['*']), ['']);

	t.deepEqual(matcher([undefined], ['bar', undefined]), []);
	t.deepEqual(matcher([undefined], [undefined, 'bar']), []);
	t.deepEqual(matcher([undefined], ['', undefined]), []);
	t.deepEqual(matcher([undefined], [undefined, '']), []);
	t.deepEqual(matcher([undefined], [undefined, undefined]), []);
	t.deepEqual(matcher([undefined], [undefined]), []);
	t.deepEqual(matcher([undefined], undefined), []);

	t.deepEqual(matcher(['phoenix', undefined], [undefined]), []);
	t.deepEqual(matcher([undefined, 'phoenix'], [undefined]), []);
	t.deepEqual(matcher(['', undefined], [undefined]), []);
	t.deepEqual(matcher([undefined, ''], [undefined]), []);
	t.deepEqual(matcher([undefined, undefined], [undefined]), []);
	t.deepEqual(matcher([undefined], [undefined]), []);
	t.deepEqual(matcher(undefined, [undefined]), []);

	t.deepEqual(matcher([], []), []);
	t.deepEqual(matcher([], ['*']), []);

	t.true(isMatch([''], [undefined, '']));
	t.true(isMatch([''], ['', undefined]));
	t.true(isMatch([''], ['', '']));

	t.true(isMatch(['phoenix', ''], ['']));
	t.true(isMatch(['', 'phoenix'], ['']));
	t.true(isMatch([undefined, ''], ['']));
	t.true(isMatch(['', undefined], ['']));
	t.true(isMatch(['', ''], ['']));

	t.true(isMatch([''], ['']));
	t.true(isMatch([''], ['*']));

	t.false(isMatch([undefined], ['bar', undefined]));
	t.false(isMatch([undefined], [undefined, 'bar']));
	t.false(isMatch([undefined], ['', undefined]));
	t.false(isMatch([undefined], [undefined, '']));
	t.false(isMatch([undefined], [undefined, undefined]));
	t.false(isMatch([undefined], [undefined]));
	t.false(isMatch([undefined], undefined));

	t.false(isMatch(['phoenix', undefined], [undefined]));
	t.false(isMatch([undefined, 'phoenix'], [undefined]));
	t.false(isMatch(['', undefined], [undefined]));
	t.false(isMatch([undefined, ''], [undefined]));
	t.false(isMatch([undefined, undefined], [undefined]));
	t.false(isMatch([undefined], [undefined]));
	t.false(isMatch(undefined, [undefined]));

	t.false(isMatch([], []));
	t.false(isMatch([], ['*']));

	t.throws(() => {
		matcher(['phoenix'], [0]);
	});

	t.throws(() => {
		matcher(['phoenix'], [null]);
	});

	t.throws(() => {
		matcher(['phoenix'], [false]);
	});

	t.throws(() => {
		matcher(['phoenix'], 0);
	});

	t.throws(() => {
		matcher(['phoenix'], null);
	});

	t.throws(() => {
		matcher(['phoenix'], false);
	});

	t.throws(() => {
		matcher([0], ['bar']);
	});

	t.throws(() => {
		matcher([null], ['bar']);
	});

	t.throws(() => {
		matcher([false], ['bar']);
	});

	t.throws(() => {
		matcher(0, ['bar']);
	});

	t.throws(() => {
		matcher(null, ['bar']);
	});

	t.throws(() => {
		matcher(false, ['bar']);
	});

	t.throws(() => {
		isMatch(['phoenix'], [0]);
	});

	t.throws(() => {
		isMatch(['phoenix'], [null]);
	});

	t.throws(() => {
		isMatch(['phoenix'], [false]);
	});

	t.throws(() => {
		isMatch(['phoenix'], 0);
	});

	t.throws(() => {
		isMatch(['phoenix'], null);
	});

	t.throws(() => {
		isMatch(['phoenix'], false);
	});

	t.throws(() => {
		isMatch([0], ['bar']);
	});

	t.throws(() => {
		isMatch([null], ['bar']);
	});

	t.throws(() => {
		isMatch([false], ['bar']);
	});

	t.throws(() => {
		isMatch(0, ['bar']);
	});

	t.throws(() => {
		isMatch(null, ['bar']);
	});

	t.throws(() => {
		isMatch(false, ['bar']);
	});
});

test('matcher() negated pattern placement', t => {
	t.deepEqual(matcher(['foo', 'bar'], ['fo*', '!bar', 'ba*']), ['foo']);
	t.deepEqual(matcher(['foo', 'bar'], ['!bar', 'fo*', 'ba*']), ['foo']);
	t.deepEqual(matcher(['foo', 'bar'], ['!bar']), ['foo']);
	t.deepEqual(matcher(['foo', 'bar'], ['!bar', 'fu']), []);
});

test('isMatch() negated pattern placement', t => {
	t.true(isMatch(['foo', 'bar'], ['fo*', '*oo', '!bar']));
	t.true(isMatch(['foo', 'bar'], ['!bar', 'fo*', '*oo']));
	t.true(isMatch(['foo', 'bar'], ['!bar']));
});

test('matcher() with allPatterns option', t => {
	const flags = {allPatterns: true};

	t.deepEqual(matcher('foo', '!x*', flags), ['foo']);
	t.deepEqual(matcher(['foo', 'bar', 'for'], ['f*', 'b*'], flags), []);
	t.deepEqual(matcher(['foo', 'bar', 'for'], ['f*', 'x*'], flags), []);
	t.deepEqual(matcher(['foo', 'bar', 'for'], ['f*', '!b*'], flags), ['foo', 'for']);
	t.deepEqual(matcher(['foo', 'bar', 'for'], ['f*', '!x*'], flags), ['foo', 'for']);

	t.deepEqual(
		matcher(
			['Hey, tiger!', 'tiger has edge over hyenas', 'pushing a tiger over the edge is a stunt'],
			['*edge*', '*tiger*', '!*stunt*'],
			flags,
		),
		['tiger has edge over hyenas'],
	);
});

test('isMatch() with allPatterns option', t => {
	const flags = {allPatterns: true};

	t.true(isMatch('foo', '!x*', flags));
	t.false(isMatch(['foo', 'bar', 'for'], ['f*', 'b*'], flags));
	t.false(isMatch(['foo', 'bar', 'for'], ['f*', 'x*'], flags));
	t.true(isMatch(['foo', 'bar', 'for'], ['f*', '!b*'], flags));
	t.true(isMatch(['foo', 'bar', 'for'], ['f*', '!x*'], flags));
	t.true(isMatch(['foo', 'bar'], ['!bar'], flags));
	t.true(isMatch(
		['Hey, tiger!', 'tiger has edge over hyenas', 'pushing a tiger over the edge is a stunt'],
		['*edge*', '*tiger*', '!*stunt*'],
		flags,
	));
});

test('isMatch() uses OR logic by default (matches ANY pattern)', t => {
	// Default behavior: input matches if it matches ANY of the patterns (OR logic)

	// Single input, multiple patterns
	t.true(isMatch('foo', ['f*', 'b*'])); // Matches first pattern
	t.true(isMatch('bar', ['f*', 'b*'])); // Matches second pattern
	t.false(isMatch('zoo', ['f*', 'b*'])); // Matches neither pattern

	// Multiple inputs, multiple patterns
	t.true(isMatch(['foo', 'bar'], ['f*', 'b*'])); // Both inputs match at least one pattern
	t.true(isMatch(['foo', 'zoo'], ['f*', 'b*'])); // At least one input matches a pattern
	t.false(isMatch(['zoo', 'moo'], ['f*', 'b*'])); // No input matches any pattern

	// Issue #31 use case - CORS origin matching
	const allowedOrigins = ['*.example.com', '*.dev.example.com'];
	t.true(isMatch('https://my.example.com', allowedOrigins)); // Matches first pattern
	t.true(isMatch('https://my.dev.example.com', allowedOrigins)); // Matches second pattern
	t.false(isMatch('https://my.other.com', allowedOrigins)); // Matches neither pattern
});

test('isMatch() with allPatterns option uses AND logic (matches ALL patterns)', t => {
	// With allPatterns: true, input must match ALL non-negated patterns (AND logic)

	// Single input must match all patterns
	t.true(isMatch('foobar', ['f*', '*bar'], {allPatterns: true})); // Matches both
	t.false(isMatch('foo', ['f*', '*bar'], {allPatterns: true})); // Matches only first
	t.false(isMatch('bar', ['f*', '*bar'], {allPatterns: true})); // Matches only second

	// Multiple inputs - at least one must match all patterns
	t.true(isMatch(['foobar', 'zoo'], ['f*', '*bar'], {allPatterns: true})); // Foobar matches both
	t.false(isMatch(['foo', 'bar'], ['f*', '*bar'], {allPatterns: true})); // No single input matches both

	// Issue #31 scenario with allPatterns would require matching both patterns
	const allowedOrigins = ['*.example.com', '*.dev.example.com'];
	t.false(isMatch('https://my.example.com', allowedOrigins, {allPatterns: true})); // Doesn't match both
	t.true(isMatch('https://my.dev.example.com', allowedOrigins, {allPatterns: true})); // Actually matches both because * matches any prefix
});

test('isMatch() documentation examples with allPatterns', t => {
	// Test the exact examples from the documentation
	t.true(isMatch('foobar', ['foo*', '*bar'], {allPatterns: true}));
	t.false(isMatch('foo', ['foo*', '*bar'], {allPatterns: true}));
});

test('special regex characters are literal', t => {
	// Dots should be literal, not regex wildcard
	t.true(isMatch('a.b', 'a.b'));
	t.false(isMatch('axb', 'a.b'));

	// Other special regex chars should be literal
	t.true(isMatch('a+b', 'a+b'));
	t.true(isMatch('a?b', 'a?b'));
	t.true(isMatch('a(b)', 'a(b)'));
	t.true(isMatch('a[b]', 'a[b]'));
	t.true(isMatch('a{b}', 'a{b}'));
	t.true(isMatch('a^b$', 'a^b$'));

	// But * should still work as wildcard
	t.true(isMatch('axb', 'a*b'));
});

test('complex allPatterns scenarios with negations', t => {
	// Multiple negations - all must not match
	t.true(isMatch('abc', ['a*', '!*x', '!*y'], {allPatterns: true}));
	t.false(isMatch('abx', ['a*', '!*x', '!*y'], {allPatterns: true}));
	t.false(isMatch('aby', ['a*', '!*x', '!*y'], {allPatterns: true}));

	// Only negations - should match if none match
	t.true(isMatch('foo', ['!bar', '!baz'], {allPatterns: true}));
	t.false(isMatch('bar', ['!bar', '!baz'], {allPatterns: true}));
});

test('issue #32 regression test', t => {
	// This was a bug in v4.0.0 that returned false instead of true
	t.true(isMatch(['foo', 'bar'], ['a*', 'b*'])); // 'bar' matches 'b*'
	t.true(isMatch(['apple', 'zoo'], ['a*', 'b*'])); // 'apple' matches 'a*'
	t.false(isMatch(['foo', 'zoo'], ['a*', 'b*'])); // Neither matches
});

test('escaped characters handling', t => {
	// Escaped asterisks must stay literal (critical correctness)
	t.false(isMatch('unicorn', String.raw`uni\*`)); // Per README promise
	t.true(isMatch('uni*', String.raw`uni\*`)); // Should match literal asterisk
	t.false(isMatch('unixcorn', String.raw`uni\*`)); // Should not wildcard

	// Escaped spaces
	t.true(isMatch('a b', String.raw`a\ b`)); // Should match literal space
	t.false(isMatch('ab', String.raw`a\ b`)); // Should require space
	t.false(isMatch('axb', String.raw`a\ b`)); // Should not wildcard

	// Escaped backslashes
	t.true(isMatch('test\\', 'test\\\\'));
	t.false(isMatch('test', 'test\\\\'));

	// Multiple escapes
	t.true(isMatch(String.raw`a\*b`, String.raw`a\\\*b`));
	t.false(isMatch('axb', String.raw`a\\\*b`));
});

test('matches across newlines in wildcards', t => {
	// The README promises foo*r matches foo\nbar (critical correctness)
	t.true(isMatch('foo\nbar', 'foo*r'));
	t.true(isMatch('foo\nbar', 'foo*'));
	t.true(isMatch('foo\n\nbar', 'foo*bar'));
	t.true(isMatch('foo\r\nbar', 'foo*bar')); // Windows line endings
});

test('pattern cache with different case sensitivity', t => {
	// Test potential cache collision bug
	t.true(isMatch('FOO', 'foo', {caseSensitive: false}));
	t.false(isMatch('FOO', 'foo', {caseSensitive: true}));
	// If cache is broken, second call might return wrong result
	t.false(isMatch('FOO', 'foo', {caseSensitive: true}));
	t.true(isMatch('FOO', 'foo', {caseSensitive: false}));
});

test('unicode case handling', t => {
	// Standard JS case insensitive behavior - Turkish İ lowercases to i̇, not i
	t.false(isMatch('İstanbul', 'i*', {caseSensitive: false})); // İ ≠ i in Unicode
	t.false(isMatch('İstanbul', 'i*', {caseSensitive: true}));

	// But ASCII case insensitivity works as expected
	t.true(isMatch('Istanbul', 'i*', {caseSensitive: false}));
	t.false(isMatch('Istanbul', 'i*', {caseSensitive: true}));
});

test('allPatterns edge cases', t => {
	// Only negations - should match if none match
	t.true(isMatch('foo', ['!bar', '!baz'], {allPatterns: true}));
	t.false(isMatch('bar', ['!bar', '!baz'], {allPatterns: true}));

	// Mixed order should work the same
	t.true(isMatch('foo', ['!bar', 'f*'], {allPatterns: true}));
	t.true(isMatch('foo', ['f*', '!bar'], {allPatterns: true}));
	t.false(isMatch('foobar', ['f*', '!*bar'], {allPatterns: true}));

	// No patterns at all
	t.false(isMatch('test', [], {allPatterns: true}));
});

test('multiple escaped stars in one pattern', t => {
	t.true(isMatch('a*b*c', String.raw`a\*b\*c`));
	t.false(isMatch('axbxc', String.raw`a\*b\*c`));
	t.true(isMatch('a*b*c*d', String.raw`a\*b\*c\*d`));
});

test('mixed escaped and unescaped wildcards', t => {
	t.true(isMatch('a*bcd', String.raw`a\*b*`)); // Literal * then wildcard
	t.true(isMatch('a*bxd', String.raw`a\*b*`)); // Literal * then wildcard matching x
	t.false(isMatch('axbcd', String.raw`a\*b*`)); // Missing literal *
	t.true(isMatch('test*end', String.raw`*\*end`)); // Wildcard then literal *
	t.false(isMatch('testend', String.raw`*\*end`)); // Missing literal *
});

test('consecutive wildcards optimization', t => {
	// Multiple * should work like single *
	t.true(isMatch('test', '**'));
	t.true(isMatch('test', '*****'));
	t.true(isMatch('a/b/c', '***'));
	t.deepEqual(matcher(['foo', 'bar'], '**'), ['foo', 'bar']);
});

test('empty string with wildcards', t => {
	t.true(isMatch('', '*'));
	t.false(isMatch('', '!*'));
	t.true(isMatch('', ''));
	t.false(isMatch('', 'a*')); // Requires 'a' at start
	t.false(isMatch('', '*a*')); // Requires 'a' somewhere
	t.true(isMatch('', '**')); // Multiple wildcards still match empty
});

test('pattern ending with escape character', t => {
	// A backslash with nothing after it is not an escape, so it matches itself.
	t.true(isMatch('test\\', 'test\\'));
	t.false(isMatch('test', 'test\\'));
	t.true(isMatch('test\\', 'test\\\\'));
	t.false(isMatch(String.raw`test\x`, 'test\\'));
});

test('real-world file matching scenarios', t => {
	// Common gitignore patterns
	t.true(isMatch('node_modules/foo', 'node_modules/*'));
	t.true(isMatch('.env.local', '.env*'));
	t.false(isMatch('src/.env', '.env*'));

	// File extensions
	t.true(isMatch('test.js', '*.js'));
	t.false(isMatch('test.jsx', '*.js'));
	t.true(isMatch('test.test.js', '*.test.js'));
	t.true(isMatch('component.test.tsx', '*.test.*'));
});

test('performance with many patterns', t => {
	const manyPatterns = Array.from({length: 100}, (_, i) => `pattern${i}*`);
	manyPatterns.push('test*'); // Add one that matches

	t.true(isMatch('test123', manyPatterns));
	t.false(isMatch('nomatch', manyPatterns));

	// With allPatterns - should be false as not all patterns match
	t.false(isMatch('test123', manyPatterns, {allPatterns: true}));
});

test('whitespace in patterns', t => {
	t.true(isMatch('hello world', 'hello world'));
	t.true(isMatch('hello world', 'hello*world'));
	t.true(isMatch('hello   world', 'hello*world'));
	t.false(isMatch('helloworld', 'hello world'));

	// Tabs and other whitespace
	t.true(isMatch('hello\tworld', 'hello*world'));
	t.true(isMatch('hello\nworld', 'hello*world'));
});

test('negation edge cases', t => {
	// Negation with no positive patterns
	t.true(isMatch('foo', ['!bar']));
	t.false(isMatch('bar', ['!bar']));

	// Multiple negations
	t.true(isMatch('foo', ['!bar', '!baz', '!qux']));
	t.false(isMatch('bar', ['!bar', '!baz', '!qux']));

	// Negation that would match everything
	t.false(isMatch('anything', ['!*']));
	t.false(isMatch('', ['!*']));
});

test('case sensitivity edge cases', t => {
	// Patterns with mixed case
	t.true(isMatch('FooBar', 'foo*', {caseSensitive: false}));
	t.false(isMatch('FooBar', 'foo*', {caseSensitive: true}));
	t.true(isMatch('FooBar', 'Foo*', {caseSensitive: true}));

	// Numbers and special chars (should not be affected by case sensitivity)
	t.true(isMatch('test123', 'test*', {caseSensitive: false}));
	t.true(isMatch('test123', 'test*', {caseSensitive: true}));
	t.true(isMatch('test-123', '*-123', {caseSensitive: false}));
	t.true(isMatch('test-123', '*-123', {caseSensitive: true}));
});

test('spaces in single pattern (README example)', t => {
	// Prove the README "spaces in a single pattern" example works
	t.true(isMatch('foo bar baz', 'foo b* b*'));
	t.false(isMatch('foo bar', 'foo b* b*'));
	t.true(isMatch('foo bx bz', 'foo b* b*'));
	t.true(isMatch('foo b b', 'foo b* b*'));
});

test('allPatterns with only negations', t => {
	// Should include items not matching any negation
	t.true(isMatch('foo', ['!bar', '!baz'], {allPatterns: true}));
	t.false(isMatch('bar', ['!bar', '!baz'], {allPatterns: true}));
	t.false(isMatch('baz', ['!bar', '!baz'], {allPatterns: true}));
	t.true(isMatch('qux', ['!bar', '!baz'], {allPatterns: true}));

	// With multiple inputs
	t.true(isMatch(['foo', 'qux'], ['!bar', '!baz'], {allPatterns: true}));
	t.true(isMatch(['foo', 'bar'], ['!bar', '!baz'], {allPatterns: true})); // Only `bar` is excluded
	t.false(isMatch(['bar', 'baz'], ['!bar', '!baz'], {allPatterns: true})); // Both are excluded
});

test('massive pattern set with duplicates', t => {
	// Test cache behavior and performance with duplicates
	const patterns = [
		...Array.from({length: 50}, () => 'test*'), // 50 duplicates
		...Array.from({length: 50}, () => 'foo*'), // 50 more duplicates
		'unique*',
	];

	t.true(isMatch('test123', patterns));
	t.true(isMatch('foo123', patterns));
	t.true(isMatch('unique123', patterns));
	t.false(isMatch('nomatch', patterns));

	// Ensure it works with matcher() too
	const results = matcher(['test1', 'foo2', 'unique3', 'nomatch'], patterns);
	t.deepEqual(results, ['test1', 'foo2', 'unique3']);
});

test('matching time does not grow exponentially with the number of wildcards', t => {
	const start = performance.now();
	t.false(isMatch('a'.repeat(60), '*a'.repeat(30) + 'b'));
	t.false(isMatch('a'.repeat(100_000), '*a*a*a*b'));
	t.false(isMatch('a'.repeat(100_000), '*a*a*a*b', {caseSensitive: true}));
	t.true(isMatch('a'.repeat(100_000) + 'b', '*a*a*a*b'));
	t.true(performance.now() - start < 1000);
});

test('case-insensitive matching of long non-ASCII input is fast', t => {
	const start = performance.now();
	t.false(isMatch('é'.repeat(2_000_000), '*a'));
	t.false(isMatch('a'.repeat(2_000_000) + 'é', '*b'));
	t.false(isMatch('a'.repeat(2_000_000) + 'ß', '*b'));
	t.true(performance.now() - start < 1000);
});

test('escaped backslash before a wildcard', t => {
	t.true(isMatch(String.raw`a\bc`, String.raw`a\\*`));
	t.false(isMatch('a*', String.raw`a\\*`));
});

test('placeholder-like text in patterns is literal', t => {
	t.true(isMatch('__ESCAPED_STAR__', '__ESCAPED_STAR__'));
	t.false(isMatch('*', '__ESCAPED_STAR__'));
	t.true(isMatch('__ESCAPED_BACKSLASH__', '__ESCAPED_BACKSLASH__'));
});

test('case-insensitive matching does not fold lookalike characters into ASCII', t => {
	t.false(isMatch('https://gıthub.com/login', 'https://github.com/*'));
	t.false(isMatch('https://claßic.com/x', 'https://classic.com/*'));
	t.false(isMatch('report.jſ', '*.js'));
	t.false(isMatch('ﬁle', 'file'));
	t.true(isMatch('ÆBLE', 'æble'));
	t.true(isMatch('ΣΊΣΥΦΟΣ', 'σίσυφος'));
});

/* eslint-disable no-extend-native, no-use-extend-native/no-use-extend-native */
test('ignores polluted options on the prototype', t => {
	Object.prototype.caseSensitive = true;
	Object.prototype.allPatterns = true;

	try {
		t.true(isMatch('SECRET.txt', 'secret*'));
		t.deepEqual(matcher(['SECRET'], ['*', '!secret'], {}), []);
		t.true(isMatch('foo', ['f*', 'b*']));
	} finally {
		delete Object.prototype.caseSensitive;
		delete Object.prototype.allPatterns;
	}
});

test('an empty pattern is not negated by a polluted prototype', t => {
	Object.prototype[0] = '!';

	let result;
	try {
		result = matcher(['a', ''], '', {caseSensitive: true});
	} finally {
		delete Object.prototype[0];
	}

	t.deepEqual(result, ['']);
});
/* eslint-enable no-extend-native, no-use-extend-native/no-use-extend-native */

test('patterns still match correctly after the cache evicts them', t => {
	for (let index = 0; index < 3000; index++) {
		t.true(isMatch(`foo${index}bar`, `foo${index}*`));
		t.false(isMatch(`FOO${index}bar`, `foo${index}*`, {caseSensitive: true}));
	}

	t.true(isMatch('foo0bar', 'foo0*'));
	t.true(isMatch('FOO0bar', 'foo0*'));
	t.false(isMatch('FOO0bar', 'foo0*', {caseSensitive: true}));
	t.false(isMatch('foo1bar', 'foo0*'));
});

test('a single call with more patterns than the cache holds', t => {
	// One call compiling thousands of patterns evicts its own earlier entries. The compiled patterns are already held by that call, so nothing may be lost.
	const patterns = Array.from({length: 5000}, (_, index) => `item${index}`);
	patterns.push('!item4999');

	t.deepEqual(matcher(['item0', 'item2500', 'item4999', 'item5000', 'nope'], patterns, {caseSensitive: true}), ['item0', 'item2500']);

	// The same, with nothing but negations, which is the case that once depended on how many there were.
	const negations = Array.from({length: 3000}, (_, index) => `!no${index}`);
	const kept = ['yes', 'no0', 'no2999', 'no3000'];
	const all = {allPatterns: true};

	t.deepEqual(matcher(kept, negations), ['yes', 'no3000']);
	t.deepEqual(matcher(kept, negations, all), ['yes', 'no3000']);
	t.true(isMatch(kept, negations, all));
	t.false(isMatch(['no0'], negations, all));

	// Repeating one pattern many times must not change the answer either.
	const repeated = Array.from({length: 5000}, () => 'a*');

	t.deepEqual(matcher(['ab', 'b'], repeated), ['ab']);
	t.deepEqual(matcher(['ab', 'b'], repeated, {allPatterns: true}), ['ab']);
});

// Deterministic pseudo-random numbers (Park-Miller), so that failures can be reproduced.
const createRandom = seed => () => {
	seed = (seed * 16_807) % 2_147_483_647;
	return (seed - 1) / 2_147_483_646;
};

const randomString = (random, alphabet, maximumLength) => Array.from({length: Math.floor(random() * (maximumLength + 1))}, () => alphabet[Math.floor(random() * alphabet.length)]).join('');

const randomAlphabet = ['a', 'b', 'A', '.', '*', '\\', '!', '\n', 'ß', 'ı', 'ſ', 'K', 'é', 'É', 'Σ', 'ς', '😀', '\uD83D'];

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
const escapePattern = string => string.replaceAll(/[\\*!]/g, String.raw`\$&`);

const escapeForRegex = string => string.replaceAll(/[|\\{}()[\]^$+*?.-]/g, String.raw`\$&`);

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

// Compares `isMatch()` with the reference for each `[input, pattern, caseSensitive]` case, and reports only the first difference, so that a regression fails with one readable message instead of thousands.
const checkAgainstReference = (t, cases) => {
	for (const [input, pattern, caseSensitive] of cases) {
		const expected = referenceIsMatch(input, pattern, caseSensitive);

		if (isMatch(input, pattern, {caseSensitive}) !== expected) {
			t.fail(`isMatch(${JSON.stringify(input)}, ${JSON.stringify(pattern)}, {caseSensitive: ${caseSensitive}}) should be ${expected}`);
			return;
		}
	}

	t.pass();
};

// The same for whole lists: `matcher()` has to keep exactly the inputs the reference keeps, and `isMatch()` has to be true exactly when it keeps any.
const checkListsAgainstReference = (t, cases) => {
	for (const [inputs, patterns, options] of cases) {
		const call = `(${JSON.stringify(inputs)}, ${JSON.stringify(patterns)}, ${JSON.stringify(options)})`;
		const expected = inputs.filter(input => referenceMatchesInput(input, patterns, options));

		if (JSON.stringify(matcher(inputs, patterns, options)) !== JSON.stringify(expected)) {
			t.fail(`matcher${call} should be ${JSON.stringify(expected)}`);
			return;
		}

		const expectedAny = expected.length > 0;

		if (isMatch(inputs, patterns, options) !== expectedAny) {
			t.fail(`isMatch${call} should be ${expectedAny}`);
			return;
		}
	}

	t.pass();
};

const randomCases = ({seed, alphabet, maximumLength, count}) => {
	const random = createRandom(seed);
	return Array.from({length: count}, () => [randomString(random, alphabet, maximumLength), randomString(random, alphabet, maximumLength), random() < 0.5]);
};

test('matches like the equivalent regex for random patterns and inputs', t => {
	checkAgainstReference(t, randomCases({
		seed: 1,
		alphabet: randomAlphabet,
		maximumLength: 6,
		count: 5000,
	}));
});

test('matches like the equivalent regex for random wildcard-heavy patterns', t => {
	// A small alphabet makes repeated and overlapping parts common.
	checkAgainstReference(t, randomCases({
		seed: 4,
		alphabet: ['a', 'b', '*'],
		maximumLength: 8,
		count: 10_000,
	}));
});

test('an escaped pattern matches only its own text', t => {
	const random = createRandom(2);

	for (let index = 0; index < 2000; index++) {
		const string = randomString(random, randomAlphabet, 10);
		const pattern = escapePattern(string);

		t.true(isMatch(string, pattern, {caseSensitive: true}));
		t.false(isMatch(string + 'x', pattern, {caseSensitive: true}));
		t.false(isMatch('x' + string, pattern, {caseSensitive: true}));
		t.true(isMatch('x' + string + 'x', `*${pattern}*`, {caseSensitive: true}));
	}
});

test('matcher() keeps the input order and duplicates', t => {
	t.deepEqual(matcher(['b', 'a', 'c', 'b'], ['a', 'b']), ['b', 'a', 'b']);
	t.deepEqual(matcher(['b', 'a', 'c', 'b'], ['!c']), ['b', 'a', 'b']);
});

test('does not mutate the arguments', t => {
	const inputs = Object.freeze(['foo', 'bar']);
	const patterns = Object.freeze(['f*', '!bar']);
	const options = Object.freeze({caseSensitive: true, allPatterns: true});

	t.deepEqual(matcher(inputs, patterns, options), ['foo']);
	t.true(isMatch(inputs, patterns, options));
	t.deepEqual(inputs, ['foo', 'bar']);
	t.deepEqual(patterns, ['f*', '!bar']);
});

test('a lone `!` pattern excludes only the empty string', t => {
	t.true(isMatch('a', '!'));
	t.false(isMatch('', '!'));
	t.deepEqual(matcher(['', 'a', ''], '!'), ['a']);
});

test('the rule for omitting an input', t => {
	// No pattern at all omits everything.
	t.deepEqual(matcher(['foo'], []), []);
	t.deepEqual(matcher(['foo'], undefined), []);

	// A negated pattern omits the inputs it matches.
	t.deepEqual(matcher(['foo', 'bar'], ['!bar']), ['foo']);

	// When every pattern is negated, an input survives as long as it matches none of them.
	t.deepEqual(matcher(['foo', 'bar'], ['!bar', '!baz']), ['foo']);
	t.deepEqual(matcher(['foo', 'bar', 'baz'], ['!bar', '!baz']), ['foo']);

	// A non-negated pattern present means the input has to match it.
	t.deepEqual(matcher(['foo', 'bar'], ['bar']), ['bar']);
	t.deepEqual(matcher(['foo'], ['bar']), []);

	// Negations win over non-negated patterns, whatever the order.
	t.deepEqual(matcher(['foo', 'bar'], ['bar', '!bar']), []);
	t.deepEqual(matcher(['foo', 'bar'], ['!bar', 'bar']), []);
});

test('only a leading `!` negates', t => {
	t.true(isMatch('!foo', String.raw`\!foo`));
	t.false(isMatch('foo', String.raw`\!foo`));
	t.true(isMatch('a!b', 'a!*'));
	t.false(isMatch('!foo', '!!foo'));
	t.true(isMatch('foo', '!!foo'));
	t.true(isMatch('!', String.raw`\!`));
});

test('the same pattern with and without negation', t => {
	t.true(isMatch('foo', 'foo'));
	t.false(isMatch('foo', '!foo'));
	t.false(isMatch('foo', ['foo', '!foo']));
	t.false(isMatch('foo', ['!foo', 'foo']));
});

test('literal parts around a wildcard must not overlap', t => {
	t.false(isMatch('a', 'a*a'));
	t.true(isMatch('aa', 'a*a'));
	t.false(isMatch('abc', 'ab*bc'));
	t.true(isMatch('abbc', 'ab*bc'));
	t.false(isMatch('ab', '*ab*b'));
	t.true(isMatch('abb', '*ab*b'));
	t.false(isMatch('aba', 'aba*aba'));
	t.true(isMatch('abaaba', 'aba*aba'));
});

test('middle parts must appear in order', t => {
	t.true(isMatch('xaxbx', '*a*b*'));
	t.false(isMatch('xbxax', '*a*b*'));
	t.true(isMatch('aab', '*a*ab'));
	t.true(isMatch('abcabc', '*bc*ab*'));
	t.false(isMatch('abcab', '*bc*abc'));
	t.true(isMatch('foo.min.js', '*.min.*js'));
	t.false(isMatch('foo.js.min', '*.min.*js'));
});

test('middle parts must not overlap each other', t => {
	t.false(isMatch('a', '*a*a*'));
	t.true(isMatch('aa', '*a*a*'));
	t.false(isMatch('aba', '*ab*ba*'));
	t.true(isMatch('abba', '*ab*ba*'));
	t.false(isMatch('aaa', '*aa*aa*'));
	t.true(isMatch('aaaa', '*aa*aa*'));
});

test('an escaped wildcard between wildcards', t => {
	t.true(isMatch('a*b', String.raw`*\**`));
	t.true(isMatch('*', String.raw`*\**`));
	t.false(isMatch('ab', String.raw`*\**`));
	t.true(isMatch('**', String.raw`\*\*`));
	t.false(isMatch('*x*', String.raw`\*\*`));
});

test('a backslash escapes any character', t => {
	t.true(isMatch('abc', String.raw`\a\b\c`));
	t.true(isMatch('\n', '\\\n'));
	t.true(isMatch('😀', String.raw`\😀`));
	t.true(isMatch(String.raw`\a`, String.raw`\\a`));
	t.false(isMatch('a', String.raw`\\a`));
});

test('consecutive wildcards around literals', t => {
	t.true(isMatch('abc', '**b**'));
	t.true(isMatch('b', '**b**'));
	t.false(isMatch('ac', '**b**'));
	t.true(isMatch('ab', 'a***b'));
	t.false(isMatch('a', 'a***b'));
});

test('wildcards match surrogate pairs and lone surrogates', t => {
	t.true(isMatch('😀', '*'));
	t.true(isMatch('a😀b', 'a*b'));
	t.true(isMatch('😀🦄', '😀*'));
	t.true(isMatch('\uD800', '*'));
	t.true(isMatch('a\uDC00', 'A\uDC00'));
	// Like a regex without the `u` flag, patterns work on UTF-16 code units, so a wildcard can match half of a surrogate pair.
	t.true(isMatch('😀', '\uD83D*'));
});

test('case-insensitive matching of non-ASCII letters', t => {
	t.true(isMatch('ÉCOLE', 'école'));
	t.true(isMatch('ΟΔΟΣ', 'οδος'));
	t.true(isMatch('ς', 'σ'));
	t.true(isMatch('ДОМ', 'дом'));
	t.false(isMatch('ÉCOLE', 'école', {caseSensitive: true}));
	t.false(isMatch('ß', 'ẞ'));
	t.false(isMatch('\u212A', 'k')); // Kelvin sign
	t.false(isMatch('𐐀', '𐐨')); // Astral case pairs are not folded, like a regex without the `u` flag
});

test('options can be null or have truthy values', t => {
	t.true(isMatch('FOO', 'foo', null));
	t.deepEqual(matcher(['FOO'], 'foo', null), ['FOO']);
	t.false(isMatch('FOO', 'foo', {caseSensitive: 1}));
	t.false(isMatch(['foo', 'bar'], ['f*', 'b*'], {allPatterns: 'yes'}));
});

test('throws descriptive errors for invalid arguments', t => {
	t.throws(() => {
		matcher(1, 'a');
	}, {instanceOf: TypeError, message: 'Expected \'inputs\' to be a string or an array, but got a type of \'number\''});

	t.throws(() => {
		isMatch('a', [null]);
	}, {instanceOf: TypeError, message: 'Expected \'patterns\' to be an array of strings, but found a type of \'object\' in the array'});

	t.throws(() => {
		matcher(new Set(['a']), 'a');
	}, {instanceOf: TypeError, message: /'inputs'/});

	// Inputs are validated before patterns
	t.throws(() => {
		isMatch(1, 1);
	}, {message: /'inputs'/});
});

test('holes in arrays are ignored', t => {
	const inputs = ['a', 'b'];
	inputs[3] = 'c';
	const patterns = ['a', 'c'];
	patterns[5] = 'b';

	t.deepEqual(matcher(inputs, '*'), ['a', 'b', 'c']);
	t.deepEqual(matcher(['a', 'b', 'c'], patterns), ['a', 'b', 'c']);
});

test('matcher() with many inputs and patterns', t => {
	const inputs = Array.from({length: 1000}, (_, index) => `item${index}`);

	t.is(matcher(inputs, 'item1*').length, 111); // 1, 10-19, 100-199
	t.is(matcher(inputs, ['item1*', '!*0']).length, 100);
	t.is(matcher(inputs, ['item*', '!item?*']).length, 1000); // `?` is not a wildcard
	t.is(matcher(inputs, ['*1*', '*2*'], {allPatterns: true}).length, 54); // 1000 - 729 without a 1 - 729 without a 2 + 512 without both
	t.is(matcher(inputs, Array.from({length: 100}, (_, index) => `item${index * 10}`)).length, 100);
});

test('allPatterns with only negations: each input is checked on its own', t => {
	const options = {allPatterns: true};

	// An input is kept when it matches none of the negations. `isMatch()` is just "did any input survive", so it must agree with `matcher()` here too.
	t.deepEqual(matcher(['foo', 'bar'], ['!bar', '!baz'], options), ['foo']);
	t.true(isMatch(['foo', 'bar'], ['!bar', '!baz'], options));
	t.false(isMatch(['bar', 'baz'], ['!bar', '!baz'], options));
	t.false(isMatch([], ['!bar', '!baz'], options));

	// Listing the same negation twice used to flip the answer, because the number of negated patterns decided whether `isMatch()` required every input to pass.
	t.true(isMatch(['foo', 'bar'], ['!bar'], options));
	t.true(isMatch(['foo', 'bar'], ['!bar', '!bar'], options));
	t.true(isMatch(['foo', 'bar'], ['!bar', '!bar', '!bar'], options));
	t.false(isMatch(['bar'], ['!bar', '!bar'], options));
});

test('allPatterns with empty and wildcard patterns', t => {
	t.true(isMatch('', ['', '*'], {allPatterns: true}));
	t.false(isMatch('a', ['', '*'], {allPatterns: true}));
	t.deepEqual(matcher(['', 'a'], ['*', '!'], {allPatterns: true}), ['a']);
});

test('long literal patterns and many wildcards', t => {
	const long = 'ab'.repeat(50_000);

	t.true(isMatch(long, long));
	t.false(isMatch(long + 'a', long));
	t.true(isMatch(long, `a*${'*'.repeat(10_000)}b`));
	t.true(isMatch(long, `*${'b*'.repeat(1000)}`));
	t.false(isMatch(long, `*${'c*'.repeat(1000)}`));
});

// Extracts the fenced code blocks from a markdown file, including the ones indented inside the doc comments of `index.d.ts`. A fence is three or more backticks or tildes with an optional language tag; anything not matching that is not a fence at all, since mistaking prose for a fence would silently swallow the block after it.
const extractCodeBlocks = markdown => {
	const blocks = [];
	let openFence;
	let language;
	let current;

	for (const line of markdown.split('\n')) {
		const fence = line.match(/^\s*(`{3,}|~{3,})[ \t]*([\w-]*)/);

		if (fence) {
			// Only the same character and at least as many of them closes a block.
			const closes = openFence !== undefined
				&& fence[1][0] === openFence[0]
				&& fence[1].length >= openFence.length;

			if (closes) {
				blocks.push({language, source: current.join('\n')});
				openFence = undefined;
				language = undefined;
				current = undefined;
			} else if (openFence === undefined) {
				openFence = fence[1];
				language = fence[2];
				current = [];
			}

			continue;
		}

		if (current) {
			// Doc comments indent their content by one tab.
			current.push(line.replace(/^\t/, ''));
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

	const isSkippable = line => line.trim() === '' || line.trim().startsWith('//');
	const isDeclaration = line => /^(const|let|var|function|class|return)\b/.test(line.trim());
	const record = (expression, documented) => `__checks__.push([() => (${expression}), ${JSON.stringify(documented)}, ${JSON.stringify(expression)}]);`;
	const recordUndocumented = expression => record(expression, null);

	for (const line of block.split('\n')) {
		if (/^import\s/.test(line.trim())) {
			continue;
		}

		const expected = line.match(/^\s*\/\/=>\s*(.*)$/);

		if (expected) {
			if (pending === undefined) {
				throw new Error(`A "//=>" comment has no expression above it:\n${block}`);
			}

			output.push(record(pending, expected[1].trim()));
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

		pending = line.trim().replace(/;$/, '');
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

// Runs every `//=> example` in the given file and compares it to the real result. `expectedCount` is asserted exactly, so that deleting an example has to be deliberate.
const checkDocumentedExamples = (t, file, expectedCount) => {
	const blocks = extractCodeBlocks(readFileSync(new URL(file, import.meta.url), 'utf8'));
	const annotated = blocks.filter(({source}) => source.includes('//=>'));
	// Examples belong in `js` or untagged blocks. One under any other tag is reported, so that retagging a block cannot quietly turn its examples into something the docs no longer present as JavaScript.
	const otherLanguages = annotated.filter(({language}) => language !== '' && language !== 'js');

	t.deepEqual(otherLanguages.map(({language}) => language), [], `${file} has example blocks tagged with another language`);

	let total = 0;

	for (const {source} of annotated) {
		// eslint-disable-next-line no-new-func
		const run = new Function('__checks__', 'matcher', 'isMatch', `"use strict";\n${rewriteBlock(source)}`);
		const collected = [];
		run(collected, matcher, isMatch);

		for (const [getResult, documented, label] of collected) {
			total++;

			if (documented === null) {
				t.fail(`${file}: \`${label}\` has no "//=>" line documenting its result`);
				continue;
			}

			t.deepEqual(getResult(), evaluateLiteral(documented), `${file}: ${label}`);
		}
	}

	t.is(total, expectedCount, `${file} should document ${expectedCount} examples`);
};

test('every example in the readme produces the documented result', t => {
	checkDocumentedExamples(t, 'readme.md', 30);
});

test('every example in the type declarations produces the documented result', t => {
	checkDocumentedExamples(t, 'index.d.ts', 27);
});

const codePointName = codePoint => `U+${codePoint.toString(16).toUpperCase()}`;

test('matches the equivalent regex for every short pattern and input', t => {
	// Exhaustive over every pattern of up to four characters and every input of up to three, in both case modes. The alphabet has a letter in both cases and every metacharacter, so nothing in the parser or in case folding is left to chance.
	const patterns = enumerateStrings(['a', 'A', '*', '\\', '!'], 4);
	const inputs = patterns.filter(pattern => pattern.length <= 3);
	const cases = [true, false].flatMap(caseSensitive => patterns.flatMap(pattern => inputs.map(input => [input, pattern, caseSensitive])));

	t.is(cases.length, 2 * 781 * 156);
	checkAgainstReference(t, cases);
});

test('matcher() keeps exactly the inputs the reference keeps, for every pair of patterns', t => {
	const patterns = enumerateStrings(['a', '*', '!', '\\'], 2);
	const inputs = enumerateStrings(['a', 'b'], 3);
	// No character here has another case in the inputs, so only `allPatterns` is varied. Case folding is covered by the sweep above.
	const pairs = patterns.flatMap(first => patterns.map(second => [first, second]));
	const cases = [true, false].flatMap(allPatterns => pairs.map(pair => [inputs, pair, {allPatterns}]));

	t.is(cases.length, 2 * 21 * 21);
	checkListsAgainstReference(t, cases);
});

test('matcher() and isMatch() agree with the reference for random lists, whatever the order or repetition of the patterns', t => {
	const random = createRandom(31_337);
	const cases = [];

	for (let index = 0; index < 1500; index++) {
		const inputs = Array.from({length: Math.floor(random() * 5)}, () => randomString(random, randomAlphabet, 5));
		const patterns = Array.from({length: Math.floor(random() * 4)}, () => randomString(random, randomAlphabet, 5));
		const options = {caseSensitive: random() < 0.5, allPatterns: random() < 0.5};

		// The reference ignores order and repetition, so agreeing with it for all three lists proves that `matcher()` and `isMatch()` do too.
		cases.push([inputs, patterns, options], [inputs, [...patterns, ...patterns], options], [inputs, patterns.toReversed(), options]);
	}

	checkListsAgainstReference(t, cases);
});

test('case-insensitive matching folds every case-mapped character like a regex does', t => {
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
			const expected = new RegExp(`^${escapeForRegex(form)}$`, 'si').test(character);

			if (isMatch(character, form) !== expected) {
				t.fail(`the ${description} form of ${codePointName(codePoint)} should ${expected ? '' : 'not '}match case-insensitively`);
				return;
			}
		}
	}

	t.true(checked > 5000, `only checked ${checked} case-mapped characters`);
});

test('every string without a backslash or a leading `!` matches itself', t => {
	// A string only matches itself if it has no `\` to escape with and no leading `!` to negate it, so the alphabet leaves both out. The strings are sampled, since every distinct pattern costs a cache miss and sweeping all 1.1 million code points takes far longer than the rest of the suite.
	const random = createRandom(20_250_926);
	const alphabet = ['a', 'A', '0', ' ', '\n', '*', 'é', 'É', 'ß', 'ı', 'ſ', 'K', 'Σ', 'ς', '中', '😀', '\uD83D'];
	const strings = Array.from({length: 2000}, () => randomString(random, alphabet, 3));

	// A regular stride over the astral planes, where the code points live that the hand-picked alphabet above cannot reach.
	for (let codePoint = 0x1_00_00; codePoint <= 0x10_FF_FF; codePoint += 4096) {
		strings.push(String.fromCodePoint(codePoint));
	}

	for (const caseSensitive of [true, false]) {
		t.deepEqual(strings.filter(string => !isMatch(string, string, {caseSensitive})), [], `caseSensitive: ${caseSensitive}`);
	}
});

test('a string containing a metacharacter does not necessarily match itself', t => {
	// The two reasons a string stops matching itself, spelled out so the invariant above does not look like it should hold for these.
	t.false(isMatch(String.raw`\a`, String.raw`\a`)); // The pattern `\a` asks for a literal `a`
	t.true(isMatch('a', String.raw`\a`));
	t.false(isMatch(String.raw`a\b`, String.raw`a\b`));
	t.false(isMatch('!*', '!*')); // A leading `!` negates, and the body is a wildcard
	t.true(isMatch('!x', '!x')); // True only because `!x` is not `x`
	t.true(isMatch('a!', 'a!')); // A `!` that is not leading is literal

	// Escaping every metacharacter makes any string match itself again.
	for (const string of [String.raw`\a`, '!*', String.raw`a\*b!`, '*', '!', '\\']) {
		t.true(isMatch(string, escapePattern(string), {caseSensitive: true}), `escaped self-match of ${JSON.stringify(string)}`);
	}
});

test('matches the equivalent regex for random code points from all of Unicode', t => {
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

	checkAgainstReference(t, cases);
});
