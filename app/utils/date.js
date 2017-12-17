var getDateRangeOfWeek = module.exports.getDateRangeOfWeek = function(weekNo) {
    let d1 = new Date();
    d1.setUTCHours(0); d1.setUTCMinutes(0); d1.setUTCSeconds(0); d1.setUTCMilliseconds(0);
    let numOfdaysPastSinceLastMonday = eval(d1.getDay() - 1);
    d1.setDate(d1.getDate() - numOfdaysPastSinceLastMonday);
    let weekNoToday = getWeek(d1);
    let weeksInTheFuture = eval(weekNo - weekNoToday);
    d1.setDate(d1.getDate() + eval(7 * weeksInTheFuture));
    let d2 = new Date(d1);
    d2.setUTCHours(0); d2.setUTCMinutes(0); d2.setUTCSeconds(0); d2.setUTCMilliseconds(0);
    d2.setDate(d1.getDate() + 6);

    return [d1, d2];
}

// Returns the ISO week of the date.
var getWeek = module.exports.getWeek = function(date) {
  let d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(d.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
}

// Returns the four-digit year corresponding to the ISO week of the date.
var getWeekYear = module.exports.getWeekYear = function(date) {
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  return date.getFullYear();
}

var nonZuluDateTimeToLocalDateTime = module.exports.nonZuluDateTimeToLocalDateTime = function(date) {
  // We have to assume that the caller of this function knows that the
  // given date is indeed in the wrong time zone (i.e. UTC instead of EET).

  let localDate = null;
  if (date instanceof Date) {
    localDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
  } else if (typeof date === 'string') {
    let dateObj = new Date(date);
    localDate = new Date(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), dateObj.getUTCHours(), dateObj.getUTCMinutes(), dateObj.getUTCSeconds());
  } else {
    console.log("nonZuluDateTimeToLocalDateTime(): Not a date string", typeof date);
  }

  return localDate;
}

var zeroPad = module.exports.zeroPad = function(value, length) {
  let str = '' + value;
  while (str.length < length) {
    str = '0' + str;
  }

  return str;
}

var dateToLemonsoftFiDate = module.exports.dateToLemonsoftFiDate = function(date) {
  if (!(date instanceof Date)) {
    return "Not a date (" + (Object.prototype.toString.call(date)) + ")";
  }

  let dateLocaleString =
    date.getFullYear() + '-' +
    zeroPad((date.getMonth()) + 1, 2) + '-' +
    zeroPad(date.getDate(), 2) + 'T' +
    zeroPad(date.getHours(), 2) + ':' +
    zeroPad(date.getMinutes(), 2) + ':' +
    zeroPad(date.getSeconds(), 2);

  console.log("Converted date to:", dateLocaleString);
  return dateLocaleString;
}

var dateTimeString = module.exports.dateTimeString = function(date, noDelim) {
  return date.getFullYear() + (noDelim ? "" : "-") + zeroPad(date.getMonth() + 1, 2) + (noDelim ? "" : "-")
             + zeroPad(date.getDate(), 2) + (noDelim ? "" : " ") + zeroPad(date.getHours(), 2) + (noDelim ? "" : ":")
             + zeroPad(date.getMinutes(), 2) + (noDelim ? "" : ":") + zeroPad(date.getSeconds(), 2) + (noDelim ? "" : ".")
             + zeroPad(date.getMilliseconds(), 3);
}

var dateTimeStamp = module.exports.dateTimeStamp = function(date) {
  return "[" + dateTimeString(date) + "] ";
}
