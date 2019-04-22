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
});
