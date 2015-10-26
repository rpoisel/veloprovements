var https = require('https');

var loginAsTestUser = function() {
    var userAction = element(by.id('userAction'));
    var login_username = element(by.id('login_username'));
    var login_password = element(by.id('login_password'));
    var login_submit = element(by.id('login_submit'));

    return userAction.click().then(function() {
            login_username.sendKeys('test');
            login_password.sendKeys('test');
            login_submit.click()
    });
};

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

describe('veloprovements', function() {
    it('should have the correct title', function() {
        browser.get('https://lamaquina');

        expect(browser.getTitle()).toEqual('Veloprovements');
    });

    it('create veloprovement as test user', function(done) {

        var map = element(by.id('veloprovementsmap'));
        var drawMarker = element(by.css('.leaflet-draw-draw-marker'));
        var createVeloprovementName = element(by.id('createVeloprovementName'));
        var createVeloprovementDescription = element(by.id('createVeloprovementDescription'));
        var createVeloprovementSubmit = element(by.id('createVeloprovementSubmit'));
        var lenBefore = 0, lenAfter = 0;
        var geoQueryUrl = 'https://lamaquina/dynamic/veloprovements?southWestLat=48.19348500446728&southWestLng=15.616292953491211&northEastLat=48.20651434072251&northEastLng=15.643694400787352';

        httpsGet(geoQueryUrl).then(function(result) {
            lenBefore = JSON.parse(result.bodyString).features.length;
            loginAsTestUser().then(function() {
                    browser.driver.sleep(500); /* wait for panel to disappear */
                    drawMarker.click();
                    browser.actions().mouseMove(map, {x: 300, y: 300}) .click().perform();
                    browser.driver.sleep(500);
                    createVeloprovementName.sendKeys('Protractor');
                    createVeloprovementDescription.sendKeys('was here');
                    createVeloprovementSubmit.click().then(function() {
                        httpsGet(geoQueryUrl).then(function(result) {
                            lenAfter = JSON.parse(result.bodyString).features.length;
                            expect(lenAfter).toEqual(lenBefore + 1);
                            done();
                        });
                    });
                });
        });

    });
});

