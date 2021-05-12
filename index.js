'use strict';
const escapeStringRegexp = require('escape-string-regexp');

const regexpCache = new Map();

function sanitizeArray(input, inputName) {
	if (!Array.isArray(input)) {
		switch (typeof input) {
			case 'string':
				input = [input];
				break;
			case 'undefined':
				input = [];
				break;
			default:
				throw new TypeError(`Expected '${inputName}' to be a string or an array, but got a type of '${typeof input}'`);
		}
	}

	return input.filter(string => {
		if (typeof string !== 'string') {
			if (typeof string === 'undefined') {
				return false;
			}

			throw new TypeError(`Expected '${inputName}' to be an array of strings, but found a type of '${typeof string}' in the array`);
		}

		return true;
	});
}

function makeRegexp(pattern, options) {
	options = {
		caseSensitive: false,
		...options
	};

	const cacheKey = pattern + JSON.stringify(options);

	if (regexpCache.has(cacheKey)) {
		return regexpCache.get(cacheKey);
	}

	const negated = pattern[0] === '!' ? 1 : 0;

	if (negated) {
		pattern = pattern.slice(1);
	}

	pattern = escapeStringRegexp(pattern).replace(/\\\*/g, '[\\s\\S]*');

	const regexp = new RegExp(`^${pattern}$`, options.caseSensitive ? '' : 'i');
	regexp.negated = negated;
	regexpCache.set(cacheKey, regexp);

	return regexp;
}

const matcher = (inputs, patterns, options, firstMatchOnly) => {
	inputs = sanitizeArray(inputs, 'inputs');
	patterns = sanitizeArray(patterns, 'patterns');

	if (patterns.length === 0) {
		return [];
	}

	patterns = patterns.map(pattern => makeRegexp(pattern, options));

	const {allPatterns} = options || {};
	const didFit = new Uint8Array(patterns.length);
	const result = [];

	for (const input of inputs) {
		let matches;
		//	String is included only if it matches at least one non-negated pattern supplied.
		//  NB: the `allPatterns` option requires every non-negated pattern to be matched once.
		//	Matching a negated pattern excludes the string.

		for (let i = 0, pattern; (pattern = patterns[i]) !== undefined; i += 1) {
			if (pattern.test(input)) {
				didFit[i] = 1;
				matches = !pattern.negated;

				if (!matches) {
					break;
				}
			}
		}

		if (matches || (matches === undefined && !patterns.some(pattern => !pattern.negated))) {
			result.push(input);

			if (firstMatchOnly && !allPatterns) {
				break;
			}
		}
	}

	return (!allPatterns || didFit.every((v, i) => v ^ patterns[i].negated)) ? result : [];
};

module.exports = (inputs, patterns, options) => matcher(inputs, patterns, options, false);

module.exports.isMatch = (inputs, patterns, options) => {
	const matching = matcher(inputs, patterns, options, true);

	return matching.length > 0;
};
