import test from 'ava';
import matcher from '.';

test('matcher()', t => {
	t.deepEqual(matcher(['foo', 'bar'], ['foo']), ['foo']);
	t.deepEqual(matcher(['foo', 'bar'], ['bar']), ['bar']);
	t.deepEqual(matcher(['foo', 'bar'], ['fo*', 'ba*', '!bar']), ['foo']);
	t.deepEqual(matcher(['foo', 'bar', 'moo'], ['!*o']), ['bar']);
	t.deepEqual(matcher(['moo', 'MOO'], ['*oo'], {caseSensitive: true}), ['moo']);
	t.deepEqual(matcher(['moo', 'MOO'], ['*oo'], {caseSensitive: false}), ['moo', 'MOO']);
	t.notThrows(() => matcher([], []));
});

test('matcher.isMatch()', t => {
	t.true(matcher.isMatch('unicorn', 'unicorn'));
	t.true(matcher.isMatch('MOO', 'MOO'));
	t.true(matcher.isMatch('unicorn', 'uni*'));
	t.true(matcher.isMatch('UNICORN', 'unicorn', {caseSensitive: false}));
	t.true(matcher.isMatch('unicorn', '*corn'));
	t.true(matcher.isMatch('unicorn', 'un*rn'));
	t.true(matcher.isMatch('foo unicorn bar', '*unicorn*'));
	t.true(matcher.isMatch('unicorn', '*'));
	t.true(matcher.isMatch('UNICORN', 'UNI*', {caseSensitive: true}));
	t.false(matcher.isMatch('UNICORN', 'unicorn', {caseSensitive: true}));
	t.false(matcher.isMatch('unicorn', ''));
	t.false(matcher.isMatch('unicorn', '!unicorn'));
	t.false(matcher.isMatch('unicorn', '!uni*'));
	t.false(matcher.isMatch('unicorn', 'uni\\*'));
	t.true(matcher.isMatch('unicorn', '!tricorn'));
	t.true(matcher.isMatch('unicorn', '!tri*'));

	t.true(matcher.isMatch(['foo', 'bar', 'moo'], '*oo'));
	t.true(matcher.isMatch(['foo', 'bar', 'moo'], ['*oo', '!f*']));
	t.true(matcher.isMatch('moo', ['*oo', '!f*']));
	t.true(matcher.isMatch('UNICORN', ['!*oo', 'UNI*'], {caseSensitive: true}));

	t.false(matcher.isMatch(['unicorn', 'bar', 'wizard'], '*oo'));
	t.false(matcher.isMatch(['foo', 'bar', 'unicorn'], ['*horn', '!b*']));
	t.false(matcher.isMatch('moo', ['*oo', '!m*']));
	t.false(matcher.isMatch('UNICORN', ['!*oo', 'uni*'], {caseSensitive: true}));
});

test('matches across newlines', t => {
	t.deepEqual(matcher(['foo\nbar'], ['foo*']), ['foo\nbar']);
	t.deepEqual(matcher(['foo\nbar'], ['foo*r']), ['foo\nbar']);
	t.true(matcher.isMatch(['foo\nbar'], ['foo*']));
	t.true(matcher.isMatch(['foo\nbar'], ['foo*r']));
});

test('matcher honors the \'allPatterns\' option', t => {
	t.deepEqual(matcher(['a1', 'b', 'a2', 'c'], ['a*', 'c'], {allPatterns: true}), ['a1', 'a2', 'c']);
	t.deepEqual(matcher(['a1', 'b', 'a2', 'c'], ['a*', 'c1'], {allPatterns: true}), []);
});

test('matcher.isEqual ignores the \'allPatterns\' option', t => {
	t.true(matcher.isMatch(['a1', 'c'], ['c'], {allPatterns: true}));
	t.false(matcher.isMatch(['a1', 'c'], ['c1'], {allPatterns: true}));
	t.true(matcher.isMatch(['a1', 'c'], ['c']));
	t.false(matcher.isMatch(['a1', 'c'], ['c1']));
});
