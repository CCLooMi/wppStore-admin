/**
 * Created by Guest on 2024/5/12 13:58:07.
 */
(function (app) {
    app.controller('wppCtrl', ['$scope', 'S_wpp', '$modal', function (scope, S_wpp, $modal) {
        scope.wpps = [];
        scope.byPage = function (pg) {
            return S_wpp.byPage(pg);
        }
        scope.detail = function (u) {
            $modal.alertDetail('Wpp Detail', `<pre>${JSON.stringify(u, ' ', 2)}</pre>`).width(768);
        }
        scope.iconUrl=function(w){
            let fid=w.manifest.iconFid;
            if(fid){
                return app.getFileUrl(w.manifest.iconFid);
            }
            return '/images/icns/NotLoaded.png';
        }
        scope.iconType=function(w){
            return w.manifest.iconType||'image/png';
        }
    }]);
})(Atom.app('wppStore-admin'))