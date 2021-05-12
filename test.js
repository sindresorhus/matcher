import test from 'ava';
import matcher from './index.js';

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

	t.false(matcher.isMatch(['phoenix'], ['bar', '']));
	t.false(matcher.isMatch(['phoenix'], ['', 'bar']));
	t.false(matcher.isMatch(['phoenix'], ['', 'bar', '']));
	t.false(matcher.isMatch(['phoenix'], ['bar', '', 'bar']));
	t.false(matcher.isMatch(['phoenix'], [undefined, '']));
	t.false(matcher.isMatch(['phoenix'], ['', undefined]));
	t.false(matcher.isMatch(['phoenix'], ['', undefined, '']));
	t.false(matcher.isMatch(['phoenix'], [undefined, '', undefined]));
	t.false(matcher.isMatch(['phoenix'], ['', '']));
	t.false(matcher.isMatch(['phoenix'], ['']));
	t.false(matcher.isMatch(['phoenix'], ''));
	t.false(matcher.isMatch(['phoenix'], []));
	t.false(matcher.isMatch(['phoenix'], [undefined]));
	t.false(matcher.isMatch(['phoenix'], undefined));

	t.false(matcher.isMatch(['phoenix', ''], ['bar']));
	t.false(matcher.isMatch(['', 'phoenix'], ['bar']));
	t.false(matcher.isMatch(['', 'phoenix', ''], ['bar']));
	t.false(matcher.isMatch(['phoenix', '', 'phoenix'], ['bar']));
	t.false(matcher.isMatch([undefined, ''], ['bar']));
	t.false(matcher.isMatch(['', undefined], ['bar']));
	t.false(matcher.isMatch(['', undefined, ''], ['bar']));
	t.false(matcher.isMatch([undefined, '', undefined], ['bar']));
	t.false(matcher.isMatch(['', ''], ['bar']));
	t.false(matcher.isMatch([''], ['bar']));
	t.false(matcher.isMatch('', ['bar']));
	t.false(matcher.isMatch([], ['bar']));
	t.false(matcher.isMatch([undefined], ['bar']));
	t.false(matcher.isMatch(undefined, ['bar']));

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

	t.true(matcher.isMatch([''], [undefined, '']));
	t.true(matcher.isMatch([''], ['', undefined]));
	t.true(matcher.isMatch([''], ['', '']));

	t.true(matcher.isMatch(['phoenix', ''], ['']));
	t.true(matcher.isMatch(['', 'phoenix'], ['']));
	t.true(matcher.isMatch([undefined, ''], ['']));
	t.true(matcher.isMatch(['', undefined], ['']));
	t.true(matcher.isMatch(['', ''], ['']));

	t.true(matcher.isMatch([''], ['']));
	t.true(matcher.isMatch([''], ['*']));

	t.false(matcher.isMatch([undefined], ['bar', undefined]));
	t.false(matcher.isMatch([undefined], [undefined, 'bar']));
	t.false(matcher.isMatch([undefined], ['', undefined]));
	t.false(matcher.isMatch([undefined], [undefined, '']));
	t.false(matcher.isMatch([undefined], [undefined, undefined]));
	t.false(matcher.isMatch([undefined], [undefined]));
	t.false(matcher.isMatch([undefined], undefined));

	t.false(matcher.isMatch(['phoenix', undefined], [undefined]));
	t.false(matcher.isMatch([undefined, 'phoenix'], [undefined]));
	t.false(matcher.isMatch(['', undefined], [undefined]));
	t.false(matcher.isMatch([undefined, ''], [undefined]));
	t.false(matcher.isMatch([undefined, undefined], [undefined]));
	t.false(matcher.isMatch([undefined], [undefined]));
	t.false(matcher.isMatch(undefined, [undefined]));

	t.false(matcher.isMatch([], []));
	t.false(matcher.isMatch([], ['*']));

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
		matcher.isMatch(['phoenix'], [0]);
	});

	t.throws(() => {
		matcher.isMatch(['phoenix'], [null]);
	});

	t.throws(() => {
		matcher.isMatch(['phoenix'], [false]);
	});

	t.throws(() => {
		matcher.isMatch(['phoenix'], 0);
	});

	t.throws(() => {
		matcher.isMatch(['phoenix'], null);
	});

	t.throws(() => {
		matcher.isMatch(['phoenix'], false);
	});

	t.throws(() => {
		matcher.isMatch([0], ['bar']);
	});

	t.throws(() => {
		matcher.isMatch([null], ['bar']);
	});

	t.throws(() => {
		matcher.isMatch([false], ['bar']);
	});

	t.throws(() => {
		matcher.isMatch(0, ['bar']);
	});

	t.throws(() => {
		matcher.isMatch(null, ['bar']);
	});

	t.throws(() => {
		matcher.isMatch(false, ['bar']);
	});
});

test('matcher() negated pattern placement', t => {
	t.deepEqual(matcher(['foo', 'bar'], ['fo*', '!bar', 'ba*']), ['foo']);
	t.deepEqual(matcher(['foo', 'bar'], ['!bar', 'fo*', 'ba*']), ['foo']);
	t.deepEqual(matcher(['foo', 'bar'], ['!bar']), ['foo']);
	t.deepEqual(matcher(['foo', 'bar'], ['!bar', 'fu']), []);
});

test('matcher.isMatch() negated pattern placement', t => {
	t.true(matcher.isMatch(['foo', 'bar'], ['fo*', '*oo', '!bar']));
	t.true(matcher.isMatch(['foo', 'bar'], ['!bar', 'fo*', '*oo']));
	t.true(matcher.isMatch(['foo', 'bar'], ['!bar']));
});
