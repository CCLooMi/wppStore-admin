/**
 * Created by Guest on 2024/5/12 13:58:07.
 */
(function(app){
    app.controller('wppCtrl',['$scope','S_wpp','$modal',function(scope,S_wpp,$modal){
        scope.wpps=[];
        scope.byPage=function(pg){
            return S_wpp.byPage(pg);
        }
        scope.newWpp = function (wpps) {
            S_wpp.newWpp().then(function (newWpp) {
                if (newWpp) {
                    wpps.push(newWpp);
                }
            });
        }
        scope.detail = function (u) {
            $modal.alertDetail('Wpp Detail', `<pre>${JSON.stringify(u, ' ', 2)}</pre>`);
        }
        scope.editWpp = function (u) {
            S_wpp.editWpp(u);
        }
        scope.delWpp = function (u, wpps) {
            S_wpp.delWpp(u).then(function (r) {
                if (r === true) {
                    wpps.splice(wpps.indexOf(u), 1);
                }
            });
        }
    }]);
})(Atom.app('wppStore-admin'))