angular.module('demoapp').controller("BasicFirstController",
        [ "$scope", "$http", "leafletData", "leafletBoundsHelpers", "leafletEvents",
        function($scope, $http, leafletData, leafletBoundsHelpers, leafletEvents) {

        //console.log(leafletEvents.getAvailableMapEvents());

        $scope.$on('leafletDirectiveMap.zoomend', function(event) {
            $scope._obtainVeloprovements(event.name);
        });

        $scope.$on('leafletDirectiveMap.dragend', function(event) {
            $scope._obtainVeloprovements(event.name);
        });

        $scope.$on('leafletDirectiveMap.click', function(event) {
            $scope.$broadcast('nodeMenuOpen', {});
        });

        $scope._obtainVeloprovements = function (eventName) {
            $http.get("js/data.js?" +
                    "southWestLat=" + $scope.bounds.southWest.lat + "&southWestLng=" + $scope.bounds.southWest.lng +
                    "northEastLat=" + $scope.bounds.northEast.lat + "&northEastLng=" + $scope.bounds.northEast.lng)
                .then(function(response) {
                    console.log(response.data);
                });
        };

        angular.extend($scope, {
            bounds : {
                southWest: {
                    lat:51.508742458803326,
                    lng: -0.087890625,
                },
                northEast: {
                    lat:51.508742458803326,
                    lng:-0.087890625,
                }
            },
            center : {}
        });
}]);

angular.module('demoapp').controller('nodeMenuCtrl', ['$scope', 'panels', function ($scope, panels) {
    $scope.$on('nodeMenuOpen', function(event, args) {
        panels.open('nodeMenu');
    });
}]);
