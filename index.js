'use strict';
const escapeStringRegexp = require('escape-string-regexp');

const reCache = new Map();

function makeRe(pattern, shouldNegate, options) {
	const opts = Object.assign({
		caseSensitive: false
	}, options);

	const cacheKey = pattern + shouldNegate + JSON.stringify(opts);

	if (reCache.has(cacheKey)) {
		return reCache.get(cacheKey);
	}

	const negated = pattern[0] === '!';

	if (negated) {
		pattern = pattern.slice(1);
	}

	pattern = escapeStringRegexp(pattern).replace(/\\\*/g, '.*');

	if (negated && shouldNegate) {
		pattern = `(?!${pattern})`;
	}

	const re = new RegExp(`^${pattern}$`, opts.caseSensitive ? '' : 'i');
	re.negated = negated;
	reCache.set(cacheKey, re);

	return re;
}

module.exports = (inputs, patterns, options) => {
	if (!(Array.isArray(inputs) && Array.isArray(patterns))) {
		throw new TypeError(`Expected two arrays, got ${typeof inputs} ${typeof patterns}`);
	}

	if (patterns.length === 0) {
		return inputs;
	}

	const firstNegated = patterns[0][0] === '!';

	patterns = patterns.map(x => makeRe(x, false, options));

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

module.exports.isMatch = (input, pattern, options) => makeRe(pattern, true, options).test(input);
