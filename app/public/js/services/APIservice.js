'use strict';

var module = angular.module('mapApp');

module.factory('apiService', function($http, $location, $q) {
  var apiService = {
    pending: []
  };

  apiService.cancelAll = function() {
    for (var i = 0; i < restService.pending.length; ++i) {
      restService.pending[i].canceller && restService.pending[i].canceller.resolve();
    }
  };

  apiService.get = function(uri, options, cancellable) {
    var canceller = $q.defer();
    if (cancellable !== false) {
      apiService.pending.push({uri: uri, canceller: canceller});
    }
    return $http.get(uri, options).catch(function(err) {
      if ((err.status == 403) || (err.status == 401)) {
        return $q.reject();
      }

      // Handle cancel request timeout
      if (err.config && err.config.timeout && err.config.timeout.$$state && (err.config.timeout.$$state.status == 1)) {
        return $q.reject();
      }
      if (err.status && (err.status === -1)) {
        return $q.reject();
      }
      return $q.reject();
    }).finally(function() {
      var index = -1;
      for (var i = 0; i < apiService.pending.length; ++i) {
        if (apiService.pending[i].uri === uri) {
          index = i;
          break;
        }
      }
      if (index > -1) {
        apiService.pending.splice(index, 1);
      }
    });
  };

  apiService.post = function(uri, data, dontSerialize, uploadNotify, resultNotify) {
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
        return $q.reject(err);
      }
      // Handle server errors
      if ((err.data && err.data.code)) {
        switch (err.data.code) {
          case "ETIMEDOUT":
            return $q.reject("Request to [" + err.data.address + "] timed out calling [" + err.data.syscall + "]");
          break;
        }
      }

      return $q.reject(err);
    });
  };

  apiService.put = function(uri, data) {
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
        return $q.reject(err);
      }
    });
  };

  apiService.delete = function(uri) {
    return $http.delete(uri).catch(function(err) {
      console.log("DELETE error " + err.status + ": " + err.data);
      if ((err.status == 403) || (err.status == 401)) {
        console.log(err);
        return $q.reject(err);
      }
      console.log(err);
      return $q.reject(err);
    });
  };

  return apiService;
});
