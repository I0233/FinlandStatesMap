'use strict';

var module = angular.module('mapApp');

module.factory('apiService', function($http, $location, $q) {
  var apiService = {};

  apiService.get = function(uri) {
    return $http.get(uri, options).catch(function(err) {
      if ((err.status == 403) || (err.status == 401)) {
        $location.path('logoff');
        console.log(err);
      }
    });
  };

  restService.post = function(uri, data, dontSerialize, uploadNotify, resultNotify) {
    angular.element('.loader').remove();
    let loader = angular.element('<div class="loader"><span class="glyphicon small animate-show-hide glyphicon-refresh spinning m-0 p-0"></span></div>');
    angular.element(document).find('body').append(loader);
    var options = {
      data: data,
      url: uri,
      method: 'POST'
    };
    if (dontSerialize === true) {
      options.headers = {'Content-Type': undefined};
      options.transformRequest = angular.identity;
    }
    if (uploadNotify) {
      options.uploadEventHandlers = {
        progress: uploadNotify
      };
    }
    if (resultNotify) {
      options.eventHandlers = {
        progress: resultNotify
      };
    }
    return $http(options).then(function(result) {
      angular.element('.loader').remove();
      return result;
    }).catch(function(err) {
      angular.element('.loader').remove();
      console.log("POSTing file error " + err.status + ": " + JSON.stringify(err.data));
      if ((err.status == 403) || (err.status == 401)) {
        console.log(err);
      }
      // Handle server errors
      if ((err.data && err.data.code)) {
        switch (err.data.code) {
          case "ETIMEDOUT":
            throw ("Request to [" + err.data.address + "] timed out calling [" + err.data.syscall + "]");
          break;
        }
      }
    });
  };

  restService.put = function(uri, data) {
    angular.element('.loader').remove();
    let loader = angular.element('<div class="loader"><span class="glyphicon small animate-show-hide glyphicon-refresh spinning m-0 p-0"></span></div>');
    angular.element(document).find('body').append(loader);

    return $http.put(uri, data).then(function(result) {
      angular.element('.loader').remove();
      return result;
    }).catch(function(err) {
      angular.element('.loader').remove();
      console.log("PUT error " + err.status + ": " + err.data);
      if ((err.status == 403) || (err.status == 401)) {
        $location.path('logoff');
        console.log(err);
      }
    });
  };

  restService.delete = function(uri) {
    return $http.delete(uri).catch(function(err) {
      console.log("DELETE error " + err.status + ": " + err.data);
      if ((err.status == 403) || (err.status == 401)) {
        $location.path('logoff');
        console.log(err);
      }
      console.log(err);
    });
  };

  return apiService;
});
