const dateUtils = require('./date');
var consoleLog = console.log;

var logWithTimestamp = module.exports.logWithTimestamp = function() {
  var text = arguments[0];
  var params = Array.prototype.slice.call(arguments, 1);
  consoleLog.apply(console, [dateUtils.dateTimeStamp(new Date()) + text].concat(params));
}
