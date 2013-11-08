module.exports = exports;

exports.determineType = function( sport, headingContent ) {
  var
  headingClean = exports.cleanHeading( headingContent );

  return exports[sport].call( this, headingClean );

};

exports.cleanHeading = function( headingContent ) {
  var
  matches = /^(BC\-)?(.*)/.exec( headingContent );

  return matches[2];
};

exports.mlb = function( headingClean ) {

  var
  remainder = exports.remainder( headingClean );

  switch( exports.thirdPos( headingClean ) ) {
    case "E":
    case "F":
    case "P":
      return "partial-score-update";
      break;

    case "J":
      return "jfile";
      break;

    case "L":
      if ( remainder == "MLB-STANDINGS" ) {
        return "standings";
      }
      break;

    case "V":
      return "preview";
      break;

    // Statistics files. All different kinds.
    case "X":
      if ( remainder == "SKED" ) { return "schedule"; }
      else if ( remainder == "INDSTATS-FULL-" ) { return "indivstats"; }
      else if ( remainder == "TEAMSTATS-" ) { return "teamstats"; }
      else if ( remainder == "PRESTATS-" ) { return "indivstats"; }
      break;

    case "A":
    case "C":
    case "D":
    case "G":
    case "H":
    case "I":
    case "K":
    case "M":
    case "N":
    case "O":
    case "Q":
    case "R":
    case "S":
    case "T":
    case "W":
    case "Z":
    case "o":
    case "i":
    default:
      return "NO_PARSE";
      break;
  }

};

exports.nfl = function( headingClean ) {
  var
  remainder = exports.remainder( headingClean );

  switch( exports.thirdPos( headingClean ) ) {
    case "J":
      return "jfile";
      break
    case "P":
      return "partial-score-update";
      break;
    case "i":
      return "injury-update";
      break;
    case "L":
      if ( remainder == "NFL-WEEKLY-SCHEDULE" ) { return "schedule"; }
      break;
    default:
      return "NO_PARSE";
      break;
  }

};

exports.thirdPos = function( headingClean ) {
  return headingClean.slice( 2, 3 );
};

exports.fourthPos = function( headingClean ) {
  return headingClean.slice( 3, 4 );
};

exports.remainder = function( headingClean ) {
  return headingClean.slice(4);
};
