import escapeStringRegexp from 'escape-string-regexp';

const regexpCache = new Map();

const sanitizeArray = (input, inputName) => {
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
};

const makeRegexp = (pattern, options) => {
	options = {
		caseSensitive: false,
		...options,
	};

	const flags = 's' + (options.caseSensitive ? '' : 'i'); // Always dotAll, optionally case-insensitive
	const cacheKey = pattern + '|' + flags;

	if (regexpCache.has(cacheKey)) {
		return regexpCache.get(cacheKey);
	}

	const negated = pattern[0] === '!';

	if (negated) {
		pattern = pattern.slice(1);
	}

	// Handle escapes: first preserve escaped chars, then convert * to wildcards
	pattern = pattern
		.replace(/\\\*/g, '__ESCAPED_STAR__') // \* -> placeholder
		.replace(/\\\\/g, '__ESCAPED_BACKSLASH__') // \\ -> placeholder
		.replace(/\\(.)/g, '$1'); // Other escapes like \<space> -> <space>

	pattern = escapeStringRegexp(pattern).replace(/\\\*/g, '.*'); // * -> .*

	pattern = pattern
		.replace(/__ESCAPED_STAR__/g, '\\*') // Restore escaped *
		.replace(/__ESCAPED_BACKSLASH__/g, '\\\\'); // Restore escaped \

	const regexp = new RegExp(`^${pattern}$`, flags);
	regexp.negated = negated;
	regexpCache.set(cacheKey, regexp);

	return regexp;
};

const baseMatcher = (inputs, patterns, options, firstMatchOnly) => {
	inputs = sanitizeArray(inputs, 'inputs');
	patterns = sanitizeArray(patterns, 'patterns');

	if (patterns.length === 0) {
		return [];
	}

	patterns = patterns.map(pattern => makeRegexp(pattern, options));

	const {allPatterns} = options || {};
	const result = [];

	for (const input of inputs) {
		// String is included only if it matches at least one non-negated pattern supplied.
		// Note: the `allPatterns` option requires every non-negated pattern to be matched once.
		// Matching a negated pattern excludes the string.
		let matches;
		const didFit = Array.from({length: patterns.length}, () => false);

		for (const [index, pattern] of patterns.entries()) {
			if (pattern.test(input)) {
				didFit[index] = true;
				matches = !pattern.negated;

				if (!matches) {
					break;
				}
			}
		}

		// Include input if:
		// - A negated pattern matched (matches === false) -> exclude
		// - No pattern matched but there are non-negated patterns -> exclude
		// - allPatterns is true and some non-negated pattern didn't match -> exclude
		// Otherwise -> include
		const shouldExclude = matches === false
			|| (matches === undefined && patterns.some(pattern => !pattern.negated))
			|| (allPatterns && didFit.some((yes, index) => !yes && !patterns[index].negated));

		if (!shouldExclude) {
			result.push(input);

			if (firstMatchOnly) {
				break;
			}
		}
	}

	return result;
};

export function matcher(inputs, patterns, options) {
	return baseMatcher(inputs, patterns, options, false);
}

export function isMatch(inputs, patterns, options) {
	return baseMatcher(inputs, patterns, options, true).length > 0;
}
