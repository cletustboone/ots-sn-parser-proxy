var
nopt = require("nopt");

exports.known = {
  "delim": [String, null],
  "parser-path": [String],
  "archive": [Boolean],
  "archive-path": [String],
  "logs": [String]
};

exports.shortHands = {
  "s": ["--sport"],
  "d": ["--delim"],
  "p": ["--parser-path"]
};

exports.options = nopt( exports.known, exports.shortHands, process.argv, 2 );
