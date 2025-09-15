import escapeStringRegexp from 'escape-string-regexp';

const regexpCache = new Map();

const sanitizeArray = (input, inputName) => {
	if (!Array.isArray(input)) {
		switch (typeof input) {
			case 'string': {
				input = [input];
				break;
			}

			case 'undefined': {
				input = [];
				break;
			}

			default: {
				throw new TypeError(`Expected '${inputName}' to be a string or an array, but got a type of '${typeof input}'`);
			}
		}
	}

	return input.filter(string => {
		if (typeof string !== 'string') {
			if (string === undefined) {
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
		.replaceAll(String.raw`\*`, '__ESCAPED_STAR__') // \* -> placeholder
		.replaceAll('\\\\', '__ESCAPED_BACKSLASH__') // \\ -> placeholder
		.replaceAll(/\\(.)/g, '$1'); // Other escapes like \<space> -> <space>

	pattern = escapeStringRegexp(pattern).replaceAll(String.raw`\*`, '.*'); // * -> .*

	pattern = pattern
		.replaceAll('__ESCAPED_STAR__', String.raw`\*`) // Restore escaped *
		.replaceAll('__ESCAPED_BACKSLASH__', '\\\\'); // Restore escaped \

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

	// Partition patterns for faster processing
	const negatedPatterns = patterns.filter(pattern => pattern.negated);
	const positivePatterns = patterns.filter(pattern => !pattern.negated);

	const {allPatterns} = options || {};
	const result = [];

	// Special handling for multiple negations with allPatterns and isMatch
	if (allPatterns && firstMatchOnly && negatedPatterns.length > 1 && positivePatterns.length === 0) {
		// Multiple negations only: ALL inputs must satisfy constraints (none should match any negation)
		for (const input of inputs) {
			for (const pattern of negatedPatterns) {
				if (pattern.test(input)) {
					return []; // Any input matching a negation means no match
				}
			}
		}

		return inputs.slice(0, 1); // All inputs passed negation constraints
	}

	for (const input of inputs) {
		// Check negated patterns first (immediate exclusion)
		let excludedByNegation = false;
		for (const pattern of negatedPatterns) {
			if (pattern.test(input)) {
				excludedByNegation = true;
				break;
			}
		}

		if (excludedByNegation) {
			continue; // Skip this input
		}

		// Check positive patterns
		if (positivePatterns.length === 0) {
			// No positive patterns - include if no negations matched (already checked above)
			result.push(input);
		} else if (allPatterns) {
			// AND logic: include if ALL positive patterns match
			const matchedPositive = Array.from({length: positivePatterns.length}, () => false);
			for (const [index, pattern] of positivePatterns.entries()) {
				if (pattern.test(input)) {
					matchedPositive[index] = true;
				}
			}

			// All positive patterns must match
			if (matchedPositive.every(Boolean)) {
				result.push(input);
			}
		} else {
			// OR logic: include if any positive pattern matches
			let matchedAny = false;
			for (const pattern of positivePatterns) {
				if (pattern.test(input)) {
					matchedAny = true;
					break; // Short-circuit on first match
				}
			}

			if (matchedAny) {
				result.push(input);
			}
		}

		if (firstMatchOnly && result.length > 0) {
			break;
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
