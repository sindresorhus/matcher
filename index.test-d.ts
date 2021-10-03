import {expectType} from 'tsd';
import {matcher, isMatch} from './index.js';

expectType<string[]>(matcher(['foo', 'bar', 'moo'], ['*oo', '!foo']));
expectType<string[]>(matcher(['foo', 'bar', 'moo'], ['!*oo']));
expectType<string[]>(
	matcher(['foo', 'bar', 'moo'], ['!*oo'], {caseSensitive: true}),
);

expectType<boolean>(isMatch('unicorn', 'uni*'));
expectType<boolean>(isMatch('UNICORN', 'UNI*', {caseSensitive: true}));
