/**
 * Created by guest on 2024/1/19 10:35:41.
 */
(function(app){
    app.controller('apiCtrl',['$scope','S_api','$modal',function(scope,S_api,$modal){
        scope.apis=[];
        scope.byPage=function(pg){
            return S_api.byPage(pg);
        }
        scope.newApi = function (apis) {
            S_api.newApi().then(function (newApi) {
                if (newApi) {
                    apis.push(newApi);
                }
            });
        }
        scope.detail = function (u) {
            $modal.alertDetail('Api Detail', `<pre>${JSON.stringify(u, ' ', 2)}</pre>`);
        }
        scope.editApi = function (u) {
            S_api.editApi(u);
        }
        scope.delApi = function (u, apis) {
            S_api.delApi(u).then(function (r) {
                if (r === true) {
                    apis.splice(apis.indexOf(u), 1);
                }
            });
        }
    }]);
})(Atom.app('wppStore-admin'))