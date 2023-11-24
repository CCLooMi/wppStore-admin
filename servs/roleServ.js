/**
 * Created by guest on 11/23/2023 10:19:49 AM.
 */
(function(app){
    app.factory('S_role',['$idb', '$modal', function ($idb, $modal) {
        function getDB(){
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
                            newRole.id=uuid();
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
            roleUsers:function(r){
                const db = getDB();
                const scope = {role:r};
                $modal.dialog('Role Users',app.getPaths('views/modal/roleUsers.atom'), scope)
                .width(555)
                .ok(()=>0)
                .okValue('close');
            },
            getRoleUsers:function(r,pg,yes){
                const db = getDB();
                const emptyData={total:0,data:[]};
                return new Promise(function(resolve,reject){
                    db.get('userRole',r.id)
                    .useIndex('roleId')
                    .then(function([urList]){
                        const uSet={};
                        urList.forEach(ur=>uSet[ur.userId]=true);
                        pg.opts['id']=function(userId){
                            if(yes){
                                return uSet[userId];
                            }
                            return !uSet[userId];
                        }
                        db.byPage('user',pg).then(resolve,reject);
                    },reject);
                });
            },
            addUser:function(r,u){
                const db = getDB();
                const ru = {id:`${u.id}:${r.id}`.sha1(),userId:u.id,roleId:r.id};
                return db.put('userRole',ru);
            },
            removeUser:function(r,u){
                const db = getDB();
                return db.delete('userRole',`${u.id}:${r.id}`.sha1());
            }
        }
    }]);
})(Atom.app('wppStore-admin'))