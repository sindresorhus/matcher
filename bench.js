'use strict';
/* global bench */
/* global suite */
const fs = require('fs');
const matcher = require('.');

const fixture = fs.readFileSync('fixture.txt', 'utf8');
const paragraph = fixture.split('\n')[0];
const sentence = fixture.split('.')[0];

suite('Matcher', () => {
	bench('sentence test multiple patterns', () => matcher(sentence.split(' '), ['*bar', '!foo', '!*oo']));
	bench('sentence test zero or more chars', () => matcher(sentence.split(' '), ['*foo']));
	bench('sentence test negation', () => matcher(sentence.split(' '), ['!foo']));
	bench('sentence test negation zero or more', () => matcher(sentence.split(' '), ['!*foo']));
});

suite('isMatch', () => {
	bench('sentence test', () => matcher.isMatch(sentence, '*bar*'));
});

suite('Matcher', () => {
	bench('paragraph test multiple patterns', () => matcher(paragraph.split(' '), ['*bar', '!foo', '!*oo']));
	bench('paragraph test zero or more chars', () => matcher(paragraph.split(' '), ['*foo']));
	bench('paragraph test negation', () => matcher(paragraph.split(' '), ['!foo']));
	bench('paragraph test negation zero or more', () => matcher(paragraph.split(' '), ['!*foo']));
});

suite('isMatch', () => {
	bench('paragraph test', () => matcher.isMatch(paragraph, '*bar*'));
});

suite('Matcher', () => {
	bench('fixture test multiple patterns', () => matcher(fixture.split(' '), ['*bar', '!foo', '!*oo']));
	bench('fixture test zero or more chars', () => matcher(fixture.split(' '), ['*foo']));
	bench('fixture test negation', () => matcher(fixture.split(' '), ['!foo']));
	bench('fixture test negation zero or more', () => matcher(fixture.split(' '), ['!*foo']));
});

suite('isMatch', () => {
	bench('fixture test', () => matcher.isMatch(fixture, '*bar*'));
});
