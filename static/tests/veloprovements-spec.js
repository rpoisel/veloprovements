var https = require('https');

var baseUrl = 'https://lamaquina';

var httpsGet = function (siteUrl) {
    var defer = protractor.promise.defer();

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    https.get(siteUrl, function(response) {

        var bodyString = '';

        response.setEncoding('utf8');

        response.on("data", function(chunk) {
            bodyString += chunk;
        });

        response.on('end', function() {
            defer.fulfill({
                statusCode: response.statusCode,
                bodyString: bodyString
            });
        });

    }).on('error', function(e) {
        defer.reject("Got https.get error: " + e.message);
    });

    return defer.promise;
};

function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
}

describe('veloprovements', function() {
    var loginAsTestUser = function(userAction, login_username, login_password, login_submit) {
        var defer = protractor.promise.defer();

        var userAction = element(by.id('userAction'));
        var login_username = element(by.id('login_username'));
        var login_password = element(by.id('login_password'));
        var login_submit = element(by.id('login_submit'));

        userAction.click().then(function() {
            login_username.sendKeys('test');
            login_password.sendKeys('test');
            login_submit.click();
            waitForPanel();
            defer.fulfill();
        });

        return defer.promise;
    };

    var drawPoint = function(map, x, y, name, description) {
        var defer = protractor.promise.defer();

        var drawMarker = element(by.css('.leaflet-draw-draw-marker'));
        var elemName = element(by.id('createVeloprovementName'));
        var elemDescription = element(by.id('createVeloprovementDescription'));
        var elemSubmit = element(by.id('createVeloprovementSubmit'));

        drawMarker.click().then(function() {
            browser.actions().mouseMove(map, {x: x, y: y}) .click().perform();
            waitForPanel();
            elemName.sendKeys(name);
            elemDescription.sendKeys(description);
            elemSubmit.click();
            waitForPanel();
            defer.fulfill();
        });

        return defer.promise;
    };

    var waitForPanel = function() {
        browser.driver.sleep(500);
    };

    it('should have the correct title', function() {
        browser.get(baseUrl);

        expect(browser.getTitle()).toEqual('Veloprovements');
    });

    it('create veloprovement as test user', function(done) {

        var flow = protractor.promise.controlFlow();
        var numPoints = 10;
        var map = element(by.id('veloprovementsmap'));
        var lenBefore = 0, lenAfter = 0;
        var geoQueryUrl = baseUrl + '/dynamic/veloprovements?southWestLat=48.19348500446728&southWestLng=15.616292953491211&northEastLat=48.20651434072251&northEastLng=15.643694400787352';

        var drawRandomPoint = function() {
            map.getSize().then(function(boundingBox) {
                drawPoint(map, getRandomArbitrary(50, boundingBox.width), getRandomArbitrary(50, boundingBox.height), 'Protractor', 'was here');
            });
        };

        var determineLenBefore = function() {
            httpsGet(geoQueryUrl).then(function(result) {
                lenBefore = JSON.parse(result.bodyString).features.length;
            });
        };

        var determineLenAfter = function() {
            httpsGet(geoQueryUrl).then(function(result) {
                lenAfter = JSON.parse(result.bodyString).features.length;
                expect(lenAfter).toEqual(lenBefore + numPoints);
                done();
            });
        };

        flow.execute(determineLenBefore);
        flow.execute(loginAsTestUser);
        for (var i = 0; i < numPoints; i++) {
            flow.execute(drawRandomPoint);
        }
        flow.execute(determineLenAfter);
    });
});

