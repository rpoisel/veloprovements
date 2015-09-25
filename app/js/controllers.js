angular.module('demoapp').controller("BasicFirstController",
        [ "$scope", "$http", "leafletData", "leafletBoundsHelpers", "leafletEvents",
        function($scope, $http, leafletData, leafletBoundsHelpers, leafletEvents) {

        //console.log(leafletEvents.getAvailableMapEvents());
        leafletData.getMap().then(function(map) {
            leafletData.getLayers().then(function(baselayers) {
                var drawnItems = baselayers.overlays.draw;
                map.on('draw:created', function (e) {
                    console.log($scope);
                    var layer = e.layer;
                    drawnItems.addLayer(layer);
                    $scope.$broadcast('nodeMenuOpen', {});
                    //console.log(JSON.stringify(layer.toGeoJSON()));
                });
            });
        });

        $scope.$on('leafletDirectiveMap.zoomend', function(event) {
            $scope._obtainVeloprovements(event.name);
        });

        $scope.$on('leafletDirectiveMap.dragend', function(event) {
            $scope._obtainVeloprovements(event.name);
        });

        /*
        $scope.$on('leafletDirectiveMap.click', function(event) {
            $scope.$broadcast('nodeMenuOpen', {});
        });
        */

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
            center : {
                lat: 48.2,
                lng: 15.63,
                zoom: 16
            },
            controls : {
                draw : {}
            },
            layers : {
                baselayers: {
                    /*
                    mapbox_light: {
                        name: 'Mapbox Light',
                        url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        type: 'xyz',
                        layerOptions: {
                            apikey: 'pk.eyJ1IjoiYnVmYW51dm9scyIsImEiOiJLSURpX0pnIn0.2_9NrLz1U9bpwMQBhVk97Q',
                            mapid: 'bufanuvols.lia22g09'
                        },
                        layerParams: {
                            showOnSelector: false
                        }
                    }
                    */
                    openCycleMap: {
                        name: 'OpenCycleMap',
                        url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                        type: 'xyz'
                    }
                },
                overlays : {
                    draw: {
                        name: 'draw',
                        type: 'group',
                        visible: true,
                        layerParams: {
                            showOnSelector: false
                        }
                    }
                }
            }
        });
}]);

angular.module('demoapp').controller('nodeMenuCtrl', ['$scope', 'panels', function ($scope, panels) {
    $scope.$on('nodeMenuOpen', function(event, args) {
        panels.open('nodeMenu');
    });
}]);
