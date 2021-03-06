angular.module("demoapp", ['leaflet-directive', 'angular.panels']);

angular.module('demoapp').constant("KEYS", {
    "ABORT"     : 27 /* ESC */,
    "HOME"      : 72 /* h */ ,
    "ZOOM18"    : 48 /* 0 */,
    "ZOOM16"    : 49 /* 1 */,
    "ZOOM13"    : 50 /* 2 */
});

angular.module('demoapp').constant("DEFAULT", {
    "ZOOM": 16,
    "LAT": 48.2,
    "LNG": 15.63,
    "NOPOINTSZOOM": 13
});

angular.module('demoapp').constant("APP_EVENTS", {
    "CREATE": "veloCreate",
    "CREATED": "veloCreated",
    "EDIT": "veloEdit",
    "DELETED": "veloDeleted",
    "LOGIN": 'veloLogin'
});

angular.module('demoapp').constant("USER_ROLES", {
    all: '*',
    admin: 'admin',
    editor: 'editor',
    guest: 'guest'
});

angular.module("demoapp").constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
})

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
    })
    .add({
        id: 'login',
        position: 'left',
        size: '700px',
        templateUrl: '/partials/login.html',
        controller: 'LoginCtrl'
    });
}]);
