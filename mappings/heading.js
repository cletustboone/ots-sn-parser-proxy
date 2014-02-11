module.exports = exports;

// Gets rid of leading BC- if it exists and gives us everything after
exports.cleanHeading = function( headingContent ) {
  var
  matches = /^(BC\-)?(.*)/.exec( headingContent );

  return matches[2];
};

// Parser mappings for different heading types
// This can be unified across all sports because SportsNetwork uses a pretty consistent schema pan-sport.
// Things specific to mlb, nfl, etc are indicated as such in the comments below.
exports.parsers = function( sport, headingContent ) {
  var
  headingClean = exports.cleanHeading( headingContent ),
  remainder = exports.remainder( headingClean );

  switch( exports.thirdPos( headingClean ) ) {
    case "A":

    case "B":
      // NFL
      if ( exports.isInactives( remainder ) ) { return "inactives"; }

      // MLB
      if ( /^ROSTER/.test( remainder ) ) { return "roster"; }
      if ( /^PROBS/.test( remainder) ) { return "probables"; }
      if ( /LINEUP/.test( remainder ) ) { return "lineups"; }

      return "extra";
      break;

    case "C":

    case "D":
      if ( exports.isRecap( remainder ) ) { return "recap"; }
      return "extra";
      break;

    case "E":

    case "F":
      // Final score updates
      return "partial-score-update";
      break;
    case "G":

    case "H":

    case "i":
      return "injury-update";
      break;

    case "I":
      // MLB only
      if( /^INJURIES/.test( remainder ) ) { return "injuries"; }

      // NFL, but I don't see this has ever been parsed. Because there is no parser for it.
      return "injury-by-division";
      break;

    case "J":
      return "jfile";
      break;

    case "K":

    case "L":
      // NFL
      if ( remainder == "NFL-WEEKLY-SCHEDULE" ) { return "weekly-schedule"; }
      if ( remainder == "NFL-EXTENDED-STANDINGS" ) { return "extended-standings"; }
      if ( remainder == "NFL-STANDINGS" ) { return "standings"; }

      // MLB
      if ( remainder == "MLB-STANDINGS" ) { return "standings"; }
      if ( remainder == "MLB-WEEKLY-SCHEDULE" ) { return "weekly-schedule"; }
      if ( remainder == "MLB-EXTENDED-STANDINGS" ) { return "extended-standings"; }
      return "extra";
      break;

    case "M":

    case "N":
      // MLB only
      if ( /PLAYER\-OF\-WEEK/.test( remainder ) ) { return "player-of-the-week"; }
      return "extra";
      break;

    case "O":
      if ( /^ODDS/.test( remainder ) ) { return "odds"; }
      if ( /^MLB\-EARLY\-LINE/.test( remainder ) ) { return "early-line"; }
      return "extra";
      break;

    case "P":
      return "partial-score-update";
      break;

    case "Q":

    case "R":
      // Final score updates with extra stuff.
      return "partial-score-update";
      break;

    case "S":

    case "T":

    case "U":

    case "V":
      if ( exports.isPreview( remainder ) ) { return "preview"; }
      return "extra";
      break;

    case "W":
      // MLB
      return "weather";
      break;

    // Statistics. There are a ton.
    case "X":

      // Common stuff
      if ( exports.isYearly( remainder ) ) { return "yearly-schedule"; }
      if ( exports.isSched( remainder ) ) { return "sched"; }
      if ( exports.isSked( remainder ) ) { return "team-sked"; }
      if ( exports.isLeaders( remainder ) ) { return "leaders"; }
      if ( exports.isRoster( remainder ) ) { return "roster"; }
      if ( exports.isTeamStats( remainder ) ) { return "teamstats"; }

      // NFL stuff
      if ( exports.isBoxCombined( remainder ) ) { return "box-combined"; }
      if ( exports.isDepth( remainder ) ) {return "depth-chart"; }
      if ( exports.isBest( remainder ) ) { return "best"; }

      // MLB Stuff
      if ( /^INDSTATS\-FULL/.test( remainder ) ) { return "indivstats"; }
      if ( /^PRESTATS/.test( remainder ) ) { return "indivstats"; }
      if ( /^CARD/.test( remainder ) ) { return "game-card"; }
      if ( /^BOX\-/.test( remainder ) ) { return "boxscore"; }
      if ( /^MATCHUP\-/.test( remainder ) ) {return "matchup"; }
      if ( remainder == "FREE-AGENTS" ) { return "free-agents"; }
      if ( remainder == "DAY-STATS" ) { return "day-game-record"; }

      // Anything else not caught.
      return "misc-stats";
      break;

    case "Y":

    case "Z":

    default:
      return "extra";
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

exports.isPreview = function( remainder ) {
  return /^PREVIEW/.test( remainder );
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
