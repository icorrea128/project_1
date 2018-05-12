/* eslint-env browser, jquery */
/* global initMap, setPath */

function initResultsPage() { // eslint-disable-line no-unused-vars
  var queryString = window.location.href;
  var argStart = queryString.indexOf('?');
  var argString = queryString.substring(argStart + 1);
  var args = argString.split('&');

  var queryStringVars = {};

  $.each(args, function(_, eachArg) {
    var sep = eachArg.indexOf('=');
    var key = eachArg.substring(0, sep);
    var value = eachArg.substring(sep + 1);

    queryStringVars[key]=value;
  });

  initMap();

  setPath({
    startLat: queryStringVars.startLat,
    startLong: queryStringVars.startLong,
    endLat: queryStringVars.endLat,
    endLong: queryStringVars.endLong,
    time: queryStringVars.time
  });
}
