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

	const re = new RegExp(`^${pattern}$`, options.caseSensitive ? '' : 'i');
	re.negated = negated;
	reCache.set(cacheKey, re);

	return re;
}

const matcher = (inputs, patterns, options) => {
	if (!(Array.isArray(inputs) && Array.isArray(patterns))) {
		throw new TypeError(`Expected two arrays, got ${typeof inputs} ${typeof patterns}`);
	}

	if (patterns.length === 0) {
		return inputs;
	}

	const firstNegated = patterns[0][0] === '!';

	patterns = patterns.map(x => makeRe(x, options));

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

module.exports = matcher;

module.exports.isMatch = (input, patterns, options) => {
	const matches = matcher(input, patterns, options);
	return matches.length > 0;
};
