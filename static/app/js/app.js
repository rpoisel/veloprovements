angular.module("demoapp", ['leaflet-directive', 'angular.panels']);

angular.module('demoapp').config(['panelsProvider', function (panelsProvider) {
    panelsProvider
    .add({
        id: 'createImprovement',
        position: 'left',
        size: '700px',
        templateUrl: '/partials/create_improvement.html',
        controller: 'CreateImprovementCtrl'
    })
    .add({
        id: 'editImprovement',
        position: 'left',
        size: '700px',
        templateUrl: '/partials/edit_improvement.html',
        controller: 'EditImprovementCtrl'
    });
}]);
