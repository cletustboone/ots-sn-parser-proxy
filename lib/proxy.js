var
Stream          = require("stream"),
Transform       = Stream.Transform,
util            = require("util"),
path            = require("path"),
fs              = require("fs"),
exec            = require("child_process").exec,
environment     = require("../environment"),
logPath         = environment.logPath,
Logger          = require("bunyan"),
sportMappings   = require("../mappings/sport"),
headingMappings = require("../mappings/heading");

module.exports = exports = Proxy;
util.inherits( Proxy, Transform );

function Proxy( options ) {
  this.setupLogger();
  this.options = options;
  this.argDelim = this.options.delim || "|||";
  this._buffer = "";
  Transform.call( this );
}

Proxy.prototype._transform = function( chunk, encoding, done ) {
  var
  input = chunk.toString(),
  inputPieces = input.split( this.argDelim ),
  filePos = inputPieces.indexOf("file"),
  contentPos = inputPieces.indexOf("headingContent"),
  fileName, basename, fileType, sportCode, headingContent;

  // If unable to pull a filename from the input, process can safely exit.
  if ( filePos >= 0 ) {
    this.cleanFileName( inputPieces[filePos+1] );
  } else {
    this.log.warn( "No file name could be parsed from stdin" );
    process.exit(1);
    done();
  }

  // headingContent may not be part of the input
  if ( contentPos >= 0 ) {
    sportCode = this.getSportCodeFromHeading( inputPieces[contentPos+1] );
  }

  // Proxy play by play files first
  if ( this.isPbp() ) {
    sportCode = this.getSportCodeFromFileName();
    this.fileSport = sportMappings[sportCode];
    var cmd = this.execParserCommand( "play-by-play" );

    // Execute the parser
    exec( cmd, function( error, stdout, stderr ) {
      if ( error ) {
        this.log.error( JSON.stringify( error ) );
        this.push( JSON.stringify( error ) + "\n" );
        done();
      } else {
        this.push( stdout );
        done();
      }
    }.bind( this ) );

  // Not a play by play file. Figure out sport.
  } else if ( this.fileName && !this.isPbp() ) {
    headingContent = inputPieces[contentPos+1];
    sportCode = this.getSportCodeFromHeading( headingContent );
    this.fileSport = sportMappings[sportCode];
    this.push( "Detected file " +this.fileName+" with heading " + inputPieces[contentPos+1] + "\n" );

    var
    parserType = headingMappings.determineType( this.fileSport, headingContent );

    if ( parserType == "NO_PARSE" ) {
      this.log.warn( "Not parsing file %s with heading %s", this.fileName, headingContent );
      this.push( "Not parsing file >> " + this.fileName + "\n" );
      done();
    } else {
      var cmd = this.execParserCommand( parserType );

      // Execute the parser
      exec( cmd, function( error, stdout, stderr ) {
        if ( error ) {
          this.log.error( JSON.stringify( error ) );
          this.push( JSON.stringify( error ) + "\n" );
          done();
        } else {
          this.push( stdout );
          done();
        }
      }.bind( this ) );
    }

  // No idea what this is.
  } else {
    this.log.warn( "Not sure what this file is." );
    done();
  }

};

Proxy.prototype._flush = function( cb ) {
  cb();
};

Proxy.prototype.getSportCodeFromHeading = function( headingContent ) {
  var
  patt = /^(BC\-)?([A-Z]{2})/,
  matches = patt.exec( headingContent );
  if ( matches && matches[2] ) return matches[2];
};

Proxy.prototype.getSportCodeFromFileName = function() {
  var
  patt = /^([A-Z]{2})/,
  matches = patt.exec( this.basename );
  if ( matches ) return matches[1];
  return null;
};

Proxy.prototype.execParserCommand = function( type ) {
  var
  parsers = [],
  parser,
  command = "node",
  args = [
  this.options["parser-path"] + "/" + this.fileSport + "/" + type + ".js",
    "--file",
    this.fileName,
    "--sport",
    this.fileSport
  ],
  output;

  if ( this.options.archive ) {
    args.push("--archive");
  }

  if ( this.options["archive-path"] ) {
    args.push("--archive-path");
    args.push( this.options["archive-path"] );
  }

  output =  = command + " " + args.join(" ");
  this.log.info( {command: output} );
  this.push( output + "\n" );
  return output;
};

Proxy.prototype.cleanFileName = function( fileName ) {
  this.normalized = path.normalize( fileName );
  this.fileName = path.resolve( process.cwd(), this.normalized );
  this.basename = path.basename( this.fileName );
};

Proxy.prototype.isPbp = function() {
  return /^[A-Z]{2}\-/.test( this.basename );
};

// Bunyan logger instance
Proxy.prototype.setupLogger = function() {
  var
  log = new Logger({
    name: "parser-proxy",
    streams: [
      {
        path: logPath + "/info.log",
        level: "info"
      },
      {
        path: logPath + "/error.log",
        level: "warn"
      }
    ]
  });
  this.log = log;
};
