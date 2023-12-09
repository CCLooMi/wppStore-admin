/**
 * Created by guest on 11/16/2023 9:24:42 AM.
 */
(function (app) {
    app.factory('S_user', ['$idb', '$modal', function ($idb, $modal) {
        const key = 'wpp-store-login-user';
        let loginUser = Atom.fromLocalStorage(key);
        function getDB() {
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
                        if (upperCaseFirst(ov) === upperCaseFirst(newUser.nickname) || !newUser.nickname) {
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
                    if (upperCaseFirst(ov) === upperCaseFirst(u.nickname) || !u.nickname) {
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
                            Promise.all([
                                db.delete('userRole', u.id).useIndex('userId'),
                                db.delete('user', u.id)
                            ]).then(function () {
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
                return new Promise(function (resolve) {
                    $modal.alert('Are you sure you want to logout now?', 'w')
                        .okValue('logout')
                        .ok(function () {
                            loginUser = null;
                            Atom.removeLocalStorage(key);
                            resolve(true);
                        })
                        .cancel(() => resolve(false));
                });
            },
            getUserMenus: function (user) {
                const db = getDB();
                function getMenuIdsByUserId(userId) {
                    return db.range('userRole')
                        .each(c => {
                            c.continue();
                            const v = c.value;
                            if (v.userId == userId) {
                                return v;
                            }
                        })
                        .then(function (urs) {
                            const rm = {};
                            urs.forEach(u => rm[u.roleId] = true);
                            return db.range('roleMenu')
                                .each(c => {
                                    c.continue();
                                    const v = c.value;
                                    if (rm[v.roleId]) {
                                        return v;
                                    }
                                })
                                .then(function (rs) {
                                    const mm = {};
                                    rs.forEach(r => mm[r.menuId] = true);
                                    return mm;
                                });
                        })
                }
                function processMenus(a) {
                    const m = {}, menus = [];
                    a.forEach(i => {
                        m[i.id] = i;
                    });
                    a.forEach(i => {
                        if (i.pid !== '#') {
                            const p = m[i.pid];
                            (p.children || (p.children = [])).push(i);
                            return;
                        }
                        menus.push(i);
                    });
                    return menus;
                }
                if (user.username !== 'root') {
                    return getMenuIdsByUserId(user.id)
                        .then(function (mm) {
                            return db.range('menu')
                                .each(c => {
                                    c.continue();
                                    const v = c.value;
                                    if (mm[v.id]) {
                                        return v;
                                    }
                                })
                                .then(processMenus);
                        });
                }
                return db.range('menu')
                    .each(c => {
                        c.continue();
                        return c.value;
                    })
                    .then(processMenus);
            },
            userRoles: function (u) {
                const $this = this;
                const db = getDB();
                const scope = { user: u };
                scope.leftRoles = [];
                scope.rightRoles = [];
                scope.userRoles = function (role, pg, y) {
                    return $this.getUserRoles(role, pg, y);
                }
                scope.moveLeft = function (u, r, leftRoles, rightRoles) {
                    $this.addRole(u, r).then(function () {
                        rightRoles.splice(rightRoles.indexOf(r), 1);
                        leftRoles.push(r);
                        Atom.broadcastMsg('refreshMenus');
                    }, e => {
                        $modal.alertDetail('Add role error!', `<pre>${Atom.formatError(e)}</pre>`, 'e');
                    });
                }
                scope.moveRight = function (u, r, leftRoles, rightRoles) {
                    $this.removeRole(u, r).then(function () {
                        leftRoles.splice(leftRoles.indexOf(r), 1);
                        rightRoles.push(r);
                        Atom.broadcastMsg('refreshMenus');
                    }, e => {
                        $modal.alertDetail('Remove role error!', `<pre>${Atom.formatError(e)}</pre>`, 'e');
                    });
                }
                $modal.dialog('Role Users', app.getPaths('views/modal/userRoles.atom'), scope)
                    .width(555)
                    .ok(() => 0)
                    .okValue('close');
            },
            getUserRoles: function (u, pg, yes) {
                const db = getDB();
                const emptyData = { total: 0, data: [] };
                return new Promise(function (resolve, reject) {
                    db.get('userRole', u.id)
                        .useIndex('userId')
                        .then(function ([urList]) {
                            const rSet = {};
                            urList.forEach(ur => rSet[ur.roleId] = true);
                            pg.opts['id'] = function (roleId) {
                                if (yes) {
                                    return rSet[roleId];
                                }
                                return !rSet[roleId];
                            }
                            db.byPage('role', pg).then(resolve, reject);
                        }, reject);
                });
            },
            addRole: function (u, r) {
                const db = getDB();
                const ru = { id: `${u.id}:${r.id}`.sha1(), userId: u.id, roleId: r.id };
                return db.put('userRole', ru);
            },
            removeRole: function (u, r) {
                const db = getDB();
                return db.delete('userRole', `${u.id}:${r.id}`.sha1());
            }
        }
    }]);
})(Atom.app('wppStore-admin'))