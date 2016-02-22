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
  'ngClipboard',
  'angularytics'
])
  .config(function ($routeProvider, $locationProvider, markedProvider, ngClipProvider, AngularyticsProvider) {
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

    // AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);
    AngularyticsProvider.setEventHandlers(['GoogleUniversal']);

  }).run(function(Angularytics) {
    Angularytics.init();
  });
