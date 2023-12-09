/**
 * Created by guest on 11/23/2023 10:19:49 AM.
 */
(function (app) {
    app.factory('S_role', ['$idb', '$modal', function ($idb, $modal) {
        function getDB() {
            return $idb.get('wpp-store-admin');
        }
        return {
            newRole: function () {
                const db = getDB();
                return new Promise(function (resolve, reject) {
                    const newRole = {};
                    $modal.dialog('New Role', app.getPaths('views/modal/newRole.atom?'), newRole)
                        .width(320)
                        .ok(function () {
                            newRole.id = uuid();
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
                            db.delete('role', r.id).then(function () {
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
                const db = getDB();
                const scope = { role: r };
                scope.leftUsers = [];
                scope.rightUsers = [];
                scope.roleUsers = function (role, pg, y) {
                    return S_role.getRoleUsers(role, pg, y);
                }
                scope.moveLeft = function (r, u, leftUsers, rightUsers) {
                    S_role.addUser(r, u).then(function () {
                        rightUsers.splice(rightUsers.indexOf(u), 1);
                        leftUsers.push(u);
                        Atom.broadcastMsg('refreshMenus');
                    }, e => {
                        $m.alertDetail('Add user error!', `<pre>${Atom.formatError(e)}</pre>`, 'e');
                    });
                }
                scope.moveRight = function (r, u, leftUsers, rightUsers) {
                    S_role.removeUser(r, u).then(function () {
                        leftUsers.splice(leftUsers.indexOf(u), 1);
                        rightUsers.push(u);
                        Atom.broadcastMsg('refreshMenus');
                    }, e => {
                        $m.alertDetail('Remove user error!', `<pre>${Atom.formatError(e)}</pre>`, 'e');
                    });
                }
                $modal.dialog('Role Users', app.getPaths('views/modal/roleUsers.atom'), scope)
                    .width(555)
                    .ok(() => 0)
                    .okValue('close');
            },
            getRoleUsers: function (r, pg, yes) {
                const db = getDB();
                const emptyData = { total: 0, data: [] };
                return new Promise(function (resolve, reject) {
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
                const ru = { id: `${u.id}:${r.id}`.sha1(), userId: u.id, roleId: r.id };
                return db.put('userRole', ru);
            },
            removeUser: function (r, u) {
                const db = getDB();
                return db.delete('userRole', `${u.id}:${r.id}`.sha1());
            },
            roleMenus: function (r) {
                const $this = this;
                const db = getDB();
                const scope = { role: r, menus: [] };
                const selectIds = {};
                scope.roleMenus = function (r) {
                    $this.getRoleMenus(r).then(function (menus) {
                        scope.menus = menus;
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
                        const menus = getSelectMenus(scope.menus);
                        const addList = menus.map(m => {
                            delete selectIds[m.id];
                            return {
                                id: `${r.id}#${m.id}`.sha1(),
                                roleId: r.id,
                                menuId: m.id
                            };
                        });
                        const delList = Object.keys(selectIds).map(i => `${r.id}#${i}`.sha1());
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
                const db = getDB();
                return new Promise(function (resolve, reject) {
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
                                }).then(resolve, reject);
                        }, reject);
                });
            }
        }
    }]);
})(Atom.app('wppStore-admin'))