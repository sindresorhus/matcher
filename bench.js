/* global bench, suite */
import fs from 'node:fs';
import {matcher, isMatch} from './index.js';

const fixture = fs.readFileSync('fixture.txt', 'utf8');
const paragraph = fixture.split('\n')[0];
const sentence = fixture.split('.')[0];

suite('matcher() - sentence', () => {
	bench('multiple patterns', () => matcher(sentence.split(' '), ['*bar', '!foo', '!*oo']));
	bench('zero or more chars', () => matcher(sentence.split(' '), ['*foo']));
	bench('negation', () => matcher(sentence.split(' '), ['!foo']));
	bench('negation zero or more', () => matcher(sentence.split(' '), ['!*foo']));
});

suite('isMatch() - sentence', () => {
	bench('sentence', () => isMatch(sentence, '*bar*'));
});

suite('matcher() - paragraph', () => {
	bench('multiple patterns', () => matcher(paragraph.split(' '), ['*bar', '!foo', '!*oo']));
	bench('zero or more chars', () => matcher(paragraph.split(' '), ['*foo']));
	bench('negation', () => matcher(paragraph.split(' '), ['!foo']));
	bench('negation zero or more', () => matcher(paragraph.split(' '), ['!*foo']));
});

suite('isMatch() - paragraph', () => {
	bench('test', () => isMatch(paragraph, '*bar*'));
});

suite('matcher() - fixture', () => {
	bench('multiple patterns', () => matcher(fixture.split(' '), ['*bar', '!foo', '!*oo']));
	bench('zero or more chars', () => matcher(fixture.split(' '), ['*foo']));
	bench('negation', () => matcher(fixture.split(' '), ['!foo']));
	bench('negation zero or more', () => matcher(fixture.split(' '), ['!*foo']));
});

suite('isMatch() - fixture', () => {
	bench('test', () => isMatch(fixture, '*bar*'));
});

suite('matcher({allPatterns}) - fixture', () => {
	const options = {allPatterns: true};
	bench('multiple patterns', () => matcher(fixture.split(' '), ['*bar', '!foo', '!*oo'], options));
	bench('zero or more chars', () => matcher(fixture.split(' '), ['*foo'], options));
	bench('negation', () => matcher(fixture.split(' '), ['!foo'], options));
	bench('negation zero or more', () => matcher(fixture.split(' '), ['!*foo'], options));
});
