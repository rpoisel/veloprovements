angular.module('demoapp').controller("MainController",
        [ "$scope", "$http", "leafletData", "leafletBoundsHelpers", "leafletEvents",
        function($scope, $http, leafletData, leafletBoundsHelpers, leafletEvents) {

        //console.log(leafletEvents.getAvailableMapEvents());
        leafletData.getMap().then(function(map) {
            map.on('draw:created', function (element) {
                $scope.$broadcast('improvementCreate', element);
            });
        });

        $scope.$on('improvementCreated', function(event) {
            $scope._obtainVeloprovements(event.name);
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

        $scope._obtainVeloprovements = function (eventName, args) {
            var queryString = "dynamic/veloprovements?";
            if (args instanceof Object) {
                queryString += "southWestLat=" + args.southWest.lat + "&southWestLng=" + args.southWest.lng +
                    "&northEastLat=" + args.northEast.lat + "&northEastLng=" + args.northEast.lng;
            } else {
                queryString += "southWestLat=" + $scope.bounds.southWest.lat + "&southWestLng=" + $scope.bounds.southWest.lng +
                    "&northEastLat=" + $scope.bounds.northEast.lat + "&northEastLng=" + $scope.bounds.northEast.lng;
            }

            $http.get(queryString).then(function(response) {
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
                    lat:48.19315601016896,
                    lng: 15.609233379364012
                },
                northEast: {
                    lat:48.20684324924357,
                    lng:15.650753974914549
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
                ['$scope', 'panels', '$http', 'leafletData',
        function ($scope, panels, $http, leafletData) {
    $scope.$on('improvementCreate', function(event, element) {
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
            /*
            geoJSON.addData(element.layer.toGeoJSON());
            */
        });
        $scope.newVeloprovement = element.layer.toGeoJSON();
        panels.open('createImprovement');
    });

    $scope.saveImprovement = function() {
        //console.log("Storing new veloprovement: " + JSON.stringify($scope.newVeloprovement.geometry));
        $http.post("dynamic/veloprovements",
                {
                    'geometry': $scope.newVeloprovement.geometry
                });
        panels.close("createImprovement");
        $scope.$emit('improvementCreated');
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
