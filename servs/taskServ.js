/**
 * Created by Guest on 2024/5/12 20:53:21.
 */
(function (app) {
    app.factory('S_task', ['$idb', '$modal', '$http', function ($idb, $modal, $http) {
        function getDB() {
            return $idb.get('wppStore-admin');
        }
        return {
            byPage: function (pg) {
                return $http.post(app.getApiUrl('/api/vms'))
                    .responseJson()
                    .jsonData(pg)
                    .then(rsp => {
                        const data = rsp.response;
                        if (data[0] || !data[1]) {
                            return [];
                        }
                        return data[1];
                    });
            },
            stopTask: function (u) {
                const db = getDB();
                return new Promise(function (resolve) {
                    $modal.alertDetail(`Are you sure want to stop task [${u.title}]?`,
                        `You can't undo this action!`, 'w')
                        .ok(function () {
                            $http.get(app.getApiUrl(`/api/stopVmById?id=${u.id}`))
                                .responseJson()
                                .then(function (rsp) {
                                    const data = rsp.response;
                                    if (data[0]) {
                                        $modal.alertDetail('Stop task error', data[1], 'e');
                                        resolve();
                                        return;
                                    }
                                    resolve(true);
                                    $modal.toastAlert('Stop task successd!', 's');
                                    Atom.broadcastMsg('refreshTasks');
                                }, function (e) {
                                    $modal.toastAlertDetail('Stop task error', Atom.formatError(e), 'e');
                                    resolve();
                                })
                        })
                        .cancel(resolve);
                });
            },
            newTask:function(){
                return new Promise(function(resolve){
                    $modal.dialog('New Task', app.getPaths('views/apis.atom'))
                    .width(1024)
                    .ok(resolve)
                    .cancel(resolve)
                })
            }
        }
    }]);
})(Atom.app('wppStore-admin'))