/**
 * Created by guest on 11/22/2023 11:16:56 PM.
 */
(function(app){
    app.factory('S_menu',['$idb', '$modal', function ($idb, $modal) {
        function getDB(){
            return $idb.get('wpp-store-admin');
        }
        return {
            newMenu: function (parentMenu) {
                const db = getDB();
                return new Promise(function (resolve, reject) {
                    const id = uuid();
                    const newMenu = {id:id,rootId:id,pid:'#',idx:0};
                    if(parentMenu){
                        newMenu.rootId=parentMenu.rootId;
                        newMenu.pid=parentMenu.id;
                    }
                    $modal.dialog('New Menu', app.getPaths('views/modal/newMenu.atom?'), newMenu)
                        .width(320)
                        .ok(function () {
                            db.put('menu', newMenu)
                                .then(function () {
                                    resolve(newMenu);
                                    $modal.alert('Add menu successd!', 's');
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
                        db.put('menu', u).then(function () {
                            $modal.alert('Update menu successd!', 's');
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
                            db.delete('menu', u.id).then(function () {
                                $modal.alert('Delete menu successd!', 's');
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