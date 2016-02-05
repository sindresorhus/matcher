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

matcher.isMatch('uni*', 'unicorn');
//=> true

matcher.isMatch('*corn', 'unicorn');
//=> true

matcher.isMatch('un*rn', 'unicorn');
//=> true

matcher.isMatch('!unicorn', 'rainbow');
//=> true

matcher.isMatch('foo b* b*', 'foo bar baz');
//=> true

matcher.isMatch('uni\\*', 'unicorn');
//=> false
```


## API

### matcher(inputs, patterns)

Accepts an array of `input`'s and `pattern`'s.

Returns an array of of `inputs` filtered based on the `patterns`.

### matcher.isMatch(input, pattern)

Returns a boolean of whether the `input` matches the `pattern`.

#### input

Type: `string`

String to match.

#### pattern

Type: `string`

Use `*` to match zero or more characters. A pattern starting with `!` will be negated.


## Related

- [multimatch](https://github.com/sindresorhus/multimatch) - Extends `minimatch.match()` with support for multiple patterns


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
