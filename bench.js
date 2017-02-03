'use strict';
/* global bench */
var fs = require('fs');
var matcher = require('./');

var fixture = fs.readFileSync('fixture.txt', 'utf8');

bench('matcher-test-multiple-patterns', function () {
	matcher(fixture.split(' '), ['*bar', '!foo', '!*oo']);
});

bench('matcher-test-zero-or-more-chars', function () {
	matcher(fixture.split(' '), ['*foo']);
});

bench('matcher-test-negation', function () {
	matcher(fixture.split(' '), ['!foo']);
});

bench('matcher-test-negation-zero-or-more', function () {
	matcher(fixture.split(' '), ['!*foo']);
});

bench('is-match-test', function () {
	matcher.isMatch(fixture, '*bar*');
});
