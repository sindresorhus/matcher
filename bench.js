'use strict';
/* global bench */
const fs = require('fs');
const matcher = require('.');

const fixture = fs.readFileSync('fixture.txt', 'utf8');
const paragraph = fixture.split('\n')[0];
const sentence = fixture.split('.')[0];

bench('sentence matcher test multiple patterns', () => matcher(sentence.split(' '), ['*bar', '!foo', '!*oo']));
bench('sentence matcher test zero or more chars', () => matcher(sentence.split(' '), ['*foo']));
bench('sentence matcher test negation', () => matcher(sentence.split(' '), ['!foo']));
bench('sentence matcher test negation zero or more', () => matcher(sentence.split(' '), ['!*foo']));
bench('sentence is match test', () => matcher.isMatch(sentence, '*bar*'));

bench('paragraph matcher test multiple patterns', () => matcher(paragraph.split(' '), ['*bar', '!foo', '!*oo']));
bench('paragraph matcher test zero or more chars', () => matcher(paragraph.split(' '), ['*foo']));
bench('paragraph matcher test negation', () => matcher(paragraph.split(' '), ['!foo']));
bench('paragraph matcher test negation zero or more', () => matcher(paragraph.split(' '), ['!*foo']));
bench('paragraph is match test', () => matcher.isMatch(paragraph, '*bar*'));

bench('fixture matcher test multiple patterns', () => matcher(fixture.split(' '), ['*bar', '!foo', '!*oo']));
bench('fixture matcher test zero or more chars', () => matcher(fixture.split(' '), ['*foo']));
bench('fixture matcher test negation', () => matcher(fixture.split(' '), ['!foo']));
bench('fixture matcher test negation zero or more', () => matcher(fixture.split(' '), ['!*foo']));
bench('fixture is match test', () => matcher.isMatch(fixture, '*bar*'));