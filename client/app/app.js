'use strict';

angular.module('zotermiteApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'hc.marked',
  'ui.codemirror'
])
  .config(function ($routeProvider, $locationProvider, markedProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);

    markedProvider.setOptions({
      gfm: true,
      tables: true
    });
  });
