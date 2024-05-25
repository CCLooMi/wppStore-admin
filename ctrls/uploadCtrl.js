/**
 * Created by guest on 2024/3/8 18:34:23.
 */
(function(app){
    app.controller('uploadCtrl',['$scope','S_upload','$modal',function(scope,S_upload,$modal){
        scope.uploads=[];
        scope.byPage=function(pg){
            return S_upload.byPage(pg);
        }
        scope.newUpload = function (uploads) {
            S_upload.newUpload().then(function (flist) {
                Atom.broadcastMsg('refreshUploads');
            });
        }
        scope.detail = function (u) {
            $modal.alertDetail('Upload Detail', `<pre>${JSON.stringify(u, ' ', 2)}</pre>`);
        }
        scope.copyFid = function (u) {
            copyTextToClipboard(u.id)
            .then(()=>$modal.toastAlertDetail('Copy Id to Clipboard Success!',u.id),
            e=>$modal.toastAlertDetail('Copy Id to Clipboard Error!',Atom.formatError(e)));
        }
        scope.delUpload = function (u, uploads) {
            S_upload.delUpload(u).then(function (r) {
                if (r === true) {
                    uploads.splice(uploads.indexOf(u), 1);
                }
            });
        }
        scope.fm=function(n){
            return formatFileSize(n);
        }
    }]);
})(Atom.app('wppStore-admin'))