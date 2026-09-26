# matcher

> Simple [wildcard](https://en.wikipedia.org/wiki/Wildcard_character) matching

Useful when you want to accept loose string input and regexes/globs are too convoluted.

## Install

```sh
npm install matcher
```

## Usage

```js
import {matcher, isMatch} from 'matcher';

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

## API

It matches even across newlines. For example, `foo*r` will match `foo\nbar`.

### matcher(inputs, patterns, options?)

Accepts a string or an array of strings for both `inputs` and `patterns`.

Returns an array of `inputs` filtered based on the `patterns`.

### isMatch(inputs, patterns, options?)

Accepts a string or an array of strings for both `inputs` and `patterns`.

Returns a `boolean` of whether any of the given `inputs` matches the `patterns`. With `allPatterns` enabled, an input has to match every non-negated pattern, not just one.

#### inputs

Type: `string | string[]`

The string or array of strings to match.

#### options

Type: `object`

##### caseSensitive

Type: `boolean`\
Default: `false`

Make matching case-sensitive. When `false`, treats uppercase and lowercase characters as being the same, the way a case-insensitive regular expression without the `u` flag does. So a character whose uppercase form is more than one character (`ß`) or is ASCII while the character itself is not (`ı`, `ſ`), and every character outside the Basic Multilingual Plane, only matches itself.

Ensure you use this correctly. For example, files and directories should be matched case-insensitively, while most often, object keys should be matched case-sensitively.

```js
import {isMatch} from 'matcher';

isMatch('UNICORN', 'UNI*', {caseSensitive: true});
//=> true

isMatch('UNICORN', 'unicorn', {caseSensitive: true});
//=> false

isMatch('unicorn', ['tri*', 'UNI*'], {caseSensitive: true});
//=> false
```

##### allPatterns

Type: `boolean`\
Default: `false`

A negated pattern always excludes the inputs it matches, whether or not this option is set. Setting it also requires every non-negated pattern to match the same input, instead of at least one of them.

```js
import {matcher} from 'matcher';

// Find text strings containing both "edge" and "tiger" in arbitrary order, but not "stunt".
const demo = (strings) => matcher(strings, ['*edge*', '*tiger*', '!*stunt*'], {allPatterns: true});

demo(['Hey, tiger!', 'tiger has edge over hyenas', 'pushing a tiger over the edge is a stunt']);
//=> ['tiger has edge over hyenas']
```

```js
import {matcher} from 'matcher';

matcher(['foo', 'for', 'bar'], ['f*', 'b*', '!x*'], {allPatterns: true});
//=> []

matcher(['foo', 'for', 'bar'], ['f*'], {allPatterns: true});
//=> ['foo', 'for']
```

#### patterns

Type: `string | string[]`

Use `*` to match zero or more characters.

A leading `!` negates the pattern.

A `\` escapes the character after it, so `\*` matches a literal `*` and `\\` matches a literal `\`. A `\` at the very end of a pattern matches itself.

An input string will be omitted if there is no pattern at all, if it matches a negated pattern, or if there are non-negated patterns and it fails to match them: all of them when `allPatterns` is set, at least one otherwise. When every pattern is negated, an input is kept as long as it matches none of them.

```js
import {isMatch} from 'matcher';

isMatch('unicorn', 'uni\\*');
//=> false

isMatch('uni*', 'uni\\*');
//=> true

// Every backslash in a Windows path has to be doubled, otherwise the first one escapes the second.
isMatch('C:\\temp\\x', 'C:\\\\temp\\\\*');
//=> true

isMatch('C:\\temp\\x', 'C:\\temp\\*');
//=> false
```

## Benchmark

```sh
npm run bench
```

## Related

- [matcher-cli](https://github.com/sindresorhus/matcher-cli) - CLI for this module
- [multimatch](https://github.com/sindresorhus/multimatch) - Extends `minimatch.match()` with support for multiple patterns
