angular.module('demoapp').controller("MainController",
        [ "$scope", "$http", "leafletData", "leafletBoundsHelpers", "leafletEvents", 'panels',
        function($scope, $http, leafletData, leafletBoundsHelpers, leafletEvents, panels) {

        leafletData.getMap("veloprovementsmap").then(function(map) {
            map.on('draw:created', function (element) {
                $scope.$broadcast('improvementCreate', element);
            });

            $scope.keyboardAction = function(event) {
                if (panels.opened === undefined /* main view */) {
                    switch(event.keyCode)
                    {
                        case 48: /* 0 */
                            map.setZoom(18);
                            break;
                        case 49: /* 1 */
                            map.setZoom(16);
                            break;
                        case 50: /* 2 */
                            map.setZoom(13);
                            break;
                        case 72: /* h */
                            map.setView({
                                lat: 48.2,
                                lon: 15.63
                            }, 16);
                            break;
                        default:
                            console.log('keyboardAction ' + event.keyCode);
                            break;
                    }
                } else {
                    $scope.$broadcast('keyboardAction', event.keyCode);
                }
            };
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
                leafletData.getGeoJSON().then(function(geoJSON) {
                    if (map.getZoom() < 13) {
                        geoJSON.clearLayers();
                        return;
                    }
                    var queryString = "dynamic/veloprovements?";
                    var bounds = map.getBounds();
                    queryString += "southWestLat=" + bounds.getSouthWest().lat + "&southWestLng=" + bounds.getSouthWest().lng +
                        "&northEastLat=" + bounds.getNorthEast().lat + "&northEastLng=" + bounds.getNorthEast().lng;
                    $http.get(queryString).then(function(response) {
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
                    },
                    googleTerrain: {
                        name: 'Google Terrain',
                        layerType: 'TERRAIN',
                        type: 'google'
                    },
                    googleHybrid: {
                        name: 'Google Hybrid',
                        layerType: 'HYBRID',
                        type: 'google'
                    },
                    googleRoadmap: {
                        name: 'Google Streets',
                        layerType: 'ROADMAP',
                        type: 'google'
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

    $scope.$on('keyboardAction', function(event, keyCode) {
        if (keyCode === 27) {
            panels.close('createImprovement');
        }
    });
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

    $scope.$on('keyboardAction', function(event, keyCode) {
        if (keyCode === 27 /* ESC */) {
            panels.close('editImprovement');
        }
    });
}]);
