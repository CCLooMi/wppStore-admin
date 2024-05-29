/**
 * Created by guest on 2024/3/8 18:34:23.
 */
(function (app) {
    app.factory('S_upload', ['$idb', '$modal', '$http', function ($idb, $modal, $http) {
        function getDB() {
            return $idb.get(app.idbName);
        }
        return {
            byPage: function (pg) {
                if (app.useMysql) {
                    return $http.post(app.getApiUrl('/upload/byPage'))
                        .responseJson()
                        .jsonData(pg)
                        .then(rsp => {
                            const data = rsp.response;
                            if (data[0] || !data[1]) {
                                return [];
                            }
                            return data[1];
                        });
                }
                const db = getDB();
                return db.byPage("upload", pg);
            },
            newUpload: function () {
                const flist=[];
                function newProgress(f){
                    flist.push(f);
                    var li = document.createElement('li');
                    var label = document.createElement('label');
                    var progress = document.createElement('progress');
                    var btn = document.createElement('a');
                    btn.addClass('btn');
                    btn.innerHTML='X';
                    label.textContent = `${f.name}[${f.formatSize}]`;
                    li.append(label, progress, btn);
                    f.progress=function(p){
                        p.applyTo(progress);
                        if(p.progress==1&&p.type==='upload'){
                            progress.remove();
                        }
                    }
                    var dsp=attacheEvent(btn)
                    .on('click',e=>{
                        e.stopPropagation();
                        dsp(),li.remove(),f.remove();
                        flist.splice(flist.indexOf(f),1);
                    })
                    .getDispose();
                    if(f.type.startsWith("image")){
                        li.style.backgroundImage=`url(${URL.createObjectURL(f)})`;
                        li.style.backgroundPosition='right center';
                        li.style.backgroundSize='contain';
                        li.style.backgroundRepeat='no-repeat';
                    }
                    return li;
                }
                return new Promise(function (resolve, reject) {
                    const scope = {
                        fileSelect:function (fs){
                            var lis=fs.map(f=>newProgress(f));
                            this.append(...lis);
                        },onComplete:function(){
                            console.log(arguments);
                        }};
                    $modal.dialog('New Upload', app.getPaths('views/modal/newUpload.atom'), scope)
                        .width(555).height(420)
                        .ok(function(){
                            resolve(flist);
                        })
                        .cancel(resolve);
                });
            },
            delUpload: function (u) {
                const db = getDB();
                return new Promise(function (resolve) {
                    $modal.alertDetail(`Are you sure want to delete [${u.fileName}]?`,
                        `You can't undo this action!`, 'w')
                        .ok(function () {
                            if (app.useMysql) {
                                $http.post(app.getApiUrl('/api/executeById'))
                                    .responseJson()
                                    .jsonData(u)
                                    .then(function (rsp) {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            $modal.alertDetail('Delete upload error', data[1], 'e');
                                            resolve();
                                            return;
                                        }
                                        resolve(true);
                                        $modal.alert('Delete upload successd!', 's');
                                        Atom.broadcastMsg('refreshUploads');
                                    }, function (e) {
                                        $modal.alertDetail('Delete upload error', Atom.formatError(e), 'e');
                                        resolve();
                                    })
                                return;
                            }
                            Promise.all([
                                db.delete('upload', u.id)
                            ]).then(function () {
                                $modal.alert('Delete upload successd!', 's');
                                Atom.broadcastMsg('refreshUploads');
                                resolve(true);
                            }, e => {
                                $modal.alertDetail('Delete upload error', Atom.formatError(e), 'e');
                                resolve();
                            })
                        })
                        .cancel(resolve);
                });
            },
        }
    }]);
})(Atom.app('wppStore-admin'))