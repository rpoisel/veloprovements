/* see http://stackoverflow.com/questions/18313576/confirmation-dialog-on-ng-click-angularjs */
angular.module('demoapp').directive('ngConfirmClick', [
    function(){
        return {
            scope: false,
            link: function (scope, element, attr) {
                var msg = attr.ngConfirmClick || "Are you sure?";
                var clickAction = attr.confirmedClick;
                element.bind('click',function (event) {
                    scope.$parent.$parent.closePanel = window.confirm(msg);
                    if (scope.$parent.$parent.closePanel) {
                        scope.$eval(clickAction)
                    }
                });
            }
        };
    }]);
