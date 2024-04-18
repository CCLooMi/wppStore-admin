/**
 * Created by Guest on 2024/4/12 16:52:25.
 */
(function (app) {
    app.factory('S_event', ['$idb', '$modal', '$http', '$marked', function ($idb, $modal, $http, $marked) {
        function getDB() {
            return $idb.get('wpp-store-admin');
        }
        return {
            byPage: function (pg) {
                if (app.useMysql) {
                    return $http.post(`${app.serverUrl}/event/byPage`)
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
                return db.byPage("event", pg);
            },
            newEvent: function () {
                const db = getDB();
                return new Promise(function (resolve, reject) {
                    const id = uuid();
                    const newEvent = { id: id };
                    let timeout;
                    const scope = { event: newEvent };
                    $modal.dialog('New Event', app.getPaths('views/modal/newEvent.atom?'), scope)
                        .width(768).height(480)
                        .ok(function () {
                            if (app.useMysql) {
                                $http.post(`${app.serverUrl}/event/saveUpdate`)
                                    .responseJson()
                                    .jsonData(newEvent)
                                    .then(function (rsp) {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            $modal.alertDetail('Save event error', data[1], 'e');
                                            resolve();
                                            return;
                                        }
                                        resolve(newEvent);
                                        $modal.alert('Add event successd!', 's');
                                        Atom.broadcastMsg('refreshEvents');
                                    }, function (e) {
                                        $modal.alertDetail('Save event error', Atom.formatError(e), 'e');
                                        resolve();
                                    })
                                return;
                            }
                            db.put('event', newEvent)
                                .then(function () {
                                    resolve(newEvent);
                                    $modal.alert('Add event successd!', 's');
                                    Atom.broadcastMsg('refreshEvents');
                                }, function (e) {
                                    $modal.alertDetail('Save event error', Atom.formatError(e), 'e');
                                    resolve();
                                });
                        })
                        .cancel(function () {
                            resolve();
                        }).afterOpen(function (m) {
                            const body = m.getBody();
                            const prevew = body.findOne(".preview");
                            scope.contentChange = function (v) {
                                const pvSr = prevew.shadowRoot || prevew.attachShadow({ mode: 'open' });
                                clearTimeout(timeout);
                                timeout = setTimeout(() => {
                                    $marked.renderTo(v, pvSr);
                                }, 500);
                            }
                        });
                });
            },
            editEvent: function (u) {
                const db = getDB();
                const bakU = cloneFrom(u);
                let timeout;
                const scope = { event: u };
                $modal.dialog('Edit Event', app.getPaths('views/modal/newEvent.atom'), scope)
                    .width(320)
                    .ok(function () {
                        if (app.useMysql) {
                            $http.post(`${app.serverUrl}/event/saveUpdate`)
                                .responseJson()
                                .jsonData(u)
                                .then(function (rsp) {
                                    const data = rsp.response;
                                    if (data[0]) {
                                        $modal.alertDetail('Update event error', data[1], 'e');
                                        return;
                                    }
                                    $modal.alert('Update event successd!', 's');
                                    Atom.broadcastMsg('refreshEvents');
                                }, function (e) {
                                    $modal.alertDetail('Update event error', Atom.formatError(e), 'e');
                                })
                            return;
                        }
                        db.put('event', u).then(function () {
                            $modal.alert('Update event successd!', 's');
                            Atom.broadcastMsg('refreshEvents');
                        }, e => {
                            $modal.alertDetail('Update event error', Atom.formatError(e), 'e');
                        })
                    })
                    .cancel(function () {
                        cloneA2B(bakU, u);
                    }).afterOpen(function (m) {
                        const body = m.getBody();
                        const prevew = body.findOne(".preview");
                        scope.contentChange = function (v) {
                            const pvSr = prevew.shadowRoot || prevew.attachShadow({ mode: 'open' });
                            clearTimeout(timeout);
                            timeout = setTimeout(() => {
                                $marked.renderTo(v, pvSr);
                            }, 500);
                        }
                    });
            },
            delEvent: function (u) {
                const db = getDB();
                return new Promise(function (resolve) {
                    $modal.alertDetail(`Are you sure want to delete [${u.name}]?`,
                        `You can't undo this action!`, 'w')
                        .ok(function () {
                            if (app.useMysql) {
                                $http.post(`${app.serverUrl}/event/delete`)
                                    .responseJson()
                                    .jsonData(u)
                                    .then(function (rsp) {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            $modal.alertDetail('Delete event error', data[1], 'e');
                                            resolve();
                                            return;
                                        }
                                        resolve(true);
                                        $modal.alert('Delete event successd!', 's');
                                        Atom.broadcastMsg('refreshEvents');
                                    }, function (e) {
                                        $modal.alertDetail('Delete event error', Atom.formatError(e), 'e');
                                        resolve();
                                    })
                                return;
                            }
                            Promise.all([
                                db.delete('event', u.id)
                            ]).then(function () {
                                $modal.alert('Delete event successd!', 's');
                                Atom.broadcastMsg('refreshEvents');
                                resolve(true);
                            }, e => {
                                $modal.alertDetail('Delete event error', Atom.formatError(e), 'e');
                                resolve();
                            })
                        })
                        .cancel(resolve);
                });
            },
        }
    }]);
})(Atom.app('wppStore-admin'))