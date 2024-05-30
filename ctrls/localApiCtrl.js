/**
 * Created by Guest on 2024/5/29 20:34:19.
 */
(function(app){
    app.controller('localApiCtrl',['$scope','S_localApi','$modal',function(scope,S_localApi,$modal){
        scope.localApis=[];
        const status = ["🟢正常","🟡异常","🔴离线"]
        scope.statusEmoji=function (i){
            return status[i]||"❓未知";
        }
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
        scope.delLocalApi = function (u) {
            S_localApi.delLocalApi(u);
        }
        scope.reloadLocalApi = function (u){
            S_localApi.reloadLocalApi(u);
        }
        scope.setStatus=function (u){
            S_localApi.setStatus(u,status);
        }
    }]);
})(Atom.app('wppStore-admin'))