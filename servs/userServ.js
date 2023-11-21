/**
 * Created by guest on 11/16/2023 9:24:42 AM.
 */
(function (app) {
    app.factory('S_user', ['$idb', '$modal', function ($idb, $modal) {
        const key = 'wpp-store-login-user';
        let loginUser = Atom.fromLocalStorage(key);
        function getDB(){
            return $idb.get('wpp-store-admin');
        }
        return {
            login: function (lo) {
                const db = getDB();
                return new Promise(function (resolve, reject) {
                    db.range('user', lo.username)
                        .useIndex('username')
                        .each(c => {
                            const v = c.value;
                            const hash = `${lo.username.sha1()}:${lo.password}`.sha1();
                            c.continue();
                            if (v.username === lo.username && v.password === hash) {
                                loginUser = v;
                                Atom.toLocalStorage(key, v);
                                return v;
                            }
                        })
                        .then(function (a) {
                            if (a.length) {
                                resolve(...a);
                                return;
                            }
                            reject(new Error('Incorrect username or password'));
                        }, reject);
                });
            },
            newUser: function () {
                const db = getDB();
                return new Promise(function (resolve, reject) {
                    const newUser = {};
                    const unwatch = Atom.watchChange(newUser, 'username', function (ov, nv, tg) {
                        if (upperCaseFirst(ov) === upperCaseFirst(newUser.nickname)||!newUser.nickname) {
                            newUser.nickname = upperCaseFirst(nv);
                        }
                    });
                    $modal.dialog('New User', app.getPaths('views/modal/newUser.atom?'), newUser)
                        .width(320)
                        .ok(function () {
                            newUser.id = uuid();
                            newUser.password = `${newUser.username.sha1()}:123456`.sha1();
                            db.put('user', newUser)
                                .then(function () {
                                    resolve(newUser);
                                    $modal.alert('Add user successd!', 's');
                                }, function (e) {
                                    $modal.alertDetail('Save user error', Atom.formatError(e), 'e');
                                    resolve();
                                });
                            unwatch();
                        })
                        .cancel(function () {
                            unwatch();
                            resolve();
                        });
                });
            },
            editUser: function (u) {
                const db = getDB();
                const bakU = cloneFrom(u);
                const unwatch = Atom.watchChange(u, 'username', function (ov, nv, tg) {
                    if (upperCaseFirst(ov) === upperCaseFirst(u.nickname)||!u.nickname) {
                        u.nickname = upperCaseFirst(nv);
                    }
                });
                $modal.dialog('Edit User', app.getPaths('views/modal/newUser.atom'), u)
                    .width(320)
                    .ok(function () {
                        unwatch();
                        db.put('user', u).then(function () {
                            $modal.alert('Update user successd!', 's');
                        }, e => {
                            $modal.alertDetail('Update user error', Atom.formatError(e), 'e');
                        })
                    })
                    .cancel(function () {
                        unwatch();
                        cloneA2B(bakU, u);
                    });
            },
            delUser: function (u) {
                const db = getDB();
                return new Promise(function (resolve) {
                    $modal.alertDetail(`Are you sure want to delete [${u.username}]?`,
                        `You can't undo this action!`, 'w')
                        .ok(function () {
                            db.delete('user', u.id).then(function () {
                                $modal.alert('Delete user successd!', 's');
                                resolve(true);
                            }, e => {
                                $modal.alertDetail('Delete user error', Atom.formatError(e), 'e');
                                resolve();
                            })
                        })
                        .cancel(resolve);
                });
            },
            getLoginUser: function () {
                return new Promise(function (resolve, reject) {
                    resolve(loginUser);
                })
            },
            logout: function () {
                loginUser = null;
                Atom.removeLocalStorage(key);
            },
            getUserMenus: function (user) {
                return new Promise(function (resolve, reject) {
                    resolve([{
                        label: 'Security',
                        children: [
                            { label: 'Roles', href: 'main.roles' },
                            { label: 'Users', href: 'main.users' }
                        ]
                    }, {
                        label: 'System',
                        children: [
                            { label: 'Configure', href: 'main.configure' },
                            { label: 'Api', href: 'main.api' },
                        ]
                    }]);
                });
            }
        }
    }]);
})(Atom.app('wppStore-admin'))