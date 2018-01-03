var router = require('express').Router();
var dateUtils = require('../utils/date');
const https = require('https');

module.exports = function(app) {
  /**
   * Prevent caching for GET requests
   */
  app.use(function noCache(req, res, next) {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    next();
  });

  // application -------------------------------------------------------------
  app.get('*', function (req, res) {
      res.sendFile(appRoot + '/app/public/index.html');
  });
};
