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
	t.false(isMatch('unicorn', 'uni\\*'));
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
	t.true(
		isMatch(
			['Hey, tiger!', 'tiger has edge over hyenas', 'pushing a tiger over the edge is a stunt'],
			['*edge*', '*tiger*', '!*stunt*'],
			flags,
		),
	);
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

test('special regex characters are escaped properly', t => {
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
