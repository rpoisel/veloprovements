angular.module('demoapp').controller("MainController",
        [ "$scope",
            "leafletData", "leafletBoundsHelpers", "leafletEvents",
            'panels', "AuthService", 'Veloprovements',
            "KEYS", "DEFAULT", "APP_EVENTS", "USER_ROLES",
        function($scope, leafletData, leafletBoundsHelpers, leafletEvents, panels, AuthService, Veloprovements, KEYS, DEFAULT, APP_EVENTS, USER_ROLES) {

        $scope.closePanel = true;
        $scope.currentUser = null;
        $scope.userRoles = USER_ROLES;
        $scope.isAuthorized = AuthService.isAuthorized;
        $scope.isAuthenticated = AuthService.isAuthenticated;

        $scope.setCurrentUser = function(user) {
            $scope.currentUser = user;
        };

        leafletData.getMap("veloprovementsmap").then(function(map) {
            map.on('draw:created', function (element) {
                $scope.$broadcast(APP_EVENTS.CREATE, element);
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
                            $scope._populateVeloprovements('home');
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

        $scope.$on(APP_EVENTS.CREATED, function(event) {
            $scope._populateVeloprovements(event.name);
        });

        $scope.$on(APP_EVENTS.DELETED, function(event) {
            $scope._populateVeloprovements(event.name);
        });

        $scope.$on('leafletDirectiveMap.zoomend', function(event) {
            $scope._populateVeloprovements(event.name);
        });

        $scope.$on('leafletDirectiveMap.dragend', function(event) {
            $scope._populateVeloprovements(event.name);
        });

        $scope.$on("leafletDirectiveGeoJson.click", function(ev, leafletPayload) {
            $scope.$broadcast(APP_EVENTS.EDIT, leafletPayload);
        });

        $scope._populateVeloprovements = function (eventName) {
            leafletData.getMap("veloprovementsmap").then(function(map){
                leafletData.getGeoJSON().then(function(geoJSON) {
                    if (map.getZoom() < DEFAULT.NOPOINTSZOOM) {
                        geoJSON.clearLayers();
                        return;
                    }
                    Veloprovements.obtain(map.getBounds())
                        .then(function(veloprovements) {
                            geoJSON.clearLayers();
                            geoJSON.addData(veloprovements);
                        });
                });
            });
        };

        $scope.openLoginPanel = function() {
            $scope.$broadcast(APP_EVENTS.LOGIN);
        };

        $scope.logout = function() {
            AuthService.logout();
        }

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
                ['$scope', 'panels', 'leafletData', 'APP_EVENTS', 'Veloprovements',
        function ($scope, panels, leafletData, APP_EVENTS, Veloprovements) {
    $scope.$on(APP_EVENTS.CREATE, function(event, element) {
        leafletData.getGeoJSON().then(function(geoJSON) {
            /* just in case */
        });
        $scope.newVeloprovement = element.layer.toGeoJSON();
        $scope.name = '';
        $scope.description = '';
        panels.open('createImprovement');
    });

    $scope.saveImprovement = function() {
        Veloprovements.create($scope.name, $scope.description, $scope.newVeloprovement.geometry)
            .then(function(response) {
                $scope.$emit(APP_EVENTS.CREATED);
            });
        panels.close();
    };
}]);

angular.module('demoapp').controller('EditImprovementCtrl',
                ['$scope', '$rootScope', 'panels', 'leafletData', 'APP_EVENTS', 'Veloprovements',
        function ($scope, $rootScope, panels, leafletData, APP_EVENTS, Veloprovements) {
    $scope.$on(APP_EVENTS.EDIT, function(event, leafletPayload) {
        $scope.editId = leafletPayload.model.properties.id;
        $scope.name = leafletPayload.model.properties.name;
        $scope.description = leafletPayload.model.properties.description;
        panels.open('editImprovement');
    });

    $scope.deleteImprovement = function() {
        Veloprovements.remove($scope.editId)
            .then(function(response) {
                $scope.$emit(APP_EVENTS.DELETED);
            });
        panels.close();
    }

    $scope.isAuthorized = $scope.$parent.$parent.isAuthorized;
    $scope.isAuthenticated = $scope.$parent.$parent.isAuthenticated;
}]);

angular.module('demoapp').controller('LoginCtrl',
                ['$scope', '$rootScope', 'panels', 'leafletData', 'AuthService', 'APP_EVENTS', 'AUTH_EVENTS',
        function ($scope, $rootScope, panels, leafletData, AuthService, APP_EVENTS, AUTH_EVENTS) {
    $scope.credentials = {
        username: '',
        password: ''
    };

    $scope.login = function(credentials) {
        AuthService.login(credentials).then(function (user) {
            $scope.$parent.$parent.setCurrentUser(user);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            $scope.credentials = {
                username: '',
                password: ''
            };
            panels.close();
        }, function () {
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            /* show error message in panel */
        });
    };

    $scope.$on(APP_EVENTS.LOGIN, function(event) {
        panels.open('login');
    });

    $scope.isAuthorized = $scope.$parent.$parent.isAuthorized;
    $scope.isAuthenticated = $scope.$parent.$parent.isAuthenticated;
}]);
