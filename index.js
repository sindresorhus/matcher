'use strict';
const escapeStringRegexp = require('escape-string-regexp');

const reCache = new Map();

function makeRe(pattern, options) {
	options = Object.assign({
		caseSensitive: false
	}, options);

	const cacheKey = pattern + JSON.stringify(options);

	if (reCache.has(cacheKey)) {
		return reCache.get(cacheKey);
	}

	const negated = pattern[0] === '!';

	if (negated) {
		pattern = pattern.slice(1);
	}

	pattern = escapeStringRegexp(pattern).replace(/\\\*/g, '.*');

	const re = new RegExp('^' + pattern + '$', options.caseSensitive ? '' : 'i');
	re.negated = negated;
	reCache.set(cacheKey, re);

	return re;
}

module.exports = function (inputs, patterns, options) {
	if (!(Array.isArray(inputs) && Array.isArray(patterns))) {
		throw new TypeError('Expected two arrays, got ' + typeof inputs + ' ' + typeof patterns);
	}

	if (patterns.length === 0) {
		return inputs;
	}

	const firstNegated = patterns[0][0] === '!';

	function patternToRe(pattern) {
		return makeRe(pattern, options);
	}

	patterns = patterns.map(patternToRe);

	const ret = [];

	for (const input of inputs) {
		// If first pattern is negated we include everything to match user expectation
		let matches = firstNegated;

		for (const pattern of patterns) {
			if (pattern.test(input)) {
				matches = !pattern.negated;
			}
		}

		if (matches) {
			ret.push(input);
		}
	}

	return ret;
};

module.exports.isMatch = function (input, pattern, options) {
	const re = makeRe(pattern, options);
	const matches = re.test(input);
	return re.negated ? !matches : matches;
};
