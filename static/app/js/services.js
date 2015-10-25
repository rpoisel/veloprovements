angular.module('demoapp').factory('AuthService', ['$http', 'Session', function ($http, Session) {
    var authService = {};

    authService.login = function (credentials) {
        return $http
            .post('/dynamic/veloprovements/login', credentials)
            .then(function (res) {
                Session.create(res.data.id, res.data.user.id,
                        res.data.user.role, credentials);
                return res.data.user;
            });
    };

    authService.logout = function() {
        Session.destroy();
    };

    authService.isAuthenticated = function () {
        return !!Session.userId; /* check whether property has been set */
    };

    authService.isAuthorized = function (authorizedRoles) {
        if (!angular.isArray(authorizedRoles)) {
            authorizedRoles = [authorizedRoles];
        }
        return (authService.isAuthenticated() &&
                authorizedRoles.indexOf(Session.userRole) !== -1);
    };

    return authService;
}]);

angular.module("demoapp").service('Session', function () {

    this.create = function (sessionId, userId, userRole, credentials) {
        this.id = sessionId;
        this.userId = userId;
        this.userRole = userRole;
        this.credentials = credentials;
    };
    this.destroy = function () {
        this.id = null;
        this.userId = null;
        this.userRole = null;
        this.credentials = null;
    };
});

angular.module('demoapp').factory('Veloprovements', ['$http', 'Session', function ($http, Session) {
    var veloprovements = {};

    veloprovements.obtain = function(bounds) {
        var queryString = "/dynamic/veloprovements?";
        queryString += "southWestLat=" + bounds.getSouthWest().lat + "&southWestLng=" + bounds.getSouthWest().lng +
            "&northEastLat=" + bounds.getNorthEast().lat + "&northEastLng=" + bounds.getNorthEast().lng;
        return $http.get(queryString)
            .then(function(response) {
                return response.data
            });
    };

    veloprovements.create = function(name, description, geometry) {
        return $http.post("/dynamic/veloprovements", {
            'name': name,
            'description': description,
            'geometry': geometry,
            'username': (Session.credentials ? Session.credentials.username : null),
            'password': (Session.credentials ? Session.credentials.password : null)
            })
            .then(function(response) {
                return response.data;
            }
        );
    };

    veloprovements.remove = function(id) {
        return $http.delete("/dynamic/veloprovements", {
                "params" : {
                    'id': id,
                    'username': (Session.credentials ? Session.credentials.username : null),
                    'password': (Session.credentials ? Session.credentials.password : null)
                }
            }).then(function(response) {
                return response.data;
            });
    };

    return veloprovements;
}]);

angular.module('demoapp').factory('focus', ['$timeout', '$window', function ($timeout, $window) {
    return function(id) {
        $timeout(function() {
            var element = $window.document.getElementById(id);
            if (element) {
                element.focus();
            }
        });
    };
}]);
