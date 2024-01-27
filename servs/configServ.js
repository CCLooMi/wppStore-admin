/**
 * Created by guest on 2024/1/25 22:47:01.
 */
(function (app) {
    app.factory('S_config', ['$idb', '$modal', '$http', function ($idb, $modal, $http) {
        function getDB() {
            return $idb.get('wpp-store-admin');
        }
        return {
            byPage: function (pg) {
                if (app.useMysql) {
                    return $http.post(`${app.serverUrl}/config/byPage`)
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
                return db.byPage("config", pg);
            },
            newConfig: function () {
                const db = getDB();
                return new Promise(function (resolve, reject) {
                    const id = uuid();
                    const newConfig = { id: id };
                    $modal.dialog('New Config', app.getPaths('views/modal/newConfig.atom?'), newConfig)
                        .width(768).height(555)
                        .ok(function () {
                            if (app.useMysql) {
                                $http.post(`${app.serverUrl}/config/saveUpdate`)
                                    .responseJson()
                                    .jsonData(newConfig)
                                    .then(function (rsp) {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            $modal.alertDetail('Save config error', data[1], 'e');
                                            resolve();
                                            return;
                                        }
                                        resolve(newConfig);
                                        $modal.alert('Add config successd!', 's');
                                        Atom.broadcastMsg('refreshConfigs');
                                    }, function (e) {
                                        $modal.alertDetail('Save config error', Atom.formatError(e), 'e');
                                        resolve();
                                    })
                                return;
                            }
                            db.put('config', newConfig)
                                .then(function () {
                                    resolve(newConfig);
                                    $modal.alert('Add config successd!', 's');
                                    Atom.broadcastMsg('refreshConfigs');
                                }, function (e) {
                                    $modal.alertDetail('Save config error', Atom.formatError(e), 'e');
                                    resolve();
                                });
                        })
                        .cancel(function () {
                            resolve();
                        });
                });
            },
            editConfig: function (u) {
                const db = getDB();
                const bakU = cloneFrom(u);
                $modal.dialog('Edit Config', app.getPaths('views/modal/newConfig.atom'), u)
                    .width(768).height(555)
                    .ok(function () {
                        if (app.useMysql) {
                            $http.post(`${app.serverUrl}/config/saveUpdate`)
                                .responseJson()
                                .jsonData(u)
                                .then(function (rsp) {
                                    const data = rsp.response;
                                    if (data[0]) {
                                        $modal.alertDetail('Update config error', data[1], 'e');
                                        return;
                                    }
                                    $modal.alert('Update config successd!', 's');
                                    Atom.broadcastMsg('refreshConfigs');
                                }, function (e) {
                                    $modal.alertDetail('Update config error', Atom.formatError(e), 'e');
                                })
                            return;
                        }
                        db.put('config', u).then(function () {
                            $modal.alert('Update config successd!', 's');
                            Atom.broadcastMsg('refreshConfigs');
                        }, e => {
                            $modal.alertDetail('Update config error', Atom.formatError(e), 'e');
                        })
                    })
                    .cancel(function () {
                        cloneA2B(bakU, u);
                    });
            },
            delConfig: function (u) {
                const db = getDB();
                return new Promise(function (resolve) {
                    $modal.alertDetail(`Are you sure want to delete [${u.name}]?`,
                        `You can't undo this action!`, 'w')
                        .ok(function () {
                            if (app.useMysql) {
                                $http.post(`${app.serverUrl}/config/delete`)
                                    .responseJson()
                                    .jsonData(u)
                                    .then(function (rsp) {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            $modal.alertDetail('Delete config error', data[1], 'e');
                                            resolve();
                                            return;
                                        }
                                        resolve(true);
                                        $modal.alert('Delete config successd!', 's');
                                        Atom.broadcastMsg('refreshConfigs');
                                    }, function (e) {
                                        $modal.alertDetail('Delete config error', Atom.formatError(e), 'e');
                                        resolve();
                                    })
                                return;
                            }
                            Promise.all([
                                db.delete('config', u.id)
                            ]).then(function () {
                                $modal.alert('Delete config successd!', 's');
                                Atom.broadcastMsg('refreshConfigs');
                                resolve(true);
                            }, e => {
                                $modal.alertDetail('Delete config error', Atom.formatError(e), 'e');
                                resolve();
                            })
                        })
                        .cancel(resolve);
                });
            },
        }
    }]);
})(Atom.app('wppStore-admin'))