# matcher [![Build Status](https://travis-ci.org/sindresorhus/matcher.svg?branch=master)](https://travis-ci.org/sindresorhus/matcher)

> Simple [wildcard](https://en.wikipedia.org/wiki/Wildcard_character) matching

Useful when you want to accept loose string input and regexes/globs are too convoluted.


## Install

```
$ npm install --save matcher
```


## Usage

```js
const matcher = require('matcher');

matcher(['foo', 'bar', 'moo'], ['*oo', '!foo']);
//=> ['moo']

matcher(['foo', 'bar', 'moo'], ['!*oo']);
//=> ['bar']

matcher(['baz', 'foo', 'bar'], 'ba*');
//=> ['baz', 'bar']

matcher.isMatch('unicorn', 'uni*');
//=> true

matcher.isMatch('unicorn', '*corn');
//=> true

matcher.isMatch('unicorn', 'un*rn');
//=> true

matcher.isMatch('rainbow', '!unicorn');
//=> true

matcher.isMatch('foo bar baz', 'foo b* b*');
//=> true

matcher.isMatch('unicorn', 'uni\\*');
//=> false
```


## API

### matcher(inputs, patterns)

`input` is an array of input. `patterns` is an array of patterns, or a single pattern as a string.

Returns an array of of `inputs` filtered based on the `patterns`.

### matcher.isMatch(input, pattern)

Returns a boolean of whether the `input` matches the `pattern`.

#### input

Type: `string`

String to match.

#### pattern

Type: `string`

Case-insensitive. Use `*` to match zero or more characters. A pattern starting with `!` will be negated.


## Related

- [multimatch](https://github.com/sindresorhus/multimatch) - Extends `minimatch.match()` with support for multiple patterns


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
