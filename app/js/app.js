angular.module("demoapp", ['leaflet-directive', 'angular.panels']);

angular.module('demoapp').config(['panelsProvider', function (panelsProvider) {
    panelsProvider
    .add({
        id: 'nodeMenu',
        position: 'left',
        size: '700px',
        templateUrl: '/partials/node_menu.html',
        controller: 'nodeMenuCtrl'
    });
}]);
