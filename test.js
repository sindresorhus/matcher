import test from 'ava';
import m from '.';

test('matcher()', t => {
	t.deepEqual(m(['foo', 'bar'], ['foo']), ['foo']);
	t.deepEqual(m(['foo', 'bar'], ['bar']), ['bar']);
	t.deepEqual(m(['foo', 'bar'], ['fo*', 'ba*', '!bar']), ['foo']);
	t.deepEqual(m(['foo', 'bar', 'moo'], ['!*o']), ['bar']);
	t.notThrows(() => m([], []));
});

test('matcher.isMatch()', t => {
	t.true(m.isMatch('unicorn', 'unicorn'));
	t.true(m.isMatch('unicorn', 'uni*'));
	t.true(m.isMatch('unicorn', '*corn'));
	t.true(m.isMatch('unicorn', 'un*rn'));
	t.true(m.isMatch('foo unicorn bar', '*unicorn*'));
	t.true(m.isMatch('unicorn', '*'));
	t.false(m.isMatch('unicorn', ''));
	t.false(m.isMatch('unicorn', '!unicorn'));
	t.false(m.isMatch('unicorn', '!uni*'));
	t.false(m.isMatch('unicorn', 'uni\\*'));
});
