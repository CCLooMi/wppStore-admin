/**
 * Created by guest on 11/22/2023 11:16:56 PM.
 */
(function(app){
    app.factory('S_menu',['$idb', '$modal', function ($idb, $modal) {
        function getDB(){
            return $idb.get('wpp-store-admin');
        }
        return {
            initMenus:function(){
                const db = getDB();
                const menus = [{"id":"237372500b86260b748e95143587c991","rootId":"2a9533d1aba99986babeece48ef2c1bc","pid":"2a9533d1aba99986babeece48ef2c1bc","idx":0,"name":"Menus","href":"main.menus"},{"id":"2a9533d1aba99986babeece48ef2c1bc","rootId":"2a9533d1aba99986babeece48ef2c1bc","pid":"#","idx":0,"name":"System","href":""},{"id":"a658e46f2fe2699846bcf89053ae4001","rootId":"a658e46f2fe2699846bcf89053ae4001","pid":"#","idx":0,"name":"Security","href":""},{"id":"f687ac08d79f2d066dd0d2d6058f7f01","rootId":"a658e46f2fe2699846bcf89053ae4001","pid":"a658e46f2fe2699846bcf89053ae4001","idx":0,"name":"Users","href":"main.users"},{"id":"f6b6af3a67dea5704da2a1150033063d","rootId":"a658e46f2fe2699846bcf89053ae4001","pid":"a658e46f2fe2699846bcf89053ae4001","idx":0,"name":"Roles","href":"main.roles"}];
                return db.put('menu',menus).then(function(){
                    $modal.alertDetail('Init Menus','Initialization ok!','s');
                    Atom.broadcastMsg('refreshMenus');
                });
            },
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
                            db.delete('menu', u.id).then(function () {
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