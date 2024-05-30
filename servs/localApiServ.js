/**
 * Created by Guest on 2024/5/29 20:34:19.
 */
(function (app) {
    app.factory('S_localApi', ['$idb', '$modal', '$http', function ($idb, $modal, $http) {
        function toastError(e) {
            if (e instanceof Event) {
                $modal.toastAlert(Atom.formatError(e), 'e');
                return;
            }
            $modal.toastAlert(e, 'e');
        }
        return {
            byPage: function (pg) {
                return $http.post(`${Atom.swScope()}localApi/byPage`)
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
            newLocalApi: function () {
                const $this = this;
                const wppId = app.fileObj.manifest.id;
                return new Promise(function (resolve, reject) {
                    const id = uuid();
                    const newLocalApi = {
                        id: id, wppId: wppId,
                        code: `function onRequest(e){\n    const req = e.request;\n    \n}`
                    };
                    const scope = { api: newLocalApi };
                    $modal.dialog('New LocalApi', app.getPaths('views/modal/newLocalApi.atom?'), scope)
                        .width(1024)
                        .ok(function () {
                            $http.post(`${Atom.swScope()}localApi/saveUpdate`)
                                .responseJson()
                                .jsonData(newLocalApi)
                                .then(function (rsp) {
                                    const data = rsp.response;
                                    if (data[0]) {
                                        $modal.alertDetail('Save localApi error', data[1], 'e');
                                        resolve();
                                        return;
                                    }
                                    resolve(newLocalApi);
                                    $modal.alert('Add localApi successd!', 's');
                                    Atom.broadcastMsg('refreshLocalApis');
                                }, function (e) {
                                    $modal.alertDetail('Save localApi error', Atom.formatError(e), 'e');
                                    resolve();
                                });
                            return;
                        })
                        .cancel(() => 0)
                        .ftBtns("Run", function () {
                            $this.testApi({ args: scope.args, code: newLocalApi.code }, function (reqData) {
                                scope.reqData = reqData;
                            }).then(function (rsp) {
                                scope.result = JSON.stringify(rsp.response, ' ', 2);
                            }, toastError);
                            return false;
                        });
                });
            },
            editLocalApi: function (u) {
                const $this = this;
                u.wppId = app.fileObj.manifest.id;
                const bakU = cloneFrom(u);
                const scope = { api: u };
                $modal.dialog('Edit LocalApi', app.getPaths('views/modal/newLocalApi.atom'), scope)
                    .width(1024)
                    .ok(function () {
                        $http.post(`${Atom.swScope()}localApi/saveUpdate`)
                            .responseJson()
                            .jsonData(u)
                            .then(function (rsp) {
                                const data = rsp.response;
                                if (data[0]) {
                                    $modal.alertDetail('Update localApi error', data[1], 'e');
                                    return;
                                }
                                $modal.alert('Update localApi successd!', 's');
                                Atom.broadcastMsg('refreshLocalApis');
                            }, function (e) {
                                $modal.alertDetail('Update localApi error', Atom.formatError(e), 'e');
                            })
                        return;
                    })
                    .cancel(function () {
                        cloneA2B(bakU, u);
                    })
                    .ftBtns("Run", function () {
                        $this.testApi({ args: scope.args, code: u.code }, function (reqData) {
                            scope.reqData = reqData;
                        }).then(function (rsp) {
                            scope.result = JSON.stringify(rsp.response, ' ', 2);
                        }, toastError);
                        return false;
                    }, "RequestApiTest", function () {
                        scope.reqData = JSON.stringify(scope.args,' ',2);
                        $http.post(Paths.get(Atom.swScope(), u.path))
                            .responseJson()
                            .jsonData(scope.args)
                            .then(function (rsp) {
                                scope.result = JSON.stringify(rsp.response, ' ', 2);
                            }, toastError);
                        return false;
                    });
            },
            delLocalApi: function (u) {
                u.wppId = app.fileObj.manifest.id;
                return new Promise(function (resolve) {
                    $modal.alertDetail(`Are you sure want to delete [${u.name}]?`,
                        `You can't undo this action!`, 'w')
                        .ok(function () {
                            $http.post(`${Atom.swScope()}localApi/delete`)
                                .responseJson()
                                .jsonData(u)
                                .then(function (rsp) {
                                    const data = rsp.response;
                                    if (data[0]) {
                                        $modal.alertDetail('Delete localApi error', data[1], 'e');
                                        resolve();
                                        return;
                                    }
                                    resolve(true);
                                    $modal.alert('Delete localApi successd!', 's');
                                    Atom.broadcastMsg('refreshLocalApis');
                                }, function (e) {
                                    $modal.alertDetail('Delete localApi error', Atom.formatError(e), 'e');
                                    resolve();
                                })
                            return;
                        })
                        .cancel(resolve);
                });
            },
            testApi: function (d, f) {
                if (f instanceof Function) {
                    f(JSON.stringify(d, ' ', 2));
                }
                return $http.post(`${Atom.swScope()}localApi/eval`)
                    .responseJson()
                    .jsonData(d);
            }
        }
    }]);
})(Atom.app('wppStore-admin'))