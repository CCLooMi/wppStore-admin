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
        scope.iconUrl = function (w) {
            let fid = w.manifest.iconFid;
            if (fid) {
                return app.getFileUrl(w.manifest.iconFid);
            }
            return '/images/icns/NotLoaded.png';
        }
        scope.iconType = function (w) {
            return w.manifest.iconType || 'image/png';
        }
        scope.selectWpps={};
        scope.selectList=[];
        const ovKey = Symbol('ov');
        scope.onChange = function (e) {
            const tg = e.target;
            const ov = tg[ovKey];
            const nv = tg.ccValue;
            try {
                if (ov && !nv) {
                    delete scope.selectWpps[ov.id];
                    return;
                }
                if (nv && !ov) {
                    scope.selectWpps[nv.id]=nv;
                    return;
                }
            } finally {
                tg[ovKey] = nv;
                scope.selectList=Object.values(scope.selectWpps);
            }
        }
        scope.checkSelect=function (ele,w){
            let v=scope.selectWpps[w.id];
            if(v){
                scope.selectWpps[w.id]=w;
                ele.ccValue=w;
                ele.checked=true;
                ele[ovKey]=w;
            }
        }
    }]);
})(Atom.app('wppStore-admin'))