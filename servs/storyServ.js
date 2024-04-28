/**
 * Created by Guest on 2024/4/12 16:52:56.
 */
(function (app) {
    app.factory('S_story', ['$idb', '$modal', '$http', function ($idb, $modal, $http) {
        function getDB() {
            return $idb.get('wpp-store-admin');
        }
        function uploadFile(bfile, upUrl) {
            var sv = document.createElement('s-v');
            var label = document.createElement('label');
            var pg = document.createElement('progress');
            pg.style.width = '100%';
            sv.style.display = 'grid';
            sv.append(label, pg);
            label.innerHTML = 'Upload file';
            function setPgLabel(info) {
                label.innerHTML = info || onprogress.label;
            }
            return new Promise(function (resolve, reject) {
                pg.max = 100;
                pg.value = 0;
                var workerUrl = '../js/file/hashWorker.js??';
                var deps = ['../js/idb.js??',
                    '../js/crypto-js/crypto-js.js??'];
                ld('fileUp').then(function ({ FileUp }) {
                    $modal.dialog('', sv)
                        .role('alert')
                        .width(555)
                        .getModal(function (md) {
                            bfile.progress = function (p) {
                                p.applyTo(pg);
                                setPgLabel(`${p.type} file speed [${p.speed}]`);
                            }
                            var fu = new FileUp(sv, {
                                finput: false,
                                uploadUrl: upUrl,
                                worker: workerUrl,
                                deps: deps,
                                onComplete: function () {
                                    resolve(bfile);
                                    md.close();
                                }
                            });
                            fu.addFiles(bfile);
                        });
                }, reject)
            })
        }
        function toastError(e) {
            $modal.toastAlert(Atom.formatError(e), 'e');
        }
        return {
            byPage: function (pg) {
                if (app.useMysql) {
                    return $http.post(`${app.serverUrl}/wstory/byPage`)
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
                        bgImgUrl: `/images/Solid Colors/Space Gray.png`,
                        bgVideoUrl: ``,
                        tc: ['blur-w'],
                        title: `Promoting Exclusive Features\n\nUnmissable New Game`,
                        contentBlock: `Big update\n\n# Within the painting's realm, all things possess a soul.\n\nWelcome to the 'Spirit of Art' season.`,
                        fc: ['blur-w']
                    };
                    let timeout;
                    const scope = { story: newStory };
                    dialogNewStory(newStory);
                    function dialogNewStory(s) {
                        const scope = {
                            story: newStory,
                            onMax: function (ele) {
                                if (ele.hasClass('max')) {
                                    ele.removeClass('max');
                                    return;
                                }
                                ele.addClass('max');
                            }
                        };
                        $modal.dialog('New Story', app.getPaths('views/modal/newStory.atom?'), scope)
                            .width(768)
                            .ok(function () {
                                if (newStory.bgFile) {
                                    uploadFile(newStory.bgFile, 'ws://localhost:4040/fileUp')
                                        .then(saveStory, toastError);
                                    return;
                                }
                                saveStory();
                            })
                    }
                    function saveStory() {
                        const f = newStory.bgFile
                        const story = {
                            content: JSON.stringify({
                                bgFid: f?.id,
                                bgType: f?.type,
                                tc: newStory.tc,
                                fc: newStory.fc,
                                title: newStory.title,
                                contentBlock: newStory.contentBlock
                            }),
                            status: "inactive"
                        }
                        if (app.useMysql) {
                            $http.post(`${app.serverUrl}/wstory/saveUpdate`)
                                .responseJson()
                                .jsonData(story)
                                .then(function (rsp) {
                                    const data = rsp.response;
                                    if (data[0]) {
                                        $modal.alertDetail('Save story error', data[1], 'e');
                                        resolve();
                                        return;
                                    }
                                    resolve(story);
                                    $modal.alert('Add story successd!', 's');
                                    Atom.broadcastMsg('refreshStorys');
                                }, function (e) {
                                    $modal.alertDetail('Save story error', Atom.formatError(e), 'e');
                                    resolve();
                                })
                            return;
                        }
                        db.put('story', story)
                            .then(function () {
                                resolve(story);
                                $modal.alert('Add story successd!', 's');
                                Atom.broadcastMsg('refreshStorys');
                            }, function (e) {
                                toastError(e), resolve();
                            });
                    }
                });
            },
            editStory: function (u) {
                const db = getDB();
                const bakU = cloneFrom(u);

                let timeout;
                const scope = {
                    story: JSON.parse(u.content),
                    onMax: function (ele) {
                        if (ele.hasClass('max')) {
                            ele.removeClass('max');
                            return;
                        }
                        ele.addClass('max');
                    }
                };
                $modal.dialog('Edit Story', app.getPaths('views/modal/newStory.atom'), scope)
                    .width(768)
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