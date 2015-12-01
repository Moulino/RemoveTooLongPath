/*
MIT License
===========

Copyright (c) 2012 Emmanuel Olive olive.emmanuel@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
*/

var fs = require('fs');
var path = require('path');

String.prototype.find = function(caract) {
	for(var i=0; i<this.length; ++i) {
		if(this[i] === caract) {
			return i;
		}
	}
	return -1;
};

String.prototype.hasWildcard = function() {
	for(var i=0; i<this.length; ++i) {
		if(this[i] === '*') {
			return true;
		}
	}
	return false;
};

var listPathsFromRegex = function(dirname, regex) {
		var content = fs.readdirSync(dirname);
		var paths = [];

		for(var i=0; i<content.length; ++i) {
			if(content[i].match(regex)) {
				paths.push(path.join(dirname, content[i]));
			}
		}
		return paths;
};

var regexFromString = function(str) {
	var index = str.find('*');
	var regex;

	if(index > -1) {
		regex = "^"+str.slice(0, index);
	}
	return regex;
};

var removePathRecursively = function(pathToRemove) {
	var stats = fs.statSync(pathToRemove);

	if(stats.isDirectory()) {
		var contents = fs.readdirSync(pathToRemove);

		for(var i=0; i<contents.length; ++i) {
			removePathRecursively(path.join(pathToRemove, contents[i]));
		}
		
		fs.rmdirSync(pathToRemove);
		console.info("Remove the directory : %s", pathToRemove);
	} else {
		fs.unlinkSync(pathToRemove);
		console.info("Remove the file : %s", pathToRemove);
	}
};

/* This function allows you to use the wildcard character */
var removePathWithWildcard = function(pathToRemove) {
	var basename = path.basename(pathToRemove);
	var dirname = path.dirname(pathToRemove);

	if(basename.hasWildcard()) {
		var dirname = path.dirname(pathToRemove);
		var regex = regexFromString(basename);
		var paths = listPathsFromRegex(dirname, regex);

		for(var i=0; i<paths.length; ++i) {
			removePathRecursively(paths[i]);
		}
	} else {
		removePathRecursively(pathToRemove);
	}
};

/* main process */
if(process.argv.length < 3) {
	console.warn("Usage : node removeTooLongPath <path1> <path2> ...");
	process.exit(-1);
}

for(var argId = 2; argId < process.argv.length; ++argId) {
	var pathToRemove = process.argv[argId];

	if(!path.isAbsolute(pathToRemove)) {
		var currentPath = path.dirname(process.argv[1]);
		pathToRemove = path.join(currentPath, pathToRemove);
	}
	removePathWithWildcard(pathToRemove);
}

process.exit(0);
