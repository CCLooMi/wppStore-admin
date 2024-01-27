/**
 * Created by guest on 2024/1/19 10:35:41.
 */
(function (app) {
    app.factory('S_api', ['$idb', '$modal', '$http', function ($idb, $modal, $http) {
        function getDB() {
            return $idb.get('wpp-store-admin');
        }
        return {
            byPage: function (pg) {
                if (app.useMysql) {
                    return $http.post(`${app.serverUrl}/api/byPage`)
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
                return db.byPage("api", pg);
            },
            newApi: function () {
                const db = getDB();
                const $this = this;
                return new Promise(function (resolve, reject) {
                    const newApi = {};
                    const scope = {
                        api: newApi, execute: function (a,args) {
                            $this.execute(a,args).then(setResult, setResult)
                        }
                    };
                    function setResult(r) {
                        scope.result = r;
                    };
                    $modal.dialog('New Api', app.getPaths('views/modal/newApi.atom?'), scope)
                        .width(768).height(555)
                        .ok(function () {
                            newApi.id=uuid();
                            if (app.useMysql) {
                                $http.post(`${app.serverUrl}/api/saveUpdate`)
                                    .responseJson()
                                    .jsonData(newApi)
                                    .then(function (rsp) {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            $modal.alertDetail('Save api error', data[1], 'e');
                                            resolve();
                                            return;
                                        }
                                        resolve(newApi);
                                        $modal.alert('Add api successd!', 's');
                                        Atom.broadcastMsg('refreshApis');
                                    }, function (e) {
                                        $modal.alertDetail('Save api error', Atom.formatError(e), 'e');
                                        resolve();
                                    })
                                return;
                            }
                            db.put('api', newApi)
                                .then(function () {
                                    resolve(newApi);
                                    $modal.alert('Add api successd!', 's');
                                    Atom.broadcastMsg('refreshApis');
                                }, function (e) {
                                    $modal.alertDetail('Save api error', Atom.formatError(e), 'e');
                                    resolve();
                                });
                        })
                        .cancel(function () {
                            resolve();
                        });
                });
            },
            editApi: function (u) {
                const db = getDB();
                const $this = this;
                const bakU = cloneFrom(u);
                const scope = {
                    api: u, execute: function (a,args) {
                        $this.execute(a,args).then(setResult, setResult)
                    }
                };
                function setResult(r) {
                    scope.result = r;
                };
                $modal.dialog('Edit Api', app.getPaths('views/modal/newApi.atom'), scope)
                    .width(768).height(555)
                    .ok(function () {
                        if (app.useMysql) {
                            $http.post(`${app.serverUrl}/api/saveUpdate`)
                                .responseJson()
                                .jsonData(u)
                                .then(function (rsp) {
                                    const data = rsp.response;
                                    if (data[0]) {
                                        $modal.alertDetail('Update api error', data[1], 'e');
                                        return;
                                    }
                                    $modal.alert('Update api successd!', 's');
                                    Atom.broadcastMsg('refreshApis');
                                }, function (e) {
                                    $modal.alertDetail('Update api error', Atom.formatError(e), 'e');
                                })
                            return;
                        }
                        db.put('api', u).then(function () {
                            $modal.alert('Update api successd!', 's');
                            Atom.broadcastMsg('refreshApis');
                        }, e => {
                            $modal.alertDetail('Update api error', Atom.formatError(e), 'e');
                        })
                    })
                    .cancel(function () {
                        cloneA2B(bakU, u);
                    });
            },
            delApi: function (u) {
                const db = getDB();
                return new Promise(function (resolve) {
                    $modal.alertDetail(`Are you sure want to delete [${u.desc}]?`,
                        `You can't undo this action!`, 'w')
                        .ok(function () {
                            if (app.useMysql) {
                                $http.post(`${app.serverUrl}/api/delete`)
                                    .responseJson()
                                    .jsonData(u)
                                    .then(function (rsp) {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            $modal.alertDetail('Delete api error', data[1], 'e');
                                            resolve();
                                            return;
                                        }
                                        resolve(true);
                                        $modal.alert('Delete api successd!', 's');
                                        Atom.broadcastMsg('refreshApis');
                                    }, function (e) {
                                        $modal.alertDetail('Delete api error', Atom.formatError(e), 'e');
                                        resolve();
                                    })
                                return;
                            }
                            Promise.all([
                                db.delete('api', u.id)
                            ]).then(function () {
                                $modal.alert('Delete api successd!', 's');
                                Atom.broadcastMsg('refreshApis');
                                resolve(true);
                            }, e => {
                                $modal.alertDetail('Delete api error', Atom.formatError(e), 'e');
                                resolve();
                            })
                        })
                        .cancel(resolve);
                });
            },
            execute: function (a,args) {
                if (app.useMysql) {
                    var ags = [];
                    try {
                        ags = JSON.parse(args);
                    } catch (e) {
                        if (args) {
                            ags.push(args);
                        }
                    }
                    return new Promise(function (resolve, reject) {
                        const jsonData = { id: a.id, args: ags,script: a.script};
                        $http.post(`${app.serverUrl}/api/execute`)
                            .responseJson()
                            .jsonData(jsonData)
                            .then(function (rsp) {
                                const data = rsp.response;
                                if (data[0]) {
                                    reject(data[1]);
                                    return;
                                }
                                resolve(JSON.stringify(data[1], ' ', 2));
                            }, function (e) {
                                reject(Atom.formatError(e));
                            })
                    });
                }
                return new Promise(function (resolve) {
                    resolve("");
                });
            }
        }
    }]);
})(Atom.app('wppStore-admin'))