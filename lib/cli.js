var
nopt = require("nopt");

exports.known = {
  "sport": [String, null],
  "delim": [String, null],
  "parser-path": [String]
};

exports.shortHands = {
  "s": ["--sport"],
  "d": ["--delim"],
  "p": ["--parser-path"]
};

exports.options = nopt( exports.known, exports.shortHands, process.argv, 2 );
