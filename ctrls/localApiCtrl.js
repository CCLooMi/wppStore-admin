/**
 * Created by Guest on 2024/5/29 20:34:19.
 */
(function(app){
    app.controller('localApiCtrl',['$scope','S_localApi','$modal',function(scope,S_localApi,$modal){
        scope.localApis=[];
        scope.byPage=function(pg){
            return S_localApi.byPage(pg);
        }
        scope.newLocalApi = function (localApis) {
            S_localApi.newLocalApi().then(function (newLocalApi) {
                if (newLocalApi) {
                    localApis.push(newLocalApi);
                }
            });
        }
        scope.detail = function (u) {
            $modal.alertDetail('LocalApi Detail', `<pre>${JSON.stringify(u, ' ', 2)}</pre>`);
        }
        scope.editLocalApi = function (u) {
            S_localApi.editLocalApi(u);
        }
        scope.delLocalApi = function (u, localApis) {
            S_localApi.delLocalApi(u).then(function (r) {
                if (r === true) {
                    localApis.splice(localApis.indexOf(u), 1);
                }
            });
        }
    }]);
})(Atom.app('wppStore-admin'))