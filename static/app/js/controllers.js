angular.module('demoapp').controller("MainController",
        [ "$scope", "$http", "leafletData", "leafletBoundsHelpers", "leafletEvents", 'panels', "KEYS", "DEFAULT",
        function($scope, $http, leafletData, leafletBoundsHelpers, leafletEvents, panels, KEYS, DEFAULT) {

        $scope.closePanel = true;

        leafletData.getMap("veloprovementsmap").then(function(map) {
            map.on('draw:created', function (element) {
                $scope.$broadcast('improvementCreate', element);
            });

            $scope.keyboardAction = function(event) {
                if (panels.opened === undefined /* main view */) {
                    switch(event.keyCode)
                    {
                        case KEYS.ZOOM18:
                            map.setZoom(18);
                            break;
                        case KEYS.ZOOM16:
                            map.setZoom(16);
                            break;
                        case KEYS.ZOOM13:
                            map.setZoom(13);
                            break;
                        case KEYS.HOME:
                            map.setView({
                                lat: DEFAULT.LAT,
                                lon: DEFAULT.LNG,
                            }, DEFAULT.ZOOM);
                            $scope._obtainVeloprovements('home');
                            break;
                        default:
                            break;
                    }
                } else {
                    switch(event.keyCode)
                    {
                        case KEYS.ABORT:
                            if ($scope.closePanel) {
                                panels.close();
                            } else {
                                $scope.closePanel = true;
                            }
                            break;
                        default:
                            break;
                    }
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
                    if (map.getZoom() < DEFAULT.NOPOINTSZOOM) {
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
                lat: DEFAULT.LAT,
                lng: DEFAULT.LNG,
                zoom: DEFAULT.ZOOM
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
                        layerParams: {
                            attribution: '&copy;&nbsp;<a href="http://www.openstreetmap.org/copyright">OpenStreetMap-Mitwirkende</a>,&nbsp;Tiles courtesy of&nbsp;<a href="http://www.thunderforst.com/" target="_blank">Andy Allen</a>'
                        },
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
                    },
                    basemapAt: {
                        name: 'Basemap Standard',
                        url: 'http://maps{s}.wien.gv.at/basemap/geolandbasemap/normal/google3857/{z}/{y}/{x}.png',
                        layerParams: {
                            subdomains: '1234',
                            attribution: '<a href="http://www.basemap.at">basemap.at</a>'
                        },
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
        $scope.name = '';
        $scope.description = '';
        panels.open('createImprovement');
    });

    $scope.saveImprovement = function() {
        $http.post("dynamic/veloprovements",
                {
                    'name': $scope.name,
                    'description': $scope.description,
                    'geometry': $scope.newVeloprovement.geometry
                }).then(function(response) {
            $scope.$emit('improvementCreated');
        });
        panels.close();
    }
}]);

angular.module('demoapp').controller('EditImprovementCtrl',
                ['$scope', '$rootScope', 'panels', '$http', 'leafletData',
        function ($scope, $rootScope, panels, $http, leafletData) {
    $scope.$on('editImprovement', function(event, leafletPayload) {
        $scope.editId = leafletPayload.model.properties.id;
        $scope.name = leafletPayload.model.properties.name;
        $scope.description = leafletPayload.model.properties.description;
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
        panels.close();
    }
}]);
