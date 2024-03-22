/**
 * Created by guest on 11/22/2023 11:16:56 PM.
 */
(function (app) {
    app.factory('S_menu', ['$idb', '$modal', '$http', function ($idb, $modal, $http) {
        function getDB() {
            return $idb.get(app.idbName);
        }
        return {
            initMenus: function () {
                if (app.useMysql) {
                    return $http.get(`${app.serverUrl}/menu/init`)
                        .responseJson()
                        .then(rsp => {
                            $modal.alertDetail('Init Menus', 'Initialization ok!', 's');
                            Atom.broadcastMsg('refreshMenus');
                            return rsp.response;
                        });
                }
                const menus = [{ "id": "237372500b86260b748e95143587c991", "rootId": "2a9533d1aba99986babeece48ef2c1bc", "pid": "2a9533d1aba99986babeece48ef2c1bc", "idx": 0, "name": "Menus", "href": "main.menus" }, { "id": "2a9533d1aba99986babeece48ef2c1bc", "rootId": "2a9533d1aba99986babeece48ef2c1bc", "pid": "#", "idx": 0, "name": "System", "href": "" }, { "id": "a658e46f2fe2699846bcf89053ae4001", "rootId": "a658e46f2fe2699846bcf89053ae4001", "pid": "#", "idx": 0, "name": "Security", "href": "" }, { "id": "f687ac08d79f2d066dd0d2d6058f7f01", "rootId": "a658e46f2fe2699846bcf89053ae4001", "pid": "a658e46f2fe2699846bcf89053ae4001", "idx": 0, "name": "Users", "href": "main.users" }, { "id": "f6b6af3a67dea5704da2a1150033063d", "rootId": "a658e46f2fe2699846bcf89053ae4001", "pid": "a658e46f2fe2699846bcf89053ae4001", "idx": 0, "name": "Roles", "href": "main.roles" }];
                const db = getDB();
                return db.put('menu', menus).then(function () {
                    $modal.alertDetail('Init Menus', 'Initialization ok!', 's');
                    Atom.broadcastMsg('refreshMenus');
                });
            },
            byPage: function (pg) {
                if (app.useMysql) {
                    return $http.post(`${app.serverUrl}/menu/byPage`)
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
                return db.byPage("menu",pg);
            },
            newMenu: function (parentMenu) {
                const db = getDB();
                return new Promise(function (resolve, reject) {
                    const id = uuid();
                    const newMenu = { id: id, rootId: id, pid: '#', idx: 0 };
                    if (parentMenu) {
                        newMenu.rootId = parentMenu.rootId;
                        newMenu.pid = parentMenu.id;
                    }
                    $modal.dialog('New Menu', app.getPaths('views/modal/newMenu.atom?'), newMenu)
                        .width(320)
                        .ok(function () {
                            if (app.useMysql) {
                                $http.post(`${app.serverUrl}/menu/saveUpdate`)
                                    .responseJson()
                                    .jsonData(newMenu)
                                    .then(function (rsp) {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            $modal.alertDetail('Save menu error', data[1], 'e');
                                            resolve();
                                            return;
                                        }
                                        resolve(newMenu);
                                        $modal.alert('Add menu successd!', 's');
                                        Atom.broadcastMsg('refreshMenus');
                                    }, function (e) {
                                        $modal.alertDetail('Save menu error', Atom.formatError(e), 'e');
                                        resolve();
                                    })
                                return;
                            }
                            db.put('menu', newMenu)
                                .then(function () {
                                    resolve(newMenu);
                                    $modal.alert('Add menu successd!', 's');
                                    Atom.broadcastMsg('refreshMenus');
                                }, function (e) {
                                    $modal.alertDetail('Save menu error', Atom.formatError(e), 'e');
                                    resolve();
                                });
                        })
                        .cancel(function () {
                            resolve();
                        });
                });
            },
            editMenu: function (u) {
                const db = getDB();
                const bakU = cloneFrom(u);
                $modal.dialog('Edit Menu', app.getPaths('views/modal/newMenu.atom'), u)
                    .width(320)
                    .ok(function () {
                        if (app.useMysql) {
                            $http.post(`${app.serverUrl}/menu/saveUpdate`)
                                .responseJson()
                                .jsonData(u)
                                .then(function (rsp) {
                                    const data = rsp.response;
                                    if (data[0]) {
                                        $modal.alertDetail('Update menu error', data[1], 'e');
                                        return;
                                    }
                                    $modal.alert('Update menu successd!', 's');
                                    Atom.broadcastMsg('refreshMenus');
                                }, function (e) {
                                    $modal.alertDetail('Update menu error', Atom.formatError(e), 'e');
                                })
                            return;
                        }
                        db.put('menu', u).then(function () {
                            $modal.alert('Update menu successd!', 's');
                            Atom.broadcastMsg('refreshMenus');
                        }, e => {
                            $modal.alertDetail('Update menu error', Atom.formatError(e), 'e');
                        })
                    })
                    .cancel(function () {
                        cloneA2B(bakU, u);
                    });
            },
            delMenu: function (u) {
                const db = getDB();
                return new Promise(function (resolve) {
                    $modal.alertDetail(`Are you sure want to delete [${u.name}]?`,
                        `You can't undo this action!`, 'w')
                        .ok(function () {
                            if (app.useMysql) {
                                $http.post(`${app.serverUrl}/menu/delete`)
                                    .responseJson()
                                    .jsonData(u)
                                    .then(function (rsp) {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            $modal.alertDetail('Delete menu error', data[1], 'e');
                                            resolve();
                                            return;
                                        }
                                        resolve(true);
                                        $modal.alert('Delete menu successd!', 's');
                                        Atom.broadcastMsg('refreshMenus');
                                    }, function (e) {
                                        $modal.alertDetail('Delete menu error', Atom.formatError(e), 'e');
                                        resolve();
                                    })
                                return;
                            }
                            Promise.all([
                                db.delete('roleMenu', u.id).useIndex('menuId'),
                                db.delete('menu', u.id).useIndex('pid'),
                                db.delete('menu', u.id)
                            ]).then(function () {
                                $modal.alert('Delete menu successd!', 's');
                                Atom.broadcastMsg('refreshMenus');
                                resolve(true);
                            }, e => {
                                $modal.alertDetail('Delete menu error', Atom.formatError(e), 'e');
                                resolve();
                            })
                        })
                        .cancel(resolve);
                });
            },
        }
    }]);
})(Atom.app('wppStore-admin'))