'use strict';
/* global bench, suite */
const fs = require('fs');
const matcher = require('.');

const fixture = fs.readFileSync('fixture.txt', 'utf8');
const paragraph = fixture.split('\n')[0];
const sentence = fixture.split('.')[0];

suite('matcher() - sentence', () => {
	bench('multiple patterns', () => matcher(sentence.split(' '), ['*bar', '!foo', '!*oo']));
	bench('zero or more chars', () => matcher(sentence.split(' '), ['*foo']));
	bench('negation', () => matcher(sentence.split(' '), ['!foo']));
	bench('negation zero or more', () => matcher(sentence.split(' '), ['!*foo']));
});

suite('matcher.isMatch() - sentence', () => {
	bench('sentence', () => matcher.isMatch(sentence, '*bar*'));
});

suite('matcher() - paragraph', () => {
	bench('multiple patterns', () => matcher(paragraph.split(' '), ['*bar', '!foo', '!*oo']));
	bench('zero or more chars', () => matcher(paragraph.split(' '), ['*foo']));
	bench('negation', () => matcher(paragraph.split(' '), ['!foo']));
	bench('negation zero or more', () => matcher(paragraph.split(' '), ['!*foo']));
});

suite('matcher.isMatch() - paragraph', () => {
	bench('test', () => matcher.isMatch(paragraph, '*bar*'));
});

suite('matcher() - fixture', () => {
	bench('multiple patterns', () => matcher(fixture.split(' '), ['*bar', '!foo', '!*oo']));
	bench('zero or more chars', () => matcher(fixture.split(' '), ['*foo']));
	bench('negation', () => matcher(fixture.split(' '), ['!foo']));
	bench('negation zero or more', () => matcher(fixture.split(' '), ['!*foo']));
});

suite('matcher.isMatch() - fixture', () => {
	bench('test', () => matcher.isMatch(fixture, '*bar*'));
});
