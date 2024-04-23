/**
 * Created by Guest on 2024/4/12 16:52:56.
 */
(function (app) {
    app.factory('S_story', ['$idb', '$modal', '$http', function ($idb, $modal, $http) {
        function getDB() {
            return $idb.get('wpp-store-admin');
        }
        return {
            byPage: function (pg) {
                if (app.useMysql) {
                    return $http.post(`${app.serverUrl}/story/byPage`)
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
                return db.byPage("story", pg);
            },
            newStory: function () {
                const db = getDB();
                return new Promise(function (resolve, reject) {
                    const id = uuid();
                    const newStory = {
                        id: id,
                        bgImgUrl:`/images/Solid Colors/Space Gray.png`,
                        bgVideoUrl:``,
                        title:`Promoting Exclusive Features\n\nUnmissable New Game`,
                        contentBlock:`Big update\n\n# Within the painting's realm, all things possess a soul.\n\nWelcome to the 'Spirit of Art' season.`,
                        wpps:[]
                    };
                    let timeout;
                    const scope = { story: newStory };
                    dialogNewStory(newStory);
                    function dialogNewStory(s){
                        const scope = {
                            story:newStory,
                            selectWpps:function(){
                                newStory.wpps.length++;
                            },
                            onMax:function(ele){
                                if(ele.hasClass('max')){
                                    ele.removeClass('max');
                                    return;
                                }
                                ele.addClass('max');
                            }
                        };
                        $modal.dialog('New Story',app.getPaths('views/modal/newStory.atom?'),scope)
                        .width(768)
                        .ok(function (){

                        })
                    }
                    function saveStory() {
                        if (app.useMysql) {
                            $http.post(`${app.serverUrl}/story/saveUpdate`)
                                .responseJson()
                                .jsonData(newStory)
                                .then(function (rsp) {
                                    const data = rsp.response;
                                    if (data[0]) {
                                        $modal.alertDetail('Save story error', data[1], 'e');
                                        resolve();
                                        return;
                                    }
                                    resolve(newStory);
                                    $modal.alert('Add story successd!', 's');
                                    Atom.broadcastMsg('refreshStorys');
                                }, function (e) {
                                    $modal.alertDetail('Save story error', Atom.formatError(e), 'e');
                                    resolve();
                                })
                            return;
                        }
                        db.put('story', newStory)
                            .then(function () {
                                resolve(newStory);
                                $modal.alert('Add story successd!', 's');
                                Atom.broadcastMsg('refreshStorys');
                            }, function (e) {
                                $modal.alertDetail('Save story error', Atom.formatError(e), 'e');
                                resolve();
                            });
                    }
                });
            },
            editStory: function (u) {
                const db = getDB();
                const bakU = cloneFrom(u);

                let timeout;
                const scope = { story: u };
                $modal.dialog('Edit Story', app.getPaths('views/modal/newStory.atom'), scope)
                    .width(320)
                    .ok(function () {
                        if (app.useMysql) {
                            $http.post(`${app.serverUrl}/story/saveUpdate`)
                                .responseJson()
                                .jsonData(u)
                                .then(function (rsp) {
                                    const data = rsp.response;
                                    if (data[0]) {
                                        $modal.alertDetail('Update story error', data[1], 'e');
                                        return;
                                    }
                                    $modal.alert('Update story successd!', 's');
                                    Atom.broadcastMsg('refreshStorys');
                                }, function (e) {
                                    $modal.alertDetail('Update story error', Atom.formatError(e), 'e');
                                })
                            return;
                        }
                        db.put('story', u).then(function () {
                            $modal.alert('Update story successd!', 's');
                            Atom.broadcastMsg('refreshStorys');
                        }, e => {
                            $modal.alertDetail('Update story error', Atom.formatError(e), 'e');
                        })
                    })
                    .cancel(function () {
                        cloneA2B(bakU, u);
                    });
            },
            delStory: function (u) {
                const db = getDB();
                return new Promise(function (resolve) {
                    $modal.alertDetail(`Are you sure want to delete [${u.name}]?`,
                        `You can't undo this action!`, 'w')
                        .ok(function () {
                            if (app.useMysql) {
                                $http.post(`${app.serverUrl}/story/delete`)
                                    .responseJson()
                                    .jsonData(u)
                                    .then(function (rsp) {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            $modal.alertDetail('Delete story error', data[1], 'e');
                                            resolve();
                                            return;
                                        }
                                        resolve(true);
                                        $modal.alert('Delete story successd!', 's');
                                        Atom.broadcastMsg('refreshStorys');
                                    }, function (e) {
                                        $modal.alertDetail('Delete story error', Atom.formatError(e), 'e');
                                        resolve();
                                    })
                                return;
                            }
                            Promise.all([
                                db.delete('story', u.id)
                            ]).then(function () {
                                $modal.alert('Delete story successd!', 's');
                                Atom.broadcastMsg('refreshStorys');
                                resolve(true);
                            }, e => {
                                $modal.alertDetail('Delete story error', Atom.formatError(e), 'e');
                                resolve();
                            })
                        })
                        .cancel(resolve);
                });
            },
        }
    }]);
})(Atom.app('wppStore-admin'))