/**
 * Created by Guest on 2024/5/12 13:58:07.
 */
(function(app){
    app.factory('S_wpp',['$idb', '$modal', '$http', function ($idb, $modal, $http) {
        function getDB() {
            return $idb.get('wppStore-admin');
        }
        return {
            byPage: function (pg) {
                if (app.useMysql) {
                    return $http.post(`${app.serverUrl}/wpp/byPage`)
                        .responseJson()
                        .jsonData(pg)
                        .then(rsp => {
                            const data = rsp.response;
                            if (data[0] || !data[1]) {
                                return [];
                            }
                            let d = data[1].data;
                            for (var i = 0; i < d.length; i++) {
                                d[i].manifest = JSON.parse(d[i].manifest);
                            }
                            return data[1];
                        });
                }
                const db = getDB();
                return db.byPage("wpp",pg);
            },
            newWpp: function () {
            const db = getDB();
            return new Promise(function (resolve, reject) {
                        const id = uuid();
                        const newWpp = { id: id};
                        $modal.dialog('New Wpp', app.getPaths('views/modal/newWpp.atom?'), newWpp)
                    .width(320)
                            .ok(function () {
                                if (app.useMysql) {
                                    $http.post(`${app.serverUrl}/wpp/saveUpdate`)
                                        .responseJson()
                                        .jsonData(newWpp)
                                        .then(function (rsp) {
                                            const data = rsp.response;
                                            if (data[0]) {
                                                $modal.alertDetail('Save wpp error', data[1], 'e');
                                                resolve();
                                                return;
                                            }
                                            resolve(newWpp);
                                            $modal.alert('Add wpp successd!', 's');
                                            Atom.broadcastMsg('refreshWpps');
                                        }, function (e) {
                                            $modal.alertDetail('Save wpp error', Atom.formatError(e), 'e');
                                            resolve();
                                        })
                                    return;
                                }
                                db.put('wpp', newWpp)
                            .then(function () {
                                    resolve(newWpp);
                                    $modal.alert('Add wpp successd!', 's');
                                    Atom.broadcastMsg('refreshWpps');
                                }, function (e) {
                                    $modal.alertDetail('Save wpp error', Atom.formatError(e), 'e');
                                    resolve();
                                });
                            })
                            .cancel(function () {
                                resolve();
                            });
                    });
        },
        editWpp: function (u) {
                    const db = getDB();
                    const bakU = cloneFrom(u);
                    $modal.dialog('Edit Wpp', app.getPaths('views/modal/newWpp.atom'), u)
                        .width(320)
                        .ok(function () {
                            if (app.useMysql) {
                                $http.post(`${app.serverUrl}/wpp/saveUpdate`)
                                    .responseJson()
                                    .jsonData(u)
                                    .then(function (rsp) {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            $modal.alertDetail('Update wpp error', data[1], 'e');
                                            return;
                                        }
                                        $modal.alert('Update wpp successd!', 's');
                                        Atom.broadcastMsg('refreshWpps');
                                    }, function (e) {
                                        $modal.alertDetail('Update wpp error', Atom.formatError(e), 'e');
                                    })
                                return;
                            }
                            db.put('wpp', u).then(function () {
                                $modal.alert('Update wpp successd!', 's');
                                Atom.broadcastMsg('refreshWpps');
                            }, e => {
                                $modal.alertDetail('Update wpp error', Atom.formatError(e), 'e');
                            })
                        })
                        .cancel(function () {
                            cloneA2B(bakU, u);
                        });
                },
        delWpp: function (u) {
                    const db = getDB();
                    return new Promise(function (resolve) {
                        $modal.alertDetail(`Are you sure want to delete [${u.name}]?`,
                            `You can't undo this action!`, 'w')
                            .ok(function () {
                                if (app.useMysql) {
                                    $http.post(`${app.serverUrl}/wpp/delete`)
                                        .responseJson()
                                        .jsonData(u)
                                        .then(function (rsp) {
                                            const data = rsp.response;
                                            if (data[0]) {
                                                $modal.alertDetail('Delete wpp error', data[1], 'e');
                                                resolve();
                                                return;
                                            }
                                            resolve(true);
                                            $modal.alert('Delete wpp successd!', 's');
                                            Atom.broadcastMsg('refreshWpps');
                                        }, function (e) {
                                            $modal.alertDetail('Delete wpp error', Atom.formatError(e), 'e');
                                            resolve();
                                        })
                                    return;
                                }
                                Promise.all([
                                    db.delete('wpp', u.id)
                                ]).then(function () {
                                    $modal.alert('Delete wpp successd!', 's');
                                    Atom.broadcastMsg('refreshWpps');
                                    resolve(true);
                                }, e => {
                                    $modal.alertDetail('Delete wpp error', Atom.formatError(e), 'e');
                                    resolve();
                                })
                            })
                            .cancel(resolve);
                    });
                },
    }
    }]);
})(Atom.app('wppStore-admin'))