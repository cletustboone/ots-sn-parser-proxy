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
    case "B":
      if ( exports.isInactives( remainder ) ) { return "inactives"; }
      return "NO_PARSE";
      break;
    case "D":
      if ( exports.isRecap( remainder ) ) { return "recap"; }
      return "NO_PARSE";
      break;
    case "J":
      return "jfile";
      break;
    case "P":
      return "partial-score-update";
      break;
    case "i":
      return "injury-update";
      break;
    case "I":
      return "injury-by-division";
      break;
    case "L":
      if ( remainder == "NFL-WEEKLY-SCHEDULE" ) { return "weekly-schedule"; }
      if ( remainder == "NFL-EXTENDED-STANDINGS" ) { return "extended-standings"; }
      if ( remainder == "NFL-STANDINGS" ) { return "standings"; }
      return "NO_PARSE";
      break;

    case "O":
      return "odds";
      break;

    case "V":
      if ( exports.isPreview( remainder ) ) { return "preview"; }
      return "NO_PARSE";
      break;

    // Statistics. There are a ton.
    case "X":
      if ( exports.isYearly( remainder ) ) { return "yearly-schedule"; }
      if ( exports.isSched( remainder ) ) { return "sched"; }
      if ( exports.isSked( remainder ) ) { return "team-sked"; }
      if ( exports.isBoxCombined( remainder ) ) { return "box-combined"; }
      if ( exports.isLeaders( remainder ) ) { return "leaders"; }
      if ( exports.isDepth( remainder ) ) {return "depth-chart"; }
      if ( exports.isBest( remainder ) ) { return "best"; }
      if ( exports.isRoster( remainder ) ) { return "roster"; }
      if ( exports.isTeamStats( remainder ) ) { return "teamstats"; }

      return "misc-stats";
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

exports.isInactives = function( remainder ) {
  return /INACTIVES$/.test( remainder );
};

exports.isRecap = function( remainder ) {
  return /^RECAP/.test( remainder );
};

exports.isYearly = function( remainder ) {
  return /YEARLY$/.test( remainder );
};

exports.isSched = function( remainder ) {
  return /SCHED$/.test( remainder );
};

exports.isSked = function( remainder ) {
  return /SKED$/.test( remainder );
};

exports.isBoxCombined = function( remainder ) {
  return /^BOX(.*)COMBINED$/.test( remainder );
};

exports.isLeaders = function( remainder ) {
  return /LEADERS$/.test( remainder );
};

exports.isDepth = function( remainder ) {
  return /^DEPTH/.test( remainder );
};

exports.isBest = function( remainder ) {
  return /BEST$/.test( remainder );
};

exports.isRoster = function( remainder ) {
  return /^ROSTER/.test( remainder );
};

exports.isTeamStats = function( remainder ) {
  return /^TEAMSTATS/.test( remainder );
};
