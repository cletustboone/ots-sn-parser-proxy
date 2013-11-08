#!/usr/bin/env node

var
options = require("../lib/cli").options,
Proxy = require("../lib/proxy"),
split = require("split"),
matcher = options.in0 ? "\0" : null,
proxy;

if ( !options.sport ) {
  console.log("Need to know what sport you'd like to monitor. Use option --sport (nfl|mlb)");
  process.exit(1);
} else {
  if ( !options["parser-path"] ) {
    options["parser-path"] = "~/Dropbox/12c/parser-sportsnetwork";
  }
  proxy = new Proxy( options );

  process.stdin
    .pipe( split( matcher ) )
    .pipe( proxy )
    .pipe( process.stdout );

  proxy.on( "error", function( err ) {
    console.log( err );
  });
}
