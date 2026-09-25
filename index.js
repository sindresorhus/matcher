const maximumCacheSize = 1000;
const patternCache = new Map();

const sanitizeArray = (input, inputName) => {
	if (input === undefined) {
		return [];
	}

	if (typeof input === 'string') {
		return [input];
	}

	if (!Array.isArray(input)) {
		throw new TypeError(`Expected '${inputName}' to be a string or an array, but got a type of '${typeof input}'`);
	}

	return input.filter(string => {
		if (string === undefined) {
			return false;
		}

		if (typeof string !== 'string') {
			throw new TypeError(`Expected '${inputName}' to be an array of strings, but found a type of '${typeof string}' in the array`);
		}

		return true;
	});
};

// Splits a pattern into the literal parts between unescaped `*` wildcards. A backslash makes the next character literal.
const splitOnWildcards = pattern => {
	const parts = [];
	let part = '';
	// Append slices instead of single characters, since each append adds a rope node.
	let sliceStart = 0;

	for (let index = 0; index < pattern.length; index++) {
		const character = pattern[index];

		if (character === '*') {
			parts.push(part + pattern.slice(sliceStart, index));
			part = '';
			sliceStart = index + 1;
		} else if (character === '\\' && index + 1 < pattern.length) {
			// Drop the backslash and skip the escaped character so that it stays literal.
			part += pattern.slice(sliceStart, index);
			sliceStart = index + 1;
			index++;
		}
	}

	parts.push(part + pattern.slice(sliceStart));

	return parts;
};

// Greedy matching of each part at its first possible position is correct for `*`-only wildcards and never backtracks, unlike a regex, so the time is at most proportional to input length times pattern length.
const matchesParts = (input, parts) => {
	if (parts.length === 1) {
		return input === parts[0];
	}

	const first = parts[0];
	const last = parts.at(-1);
	const end = input.length - last.length;

	if (
		end < first.length
		|| !input.startsWith(first)
		|| !input.endsWith(last)
	) {
		return false;
	}

	let position = first.length;

	for (let partIndex = 1; partIndex < parts.length - 1; partIndex++) {
		const part = parts[partIndex];
		const index = input.indexOf(part, position);

		if (index === -1 || index + part.length > end) {
			return false;
		}

		position = index + part.length;
	}

	return true;
};

// Uppercase each character like a case-insensitive regex does. Keep the character if uppercasing changes its length or turns it into ASCII (`ß` → `SS`, `ı` → `I`), so lookalike characters do not match ASCII patterns.
const uppercaseCharacter = character => {
	const uppercase = character.toUpperCase();

	if (
		uppercase.length !== 1
		|| (character.codePointAt(0) > 0x7F && uppercase.codePointAt(0) <= 0x7F)
	) {
		return character;
	}

	return uppercase;
};

const normalizeCase = (string, caseSensitive) => {
	if (caseSensitive) {
		return string;
	}

	// Fast path: if uppercasing the whole string keeps its length, no character became longer. `ı` and `ſ` are the only characters that uppercase from non-ASCII to ASCII, and surrogates are excluded to keep astral characters unchanged. The result is then the same as for `uppercaseCharacter()`.
	if (!/[ıſ\uD800-\uDFFF]/.test(string)) {
		const uppercase = string.toUpperCase();

		if (uppercase.length === string.length) {
			return uppercase;
		}
	}

	return string
		.replaceAll(/\P{ASCII}/gu, uppercaseCharacter)
		.replaceAll(/[a-z]+/g, letters => letters.toUpperCase());
};

// The returned `test()` expects an input already passed through `normalizeCase()`.
const makePattern = (pattern, caseSensitive) => {
	const cacheKey = (caseSensitive ? 'S' : 'I') + pattern;

	const cachedPattern = patternCache.get(cacheKey);

	if (cachedPattern) {
		return cachedPattern;
	}

	const negated = pattern.startsWith('!');

	if (negated) {
		pattern = pattern.slice(1);
	}

	// Copy the parts so that the cache holds flat strings of their own. Otherwise, V8 can keep rope nodes, or the larger string the pattern was sliced from, in memory.
	const parts = structuredClone(splitOnWildcards(normalizeCase(pattern, caseSensitive)));

	const compiledPattern = {
		negated,
		test: input => matchesParts(input, parts),
	};

	// Limit the cache so that many different patterns cannot use unlimited memory. A `Map` keeps insertion order, so the first key is the oldest.
	if (patternCache.size >= maximumCacheSize) {
		patternCache.delete(patternCache.keys().next().value);
	}

	patternCache.set(cacheKey, compiledPattern);

	return compiledPattern;
};

// Returns a function that checks whether one input matches the patterns, and whether `isMatch()` must require all inputs to match.
const compilePatterns = (patterns, options) => {
	patterns = sanitizeArray(patterns, 'patterns');

	if (patterns.length === 0) {
		return {matches: () => false, requiresAllInputs: false};
	}

	const {allPatterns, caseSensitive} = {allPatterns: false, caseSensitive: false, ...options};
	const compiledPatterns = patterns.map(pattern => makePattern(pattern, caseSensitive));

	// Partition patterns for faster processing
	const negatedPatterns = compiledPatterns.filter(pattern => pattern.negated);
	const positivePatterns = compiledPatterns.filter(pattern => !pattern.negated);

	const matches = input => {
		const comparableInput = normalizeCase(input, caseSensitive);

		// Check negated patterns first (immediate exclusion)
		for (const pattern of negatedPatterns) {
			if (pattern.test(comparableInput)) {
				return false;
			}
		}

		// No positive patterns - include if no negations matched (already checked above)
		if (positivePatterns.length === 0) {
			return true;
		}

		if (allPatterns) {
			// AND logic: include if ALL positive patterns match
			for (const pattern of positivePatterns) {
				if (!pattern.test(comparableInput)) {
					return false;
				}
			}

			return true;
		}

		// OR logic: include if any positive pattern matches
		for (const pattern of positivePatterns) {
			if (pattern.test(comparableInput)) {
				return true; // Short-circuit on first match
			}
		}

		return false;
	};

	return {
		matches,
		// Special handling for multiple negations with allPatterns and isMatch
		requiresAllInputs: allPatterns && negatedPatterns.length > 1 && positivePatterns.length === 0,
	};
};

export function matcher(inputs, patterns, options) {
	inputs = sanitizeArray(inputs, 'inputs');
	const {matches} = compilePatterns(patterns, options);
	return inputs.filter(input => matches(input));
}

export function isMatch(inputs, patterns, options) {
	inputs = sanitizeArray(inputs, 'inputs');
	const {matches, requiresAllInputs} = compilePatterns(patterns, options);

	if (requiresAllInputs) {
		// Multiple negations only: ALL inputs must satisfy constraints (none should match any negation)
		return inputs.length > 0 && inputs.every(input => matches(input));
	}

	return inputs.some(input => matches(input));
}
