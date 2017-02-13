'use strict';
const escapeStringRegexp = require('escape-string-regexp');

const reCache = new Map();

function makeRe(pattern, shouldNegate) {
	const cacheKey = pattern + shouldNegate;

	if (reCache.has(cacheKey)) {
		return reCache.get(cacheKey);
	}

	let negated = false;

	if (pattern[0] === '!') {
		negated = true;
		pattern = pattern.slice(1);
	}

	pattern = escapeStringRegexp(pattern).replace(/\\\*/g, '.*');

	if (negated && shouldNegate) {
		pattern = `(?!${pattern})`;
	}

	const re = new RegExp(`^${pattern}$`, 'i');
	re.negated = negated;
	reCache.set(cacheKey, re);

	return re;
}

module.exports = (inputs, patterns) => {
	if (!(Array.isArray(inputs) && Array.isArray(patterns))) {
		throw new TypeError(`Expected two arrays, got ${typeof inputs} ${typeof patterns}`);
	}

	if (patterns.length === 0) {
		return inputs;
	}

	const firstNegated = patterns[0][0] === '!';

	patterns = patterns.map(x => makeRe(x, false));

	const ret = [];

	for (const input of inputs) {
		// If first pattern is negated we include everything to match user expectation
		let matches = firstNegated;

		// TODO: Figure out why tests fail when I use a for-of loop here
		for (let j = 0; j < patterns.length; j++) {
			if (patterns[j].test(input)) {
				matches = !patterns[j].negated;
			}
		}

		if (matches) {
			ret.push(input);
		}
	}

	return ret;
};

module.exports.isMatch = (input, pattern) => makeRe(pattern, true).test(input);
