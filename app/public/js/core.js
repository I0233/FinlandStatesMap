angular.module('mapApp', ['mapController','ngRoute', 'ngMessages', 'ngAnimate', 'LocalStorageModule'])
.config(function(localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('mapApp')
    .setStorageType('sessionStorage');
})
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: 'index'});
}]);
