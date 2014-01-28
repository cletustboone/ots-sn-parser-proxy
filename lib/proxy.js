var
Stream          = require("stream"),
Transform       = Stream.Transform,
util            = require("util"),
path            = require("path"),
fs              = require("fs"),
exec            = require("child_process").exec,
Logger          = require("bunyan"),
sportMappings   = require("../mappings/sport"),
headingMappings = require("../mappings/heading");

module.exports = exports = Proxy;
util.inherits( Proxy, Transform );

function Proxy( options ) {
  this.options = options;
  this.setupLogger();
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

  // Proxy play by play and MLB pitch files first. Need to tell the command former which sport it's for.
  // Play by play files are unique to the sport type, so each one is parsed a little differently.
  if ( this.isPbp() || this.isPitch() ) {
    sportCode = this.getSportCodeFromFileName();
    this.fileSport = sportMappings[sportCode];

    var cmd;
    if ( this.isPbp() ) {
      cmd = this.execParserCommand( "play-by-play-" + this.fileSport );
    } else if ( this.isPitch() ) {
      cmd = this.execParserCommand( "pitch" );
    }

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

  // Not a play by play file or MLB pitch file. Figure out sport.
  } else if ( this.fileName && !this.isPbp() && !this.isPitch() ) {
    headingContent = inputPieces[contentPos+1];
    sportCode = this.getSportCodeFromHeading( headingContent );
    this.fileSport = sportMappings[sportCode];
    this.push( "Detected file " +this.fileName+" with heading " + inputPieces[contentPos+1] + "\n" );

    var
    parserType = headingMappings.parsers( this.fileSport, headingContent );

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
  this.options["parser-path"] + "/parsers/" + type + ".js",
    "--file",
    this.fileName,
    "--sport",
    this.fileSport
  ],
  output;

  if ( this.options.archive ) {
    args.push("--archive");
  }

  output = command + " " + args.join(" ");
  this.log.info( {command: output} );
  this.push( output + "\n" );
  return output;
};

Proxy.prototype.cleanFileName = function( fileName ) {
  this.normalized = path.normalize( fileName );
  this.fileName = path.resolve( process.cwd(), this.normalized );
  this.basename = path.basename( this.fileName );
};

// Detect play by play files
Proxy.prototype.isPbp = function() {
  // You have a possible play by play file
  if ( /^[A-Z]{2}\-/.test( this.basename ) ) {
    // Make sure it is NOT a pitch
    if ( this.isPitch() ) { return false; }
    return true;
  }
  return false;
};

// Detect pitch files -- MLB only.
Proxy.prototype.isPitch = function() {
  return /PITCH\.XML$/.test( this.basename );
};

// Bunyan logger instance
Proxy.prototype.setupLogger = function() {
  var
  logPath = path.resolve( process.cwd(), this.options.logs ),
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
