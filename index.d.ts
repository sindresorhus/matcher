export type Options = {
	/**
	Make matching case-sensitive. When `false`, treats uppercase and lowercase characters as being the same, the way a case-insensitive regular expression without the `u` flag does. So a character whose uppercase form is more than one character (`ß`) or is ASCII while the character itself is not (`ı`, `ſ`), and every character outside the Basic Multilingual Plane, only matches itself.

	Ensure you use this correctly. For example, files and directories should be matched case-insensitively, while most often, object keys should be matched case-sensitively.

	@default false

	@example
	```
	import {isMatch} from 'matcher';

	isMatch('UNICORN', 'UNI*', {caseSensitive: true});
	//=> true

	isMatch('UNICORN', 'unicorn', {caseSensitive: true});
	//=> false

	isMatch('unicorn', ['tri*', 'UNI*'], {caseSensitive: true});
	//=> false
	```
	*/
	readonly caseSensitive?: boolean;
	/**
	A negated pattern always excludes the inputs it matches, whether or not this option is set. Setting it also requires every non-negated pattern to match the same input, instead of at least one of them.

	@default false

	@example
	```
	import {matcher} from 'matcher';

	// Find text strings containing both "edge" and "tiger" in arbitrary order, but not "stunt".
	const demo = (strings) => matcher(strings, ['*edge*', '*tiger*', '!*stunt*'], {allPatterns: true});

	demo(['Hey, tiger!', 'tiger has edge over hyenas', 'pushing a tiger over the edge is a stunt']);
	//=> ['tiger has edge over hyenas']
	```

	@example
	```
	import {matcher} from 'matcher';

	matcher(['foo', 'for', 'bar'], ['f*', 'b*', '!x*'], {allPatterns: true});
	//=> []

	matcher(['foo', 'for', 'bar'], ['f*'], {allPatterns: true});
	//=> ['foo', 'for']
	```
	*/
	readonly allPatterns?: boolean;
};

/**
Simple [wildcard](https://en.wikipedia.org/wiki/Wildcard_character) matching.

It matches even across newlines. For example, `foo*r` will match `foo\nbar`.

@param inputs - The string or array of strings to match.
@param patterns - The string or array of string patterns. Use `*` to match zero or more characters. A leading `!` negates the pattern. A `\` escapes the character after it, and a `\` at the very end of a pattern matches itself.
@returns An array of `inputs` filtered based on the `patterns`.

@example
```
import {matcher} from 'matcher';

matcher(['foo', 'bar', 'moo'], ['*oo', '!foo']);
//=> ['moo']

matcher(['foo', 'bar', 'moo'], ['!*oo']);
//=> ['bar']

matcher('moo', ['']);
//=> []

matcher('moo', []);
//=> []

matcher([''], ['']);
//=> ['']
```
*/
export function matcher(
	inputs: string | readonly string[],
	patterns: string | readonly string[],
	options?: Options,
): string[];

/**
It matches even across newlines. For example, `foo*r` will match `foo\nbar`.

@param inputs - The string or array of strings to match.
@param patterns - The string or array of string patterns. Use `*` to match zero or more characters. A leading `!` negates the pattern. A `\` escapes the character after it, and a `\` at the very end of a pattern matches itself.
@returns A `boolean` of whether any of the given `inputs` matches the `patterns`. With `allPatterns` enabled, an input has to match every non-negated pattern, not just one.

@example
```
import {isMatch} from 'matcher';

isMatch('unicorn', 'uni*');
//=> true

isMatch('unicorn', '*corn');
//=> true

isMatch('unicorn', 'un*rn');
//=> true

isMatch('rainbow', '!unicorn');
//=> true

isMatch('foo bar baz', 'foo b* b*');
//=> true

isMatch('unicorn', 'uni\\*');
//=> false

isMatch('C:\\temp\\x', 'C:\\\\temp\\\\*');
//=> true

isMatch(['foo', 'bar'], 'f*');
//=> true

isMatch(['foo', 'bar'], ['a*', 'b*']);
//=> true

isMatch('unicorn', ['']);
//=> false

isMatch('unicorn', []);
//=> false

isMatch([], 'bar');
//=> false

isMatch([], []);
//=> false

isMatch([''], ['']);
//=> true

// With `allPatterns` option
isMatch('foobar', ['foo*', '*bar'], {allPatterns: true});
//=> true

isMatch('foo', ['foo*', '*bar'], {allPatterns: true});
//=> false
```
*/
export function isMatch(
	inputs: string | readonly string[],
	patterns: string | readonly string[],
	options?: Options,
): boolean;
