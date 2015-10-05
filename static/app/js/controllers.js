angular.module('demoapp').controller("MainController",
        [ "$scope", "$http", "leafletData", "leafletBoundsHelpers", "leafletEvents",
        function($scope, $http, leafletData, leafletBoundsHelpers, leafletEvents) {

        //console.log(leafletEvents.getAvailableMapEvents());
        leafletData.getMap().then(function(map) {
            map.on('draw:created', function (element) {
                $scope.$broadcast('improvementCreated', element);
            });
        });

        $scope.$on('leafletDirectiveMap.zoomend', function(event) {
            $scope._obtainVeloprovements(event.name);
        });

        $scope.$on('leafletDirectiveMap.dragend', function(event) {
            $scope._obtainVeloprovements(event.name);
        });

        $scope.$on('leafletDirectiveMap.click', function(event) {
            /*
            $scope.$broadcast('editImprovement', {});
            */
        });

        $scope.$on("leafletDirectiveGeoJson.click", function(ev, leafletPayload) {
            /*
            console.log(leafletPayload.leafletObject.feature);
            console.log(leafletPayload.leafletEvent);
            */
            $scope.$broadcast('editImprovement', leafletPayload);
            //console.log("GeoJSON feature selected");
        });

        $scope._obtainVeloprovements = function (eventName) {
            $http.get("dynamic/veloprovements" +
                    "?" +
                    "southWestLat=" + $scope.bounds.southWest.lat + "&southWestLng=" + $scope.bounds.southWest.lng +
                    "&northEastLat=" + $scope.bounds.northEast.lat + "&northEastLng=" + $scope.bounds.northEast.lng)
                .then(function(response) {
                    leafletData.getGeoJSON().then(function(geoJSON) {
                        /*
                        console.log(geoJSON);
                        geoJSON.clearLayers();
                        */
                        /* TODO add improvemenet to database */
                        geoJSON.clearLayers();
                        geoJSON.addData(response.data);
                    });
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
                    },
                    improvements: {
                        name: 'improvements',
                        type: 'group',
                        visible: true,
                        layerParams: {
                            showOnSelector: false
                        }
                    }
                }
            },
            geojson: {
                data: {
                    "type":"FeatureCollection",
                    "features": []
                },
                //style: style,
                resetStyleOnMouseout: true
            }
        });
}]);

angular.module('demoapp').controller('CreateImprovementCtrl',
                ['$scope', 'panels', 'leafletData',
        function ($scope, panels, leafletData) {
    $scope.$on('improvementCreated', function(event, element) {
        /*
        leafletData.getLayers().then(function(baselayers) {
            var improvements = baselayers.overlays.improvements;
            var layer = element.layer;
            improvements.addLayer(layer);
            console.log(JSON.stringify(layer.toGeoJSON()));
            $scope.improvementType = layer.toGeoJSON().geometry.type;
            panels.open('createImprovement');
        });
        */
        leafletData.getGeoJSON().then(function(geoJSON) {
            /* TODO add improvemenet to database */
            geoJSON.addData(element.layer.toGeoJSON());
            console.log(JSON.stringify(element.layer.toGeoJSON().geometry));
            panels.open('createImprovement');
        });
    });
    $scope.saveImprovement = function() {
        panels.close("createImprovement");
    }
}]);

angular.module('demoapp').controller('EditImprovementCtrl',
                ['$scope', 'panels', 'leafletData',
        function ($scope, panels, leafletData) {
    $scope.$on('editImprovement', function(event, leafletPayload) {
        $scope.improvementName = leafletPayload.model.properties.name;
        panels.open('editImprovement');
    });
}]);
