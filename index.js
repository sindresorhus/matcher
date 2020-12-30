'use strict';
const escapeStringRegexp = require('escape-string-regexp');

const regexpCache = new Map();

function makeRegexp(pattern, options) {
	options = {
		caseSensitive: false,
		...options
	};

	const cacheKey = pattern + JSON.stringify(options);

	if (regexpCache.has(cacheKey)) {
		return regexpCache.get(cacheKey);
	}

	const negated = pattern[0] === '!';

	if (negated) {
		pattern = pattern.slice(1);
	}

	pattern = escapeStringRegexp(pattern).replace(/\\\*/g, '[\\s\\S]*');

	const regexp = new RegExp(`^${pattern}$`, options.caseSensitive ? '' : 'i');
	regexp.negated = negated;
	regexpCache.set(cacheKey, regexp);

	return regexp;
}

module.exports = (inputs, patterns, options) => {
	if (!(Array.isArray(inputs) && Array.isArray(patterns))) {
		throw new TypeError(`Expected two arrays, got ${typeof inputs} ${typeof patterns}`);
	}

	if (patterns.length === 0) {
		return inputs;
	}

	const isFirstPatternNegated = patterns[0][0] === '!';
	const {every} = options || {};

	patterns = patterns.map(pattern => makeRegexp(pattern, options));

	const result = [];
	const happies = patterns.map(rx => every ? (rx.negated ? 1 : 0) : 1);

	for (const input of inputs) {
		// If first pattern is negated we include everything to match user expectation.
		let matches = isFirstPatternNegated;

		for (let i = 0, pattern; i < patterns.length; ++i) {
			if ((pattern = patterns[i]).test(input)) {
				if ((matches = !pattern.negated)) {
					happies[i] += 1;
				}
			}
		}

		if (matches) {
			result.push(input);
		}
	}

	return happies.every(Boolean) ? result : [];
};

module.exports.isMatch = (input, pattern, options) => {
	const inputArray = Array.isArray(input) ? input : [input];
	const patternArray = Array.isArray(pattern) ? pattern : [pattern];

	return inputArray.some(input => {
		return patternArray.every(pattern => {
			const regexp = makeRegexp(pattern, options);
			const matches = regexp.test(input);
			return regexp.negated ? !matches : matches;
		});
	});
};
