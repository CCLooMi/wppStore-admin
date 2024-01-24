/**
 * Created by guest on 11/23/2023 10:19:49 AM.
 */
(function (app) {
    app.factory('S_role', ['$idb', '$modal', '$http', function ($idb, $modal, $http) {
        function getDB() {
            return $idb.get('wpp-store-admin');
        }
        return {
            byPage: function (pg) {
                if (app.useMysql) {
                    return $http.post(`${app.serverUrl}/role/byPage`)
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
                return db.byPage("role",pg);
            },
            newRole: function () {
                const db = getDB();
                return new Promise(function (resolve, reject) {
                    const newRole = {};
                    $modal.dialog('New Role', app.getPaths('views/modal/newRole.atom?'), newRole)
                        .width(320)
                        .ok(function () {
                            newRole.id = uuid();
                            if (app.useMysql) {
                                $http.post(`${app.serverUrl}/role/saveUpdate`)
                                    .responseJson()
                                    .jsonData(newRole)
                                    .then(function (rsp) {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            $modal.alertDetail('Save role error', data[1], 'e');
                                            resolve();
                                            return;
                                        }
                                        resolve(newRole);
                                        $modal.alert('Add role successd!', 's');
                                    }, function (e) {
                                        $modal.alertDetail('Save role error', Atom.formatError(e), 'e');
                                        resolve();
                                    })
                                return;
                            }
                            db.put('role', newRole)
                                .then(function () {
                                    resolve(newRole);
                                    $modal.alert('Add role successd!', 's');
                                }, function (e) {
                                    $modal.alertDetail('Save role error', Atom.formatError(e), 'e');
                                    resolve();
                                });
                        })
                        .cancel(function () {
                            resolve();
                        });
                });
            },
            editRole: function (r) {
                const db = getDB();
                const bakR = cloneFrom(r);
                $modal.dialog('Edit Role', app.getPaths('views/modal/newRole.atom'), r)
                    .width(320)
                    .ok(function () {
                        if (app.useMysql) {
                            $http.post(`${app.serverUrl}/role/saveUpdate`)
                                .responseJson()
                                .jsonData(r)
                                .then(function (rsp) {
                                    const data = rsp.response;
                                    if (data[0]) {
                                        $modal.alertDetail('Update role error', data[1], 'e');
                                        return;
                                    }
                                    $modal.alert('Update role successd!', 's');
                                }, function (e) {
                                    $modal.alertDetail('Update role error', Atom.formatError(e), 'e');
                                })
                            return;
                        }
                        db.put('role', r).then(function () {
                            $modal.alert('Update role successd!', 's');
                        }, e => {
                            $modal.alertDetail('Update role error', Atom.formatError(e), 'e');
                        })
                    })
                    .cancel(function () {
                        cloneA2B(bakR, r);
                    });
            },
            delRole: function (r) {
                const db = getDB();
                return new Promise(function (resolve) {
                    $modal.alertDetail(`Are you sure want to delete [${r.name}]?`,
                        `You can't undo this action!`, 'w')
                        .ok(function () {
                            if (app.useMysql) {
                                $http.post(`${app.serverUrl}/role/delete`)
                                    .responseJson()
                                    .jsonData(r)
                                    .then(function (rsp) {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            $modal.alertDetail('Delete role error', data[1], 'e');
                                            resolve();
                                            return;
                                        }
                                        resolve(true);
                                        $modal.alert('Delete role successd!', 's');
                                    }, function (e) {
                                        $modal.alertDetail('Delete role error', Atom.formatError(e), 'e');
                                        resolve();
                                    })
                                return;
                            }
                            Promise.all([
                                db.delete('userRole', r.id).useIndex('roleId'),
                                db.delete('roleMenu', r.id).useIndex('roleId'),
                                db.delete('rolePermission', r.id).useIndex('roleId'),
                                db.delete('role', r.id)
                            ]).then(function () {
                                $modal.alert('Delete role successd!', 's');
                                resolve(true);
                            }, e => {
                                $modal.alertDetail('Delete role error', Atom.formatError(e), 'e');
                                resolve();
                            })
                        })
                        .cancel(resolve);
                });
            },
            roleUsers: function (r) {
                const $this = this;
                const db = getDB();
                const scope = { role: r };
                scope.leftUsers = [];
                scope.rightUsers = [];
                scope.roleUsers = function (role, pg, y) {
                    return $this.getRoleUsers(role, pg, y);
                }
                scope.moveLeft = function (r, u, leftUsers, rightUsers) {
                    $this.addUser(r, u).then(function () {
                        rightUsers.splice(rightUsers.indexOf(u), 1);
                        leftUsers.push(u);
                        Atom.broadcastMsg('refreshMenus');
                    }, e => {
                        $modal.alertDetail('Add user error!', `<pre>${Atom.formatError(e)}</pre>`, 'e');
                    });
                }
                scope.moveRight = function (r, u, leftUsers, rightUsers) {
                    $this.removeUser(r, u).then(function () {
                        leftUsers.splice(leftUsers.indexOf(u), 1);
                        rightUsers.push(u);
                        Atom.broadcastMsg('refreshMenus');
                    }, e => {
                        $modal.alertDetail('Remove user error!', `<pre>${Atom.formatError(e)}</pre>`, 'e');
                    });
                }
                $modal.dialog('Role Users', app.getPaths('views/modal/roleUsers.atom'), scope)
                    .width(768)
                    .ok(() => 0)
                    .okValue('close');
            },
            getRoleUsers: function (r, pg, yes) {
                const db = getDB();
                return new Promise(function (resolve, reject) {
                    if (app.useMysql) {
                        pg.opts.yes=yes;
                        pg.opts.roleId=r.id;
                        return $http.post(`${app.serverUrl}/role/users`)
                            .responseJson()
                            .jsonData(pg)
                            .then(rsp => {
                                const data = rsp.response;
                                if (data[0] || !data[1]) {
                                    return [];
                                }
                                return data[1];
                            }).then(resolve,reject);
                    }
                    db.get('userRole', r.id)
                        .useIndex('roleId')
                        .then(function ([urList]) {
                            const uSet = {};
                            urList.forEach(ur => uSet[ur.userId] = true);
                            pg.opts['id'] = function (userId) {
                                if (yes) {
                                    return uSet[userId];
                                }
                                return !uSet[userId];
                            }
                            db.byPage('user', pg).then(resolve, reject);
                        }, reject);
                });
            },
            addUser: function (r, u) {
                const db = getDB();
                const id = combineSHAStr(u.id,r.id);
                const ru = { id: id, userId: u.id, roleId: r.id };
                if (app.useMysql) {
                    return new Promise(function (resolve, reject) {
                        $http.post(`${app.serverUrl}/role/addUser`)
                            .responseJson()
                            .jsonData(ru)
                            .then(function (rsp) {
                                const data = rsp.response;
                                if (data[0]) {
                                    reject(data[1]);
                                    return;
                                }
                                resolve(data[1]);
                            }, reject)
                    });
                }
                return db.put('userRole', ru);
            },
            removeUser: function (r, u) {
                const db = getDB();
                const id = combineSHAStr(u.id,r.id);
                const ru = { id: id, userId: u.id, roleId: r.id };
                if (app.useMysql) {
                    return new Promise(function (resolve, reject) {
                        $http.post(`${app.serverUrl}/role/removeUser`)
                            .responseJson()
                            .jsonData(ru)
                            .then(function (rsp) {
                                const data = rsp.response;
                                if (data[0]) {
                                    reject(data[1]);
                                    return;
                                }
                                resolve(data[1]);
                            }, reject)
                    });
                }
                return db.delete('userRole', ru.id);
            },
            roleMenus: function (r) {
                const $this = this;
                const db = getDB();
                const scope = { role: r, ms: [] };
                const selectIds = {};
                scope.roleMenus = function (r) {
                    $this.getRoleMenus(r).then(function (menus) {
                        scope.ms = menus;
                        getSelectMenus(menus)
                            .forEach(m => selectIds[m.id] = true);
                    }, function (e) {
                        $modal.alertDetail('Get Role Menus Error', Atom.formatError(e), 'e');
                    });
                }
                function getSelectMenus(menus, select) {
                    select = select || [];
                    menus.forEach(m => {
                        if (m.checked == 'on') {
                            select.push(m);
                            if (m.children) {
                                getSelectMenus(m.children, select);
                            }
                        }
                    });
                    return select;
                }
                $modal.dialog('Role Menus', app.getPaths('views/modal/roleMenus.atom'), scope)
                    .width(555)
                    .ok(function () {
                        const addList = [];
                        getSelectMenus(scope.ms).forEach(m => {
                            if(selectIds[m.id]){
                                delete selectIds[m.id];
                                return;
                            }
                            addList.push({
                                id: combineSHAStr(r.id,m.id),
                                roleId: r.id,
                                menuId: m.id
                            });
                        });
                        const delList = Object.keys(selectIds).map(i => combineSHAStr(r.id,i));
                        if (app.useMysql) {
                            $http.post(`${app.serverUrl}/role/updateMenus`)
                                .responseJson()
                                .jsonData({ del: delList, add: addList })
                                .then(function (rsp) {
                                    const data = rsp.response;
                                    if (data[0]) {
                                        $modal.alertDetail('Update Role Menus Error', data[1], 'e');
                                        return;
                                    }
                                    $modal.alertDetail('Update Role Menus', 'Update successd', 's');
                                    Atom.broadcastMsg('refreshMenus');
                                }, e => {
                                    $modal.alertDetail('Update Role Menus Error', Atom.formatError(e), 'e');
                                });
                            return;
                        }
                        Promise.all([db.delete('roleMenu', delList), db.put('roleMenu', addList)])
                            .then(function () {
                                $modal.alertDetail('Update Role Menus', 'Update successd', 's');
                                Atom.broadcastMsg('refreshMenus');
                            }, e => {
                                $modal.alertDetail('Update Role Menus Error', Atom.formatError(e), 'e');
                            });
                    })
                    .cancel(() => 0);
            },
            getRoleMenus: function (r) {
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
                return new Promise(function (resolve, reject) {
                    if (app.useMysql) {
                        $http.post(`${app.serverUrl}/role/menus`)
                            .responseJson()
                            .jsonData(r)
                            .then(rsp => {
                                const data = rsp.response;
                                if (data[0] || !data[1]) {
                                    resolve([]);
                                    return;
                                }
                                resolve(processMenus(data[1]));
                            });
                        return;
                    }
                    const db = getDB();
                    db.get('roleMenu', r.id)
                        .useIndex('roleId')
                        .then(function ([rmList]) {
                            const mSet = {};
                            rmList.forEach(rm => mSet[rm.menuId] = true);

                            db.foreach('menu')
                                .each(c => {
                                    const v = c.value;
                                    c.continue();
                                    if (mSet[v.id]) {
                                        v.checked = 'on';
                                    }
                                    return v;
                                })
                                .then(function (a) {
                                    return processMenus(a);
                                }).then(resolve, reject);
                        }, reject);
                });
            },
            rolePermissions: function (r) {
                const $this = this;
                const db = getDB();
                const scope = { role: r, ps: [] };
                const selectIds = {};
                scope.rolePermissions = function (r) {
                    $this.getRolePermissions(r).then(function (permissions) {
                        scope.ps = permissions;
                        getSelectPermissions(permissions)
                            .forEach(p => selectIds[p.id] = true);
                    }, function (e) {
                        $modal.alertDetail('Get Role Permissions Error', Atom.formatError(e), 'e');
                    });
                }
                function getSelectPermissions(permissions, select) {
                    select = select || [];
                    permissions.forEach(p => {
                        if (p.checked == 'on') {
                            select.push(p);
                            if (p.children) {
                                getSelectPermissions(p.children, select);
                            }
                        }
                    });
                    return select;
                }
                $modal.dialog('Role Permissions', app.getPaths('views/modal/rolePermissions.atom'), scope)
                    .width(555)
                    .ok(function () {
                        const addList = [];
                        getSelectPermissions(scope.ps).forEach(p=>{
                            if(selectIds[p.id]){
                                delete selectIds[p.id];
                                return;
                            }
                            addList.push({
                                id: combineSHAStr(r.id,p.id),
                                roleId: r.id,
                                permissionId: p.id
                            })
                        });
                        const delList = Object.keys(selectIds).map(i => combineSHAStr(r.id,i));
                        if (app.useMysql) {
                            $http.post(`${app.serverUrl}/role/updatePermissions`)
                                .responseJson()
                                .jsonData({ del: delList, add: addList })
                                .then(function (rsp) {
                                    const data = rsp.response;
                                    if (data[0]) {
                                        $modal.alertDetail('Update Role Permissions Error', data[1], 'e');
                                        return;
                                    }
                                    $modal.alertDetail('Update Role Permissions', 'Update successd', 's');
                                    Atom.broadcastMsg('refreshPermissions');
                                }, e => {
                                    $modal.alertDetail('Update Role Permissions Error', Atom.formatError(e), 'e');
                                }
                                );
                            return;
                        }
                        Promise.all([db.delete('rolePermission', delList), db.put('rolePermission',addList)]);
                    })
                    .cancel(() => 0);
            },
            getRolePermissions: function (r) {
                function processPermissions(a) {
                    const pm = {},ps=[];
                    a.forEach(i => {
                        pm[i.id] = i;
                    });
                    a.forEach(i => {
                        if (i.pid) {
                            const p = pm[i.pid];
                            (p.children || (p.children = [])).push(i);
                            return;
                        }
                        ps.push(i);
                    });
                    return ps;
                }
                return new Promise(function (resolve, reject) {
                    if (app.useMysql) {
                        $http.post(`${app.serverUrl}/role/permissions`)
                            .responseJson()
                            .jsonData(r)
                            .then(rsp => {
                                const data = rsp.response;
                                if (data[0] || !data[1]) {
                                    resolve([]);
                                    return;
                                }
                                resolve(processPermissions(data[1]));
                            });
                        return;
                    }
                    resolve([]);
                })
            }
        }
    }]);
})(Atom.app('wppStore-admin'))