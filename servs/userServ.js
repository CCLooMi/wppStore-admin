/**
 * Created by guest on 11/16/2023 9:24:42 AM.
 */
(function (app) {
    app.factory('S_user', ['$idb', '$modal', '$http', function ($idb, $modal, $http) {
        const key = 'wpp-store-login-user';
        let loginUser = Atom.fromLocalStorage(key);
        function getDB() {
            return $idb.get(app.idbName);
        }
        return {
            login: function (lo) {
                const db = getDB();
                return new Promise(function (resolve, reject) {
                    if (app.useMysql) {
                        $http.post(`${app.serverUrl}/user/login`)
                            .responseJson()
                            .jsonData(lo)
                            .then(rsp => {
                                const data = rsp.response;
                                if (data[0]) {
                                    reject(data[1])
                                    return;
                                }
                                resolve(data[1])
                            }, reject);
                        return;
                    }
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
            byPage: function (pg) {
                if (app.useMysql) {
                    return $http.post(`${app.serverUrl}/user/byPage`)
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
                return db.byPage("user",pg);
            },
            newUser: function () {
                const db = getDB();
                return new Promise(function (resolve, reject) {
                    const newUser = {password:'wios'};
                    const unwatch = Atom.watchChange(newUser, 'username', function (ov, nv, tg) {
                        if (upperCaseFirst(ov) === upperCaseFirst(newUser.nickname) || !newUser.nickname) {
                            newUser.nickname = upperCaseFirst(nv);
                        }
                    });
                    $modal.dialog('New User', app.getPaths('views/modal/newUser.atom?'), newUser)
                        .width(320)
                        .ok(function () {
                            unwatch();
                            newUser.id = uuid();
                            if (app.useMysql) {
                                $http.post(`${app.serverUrl}/user/saveUpdate`)
                                    .responseJson()
                                    .jsonData(newUser)
                                    .then(function (rsp) {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            $modal.alertDetail('Save user error', data[1], 'e');
                                            resolve();
                                            return;
                                        }
                                        resolve(newUser);
                                        $modal.alert('Add user successd!', 's');
                                    }, function (e) {
                                        $modal.alertDetail('Save user error', Atom.formatError(e), 'e');
                                        resolve();
                                    });
                                return;
                            }
                            newUser.password = `${newUser.username.sha1()}:123456`.sha1();
                            db.put('user', newUser)
                                .then(function () {
                                    resolve(newUser);
                                    $modal.alert('Add user successd!', 's');
                                }, function (e) {
                                    $modal.alertDetail('Save user error', Atom.formatError(e), 'e');
                                    resolve();
                                });
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
                $modal.dialog('Edit User', app.getPaths('views/modal/newUser.atom?'), u)
                    .width(320)
                    .ok(function () {
                        unwatch();
                        if (app.useMysql) {
                            $http.post(`${app.serverUrl}/user/saveUpdate`)
                                .responseJson()
                                .jsonData(u)
                                .then(function (rsp) {
                                    const data = rsp.response;
                                    if (data[0]) {
                                        $modal.alert('Update user successd!', 's');
                                        return;
                                    }
                                    $modal.alert('Update user successd!', 's');
                                }, function (e) {
                                    $modal.alertDetail('Update user error', Atom.formatError(e), 'e');
                                });
                            return;
                        }
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
                            if (app.useMysql) {
                                $http.post(`${app.serverUrl}/user/delete`)
                                    .responseJson()
                                    .jsonData(u)
                                    .then(function (rsp) {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            $modal.alertDetail('Delete user error', data[1], 'e');
                                            resolve();
                                            return;
                                        }
                                        resolve(true);
                                        $modal.alert('Delete user successd!', 's');
                                    }, function (e) {
                                        $modal.alertDetail('Delete user error', Atom.formatError(e), 'e');
                                        resolve();
                                    })
                                return;
                            }
                            Promise.all([
                                db.delete('userRole', u.id).useIndex('userId'),
                                db.delete('userPermission', u.id).useIndex('userId'),
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
                    if (app.useMysql) {
                        $http.get(`${app.serverUrl}/user/current`)
                            .responseJson()
                            .then(rsp => {
                                const data = rsp.response;
                                if (data[0]) {
                                    reject(data[1]);
                                    return;
                                }
                                resolve(data[1]);
                            }, reject)
                        return;
                    }
                    if(!loginUser){
                        $modal
                        .alert(`You haven't logged in yet!`)
                        .ok(() => app.go("login"));
                    }
                    resolve({user:loginUser});
                })
            },
            logout: function () {
                return new Promise(function (resolve) {
                    $modal.alert('Are you sure you want to logout now?', 'w')
                        .okValue('logout')
                        .ok(function () {
                            if (app.useMysql) {
                                $http.get(`${app.serverUrl}/user/logout`)
                                    .responseJson()
                                    .then(rsp => {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            resolve(false);
                                            return;
                                        }
                                        resolve(true);
                                    }, e=>resolve(false));
                                return;
                            }
                            loginUser = null;
                            Atom.removeLocalStorage(key);
                            resolve(true);
                        })
                        .cancel(() => resolve(false));
                });
            },
            getUserMenus: function (user) {
                if (app.useMysql) {
                    return $http.get(`${app.serverUrl}/user/menus`)
                        .responseJson()
                        .jsonData(user)
                        .then(rsp => {
                            const data = rsp.response;
                            if (data[0] || !data[1]) {
                                return [];
                            }
                            return processMenus(data[1]);
                        });
                }
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
                $modal.dialog('User Roles', app.getPaths('views/modal/userRoles.atom?'), scope)
                    .width(768)
                    .ok(() => 0)
                    .okValue('close');
            },
            getUserRoles: function (u, pg, yes) {
                return new Promise(function (resolve, reject) {
                    if (app.useMysql) {
                        pg.opts.yes=yes;
                        pg.opts.userId=u.id;
                        $http.post(`${app.serverUrl}/user/roles`)
                            .responseJson()
                            .jsonData(pg)
                            .then(rsp => {
                                const data = rsp.response;
                                if (data[0] || !data[1]) {
                                    return [];
                                }
                                return data[1];
                            }).then(resolve,reject);
                        return;
                    }
                    const db = getDB();
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
                const id = combineSHAStr(u.id,r.id);
                const ru = { id: id, userId: u.id, roleId: r.id };
                if (app.useMysql) {
                    return new Promise(function (resolve, reject) {
                        $http.post(`${app.serverUrl}/user/addRole`)
                            .responseJson()
                            .jsonData(ru)
                            .then(function (rsp) {
                                const data = rsp.response;
                                if (data[0]) {
                                    reject(data[1]);
                                    return;
                                }
                                resolve(data[1]);
                            },reject)
                    });
                }
                const db = getDB();
                return db.put('userRole', ru);
            },
            removeRole: function (u, r) {
                const id = combineSHAStr(u.id,r.id);
                const ru = { id: id, userId: u.id, roleId: r.id };
                if (app.useMysql) {
                    return new Promise(function (resolve, reject) {
                        $http.post(`${app.serverUrl}/user/removeRole`)
                            .responseJson()
                            .jsonData(ru)
                            .then(function (rsp) {
                                const data = rsp.response;
                                if (data[0]) {
                                    reject(data[1]);
                                    return;
                                }
                                resolve(data[1]);
                            },reject)
                    });
                }
                const db = getDB();
                return db.delete('userRole', ru.id);
            }
        }
    }]);
})(Atom.app('wppStore-admin'))