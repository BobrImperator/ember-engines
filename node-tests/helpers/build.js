'use strict';

const path = require('path');
const fixturify = require('fixturify');
const walkSync = require('walk-sync');

class BuildOutput {
  constructor(app) {
    this.app = app;
    this._buildPath = path.join(app.path, 'dist');
    this._build = fixturify.readSync(this._buildPath);
  }

  doesNotContain(file, matcher) {
    try {
      return !this.contains(file, matcher);
    } catch (e) {
      return true;
    }
  }

  contains(file, matcher) {
    let fileContents = this.file(file);

    if (matcher && !matcher.test(fileContents)) {
      throw new Error(`Expected file "${file}" to match "${matcher}", but it was not found.`);
    }

    return true;
  }

  files() {
    return walkSync(this._buildPath, { directories: false });
  }

  test() {
    return this.app.runEmberCommand('test', '--path', this._buildPath);
  }

  file(file) {
    let fileParts = file.split('/');
    let result = this._build;

    while (fileParts.length && result != undefined) {
      result = result[fileParts.shift()];
    }

    if (result == undefined) {
      throw new Error(`The file "${file}" was not found in the build output.`);
    }

    return result;
  }

  manifest() {
    return JSON.parse(this.file('asset-manifest.json'));
  }
}

function build(app) {
  return app.runEmberCommand('build').then(() => {
    return new BuildOutput(app);
  });
}

module.exports = build;