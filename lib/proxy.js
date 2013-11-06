var
Stream = require("stream"),
Transform = Stream.Transform,
util = require("util"),
path = require("path"),
fs = require("fs"),
spawn = require("child_process").spawn,
sportMappings = require("../mappings/sport"),
headingMappings = require("../mappings/heading");

module.exports = exports = Proxy;
util.inherits( Proxy, Transform );

function Proxy( options ) {
  this.options = options;
  this.argDelim = this.options.delim || "|||";
  Transform.call( this );
}

Proxy.prototype._transform = function( chunk, encoding, done ) {
  var
  input = chunk.toString(),
  inputPieces = input.split( this.argDelim ),
  filePos = inputPieces.indexOf("file"),
  fileTypePos = inputPieces.indexOf("filetype"),
  contentPos = inputPieces.indexOf("headingContent"),
  fileName, fileType, sportCode;

  // this.push( inputPieces[filePos+1] + "\n" );

  if ( filePos >= 0 ) {
    fileName = inputPieces[filePos+1];
  } else {
    done();
  }

  // filetype may not be part of the input.
  if ( fileTypePos >= 0 ) {
    fileType = inputPieces[fileTypePos+1];
  }

  // headingContent may not be part of the input
  if ( contentPos >= 0 ) {
    sportCode = this.getSportCodeFromHeading( inputPieces[contentPos+1] );
  }

  // Proxy play by play files first
  if ( fileType == "pbp" ) {
    sportCode = this.getSportCodeFromFileName( fileName );
    this.spawnParser( this.options.sport, "play-by-play", fileName );
    done();
  } else if ( fileName ) {
    this.push( "Detected file " +fileName+" with heading " + inputPieces[contentPos+1] + "\n" );
    done();
  }

};

Proxy.prototype.getSportCodeFromHeading = function( headingContent ) {
  var
  patt = /^(BC\-)?([A-Z]{2})/,
  matches = patt.exec( headingContent );
  if ( matches && matches[2] ) return matches[2];
};

Proxy.prototype.getSportCodeFromFileName = function( fileName ) {
  var
  patt = /^([A-Z]{2})/,
  matches = patt.exec( fileName );
  if ( matches ) return matches[1];
  return null;
};

Proxy.prototype.spawnParser = function( sport, type, fileName ) {
  var
  parsers = [],
  parser,
  command = "node",
  args = [ this.options["parser-path"] + "/" + sport + "/" + type + ".js", "--file", fileName];

  this.push( "Sending file " + fileName + " to "+type+" parser.\n" );
  parser = spawn( command, args );
  return;

};
