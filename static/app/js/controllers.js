angular.module('demoapp').controller("MainController",
        [ "$scope", "$http", "leafletData", "leafletBoundsHelpers", "leafletEvents",
        function($scope, $http, leafletData, leafletBoundsHelpers, leafletEvents) {

        leafletData.getMap("veloprovementsmap").then(function(map) {
            map.on('draw:created', function (element) {
                $scope.$broadcast('improvementCreate', element);
            });
        });

        $scope.$on('improvementCreated', function(event) {
            $scope._obtainVeloprovements(event.name);
        });

        $scope.$on('improvementDeleted', function(event) {
            $scope._obtainVeloprovements(event.name);
        });

        $scope.$on('leafletDirectiveMap.zoomend', function(event) {
            $scope._obtainVeloprovements(event.name);
        });

        $scope.$on('leafletDirectiveMap.dragend', function(event) {
            $scope._obtainVeloprovements(event.name);
        });

        $scope.$on("leafletDirectiveGeoJson.click", function(ev, leafletPayload) {
            $scope.$broadcast('editImprovement', leafletPayload);
        });

        $scope._obtainVeloprovements = function (eventName) {
            leafletData.getMap("veloprovementsmap").then(function(map){
                var queryString = "dynamic/veloprovements?";
                var bounds = map.getBounds();
                queryString += "southWestLat=" + bounds.getSouthWest().lat + "&southWestLng=" + bounds.getSouthWest().lng +
                    "&northEastLat=" + bounds.getNorthEast().lat + "&northEastLng=" + bounds.getNorthEast().lng;
                $http.get(queryString).then(function(response) {
                        leafletData.getGeoJSON().then(function(geoJSON) {
                            geoJSON.clearLayers();
                            geoJSON.addData(response.data);
                        });
                    });
            });
        };

        angular.extend($scope, {
            bounds : {
            },
            center : {
                lat: 48.2,
                lng: 15.63,
                zoom: 16
            },
            controls : {
                draw : {
                    draw: {
                        circle: false
                    }
                }
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
        leafletData.getGeoJSON().then(function(geoJSON) {
            /* just in case */
        });
        $scope.newVeloprovement = element.layer.toGeoJSON();
        panels.open('createImprovement');
    });

    $scope.saveImprovement = function() {
        $http.post("dynamic/veloprovements",
                {
                    'geometry': $scope.newVeloprovement.geometry
                }).then(function(response) {
            $scope.$emit('improvementCreated');
        });
        panels.close("createImprovement");
    }
}]);

angular.module('demoapp').controller('EditImprovementCtrl',
                ['$scope', 'panels', '$http', 'leafletData',
        function ($scope, panels, $http, leafletData) {
    $scope.$on('editImprovement', function(event, leafletPayload) {
        $scope.editId = leafletPayload.model.properties.id;
        $scope.improvementName = leafletPayload.model.properties.name;
        panels.open('editImprovement');
    });
    $scope.deleteImprovement = function() {
        $http.delete("dynamic/veloprovements", {
                "params" : {
                    'id': $scope.editId
                }
            }).then(function(response) {
                $scope.$emit('improvementDeleted');
        });
        panels.close("editImprovement");
    }
}]);
