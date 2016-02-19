'use strict';

angular.module('zotermiteApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'hc.marked',
  'ui.codemirror',
  'angularFileUpload',
  'angulike',
  'ngClipboard'
])
  .config(function ($routeProvider, $locationProvider, markedProvider, ngClipProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);

    markedProvider.setOptions({
      gfm: true,
      tables: true,
      breaks : true
    });

    ngClipProvider.setPath("bower_components/zeroclipboard/dist/ZeroClipboard.swf");
  });
