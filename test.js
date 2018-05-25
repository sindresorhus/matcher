import test from 'ava';
import m from '.';

test('matcher()', t => {
	t.deepEqual(m(['foo', 'bar'], ['foo']), ['foo']);
	t.deepEqual(m(['foo', 'bar'], ['bar']), ['bar']);
	t.deepEqual(m(['foo', 'bar'], ['fo*', 'ba*', '!bar']), ['foo']);
	t.deepEqual(m(['foo', 'bar', 'moo'], ['!*o']), ['bar']);
	t.deepEqual(m(['moo', 'MOO'], ['*oo'], {caseSensitive: true}), ['moo']);
	t.deepEqual(m(['moo', 'MOO'], ['*oo'], {caseSensitive: false}), ['moo', 'MOO']);
	t.notThrows(() => m([], []));
});

test('matcher.isMatch()', t => {
	t.true(m.isMatch('unicorn', 'unicorn'));
	t.true(m.isMatch('MOO', 'MOO'));
	t.true(m.isMatch('unicorn', 'uni*'));
	t.true(m.isMatch('UNICORN', 'unicorn', {caseSensitive: false}));
	t.true(m.isMatch('unicorn', '*corn'));
	t.true(m.isMatch('unicorn', 'un*rn'));
	t.true(m.isMatch('foo unicorn bar', '*unicorn*'));
	t.true(m.isMatch('unicorn', '*'));
	t.true(m.isMatch('UNICORN', 'UNI*', {caseSensitive: true}));
	t.false(m.isMatch('UNICORN', 'unicorn', {caseSensitive: true}));
	t.false(m.isMatch('unicorn', ''));
	t.false(m.isMatch('unicorn', '!unicorn'));
	t.false(m.isMatch('unicorn', '!uni*'));
	t.false(m.isMatch('unicorn', 'uni\\*'));
	t.true(m.isMatch('unicorn', '!tricorn'));
	t.true(m.isMatch('unicorn', '!tri*'));
});
