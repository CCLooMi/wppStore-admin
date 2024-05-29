/**
 * Created by Guest on 2024/4/12 16:52:56.
 */
(function (app) {
    app.factory('S_story', ['$idb', '$modal', '$http', '$fup','S_editor', function ($idb, $modal, $http, $fup, S_editor) {
        function getDB() {
            return $idb.get('wpp-store-admin');
        }
        function toastError(e) {
            $modal.toastAlert(Atom.formatError(e), 'e');
        }
        function onMax(ele, e) {
            let tg = e.target;
            if (tg.hasClass('btn')) {
                if (tg.hasClass('btn-close')) {
                    let to = setTimeout(function () {
                        clearTimeout(to);
                        ele.removeClass('max');
                    }, 300);
                }
                return;
            }
            if (ele.hasClass('max')) {
                return;
            }
            ele.addClass('max');
        }
        return {
            byPage: function (pg) {
                if (app.useMysql) {
                    return $http.post(app.getApiUrl('/wstory/byPage'))
                        .responseJson()
                        .jsonData(pg)
                        .then(rsp => {
                            const data = rsp.response;
                            if (data[0] || !data[1]) {
                                return [];
                            }
                            let d = data[1].data;
                            for (var i = 0; i < d.length; i++) {
                                d[i].jc = JSON.parse(d[i].content);
                                delete d[i].content;
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
                    const jc = {
                        id: id,
                        bgImgUrl: `/images/wios/208.jpg`,
                        bgVideoUrl: ``,
                        tc: [''], fc: [''],
                        fcColor: '#ffffff', tcColor: '#ffffff',
                        title: '',
                        contentBlock: 'Welcome',
                    };
                    const ns = { jc: jc };
                    const scope = { story: ns };
                    dialogNewStory(ns);
                    function dialogNewStory(ns) {
                        const scope = {
                            story: ns,
                            onMax: onMax,
                            regAction: S_editor.regAction
                        };
                        $modal.dialog('New Story', app.getPaths('views/modal/newStory.atom'), scope)
                            .width(768)
                            .ok(function () {
                                if (jc.bgFile) {
                                    $fup.uploadFile(jc.bgFile)
                                        .then(saveStory, toastError);
                                    return;
                                }
                                saveStory();
                            }).cancel(() => 0);
                    }
                    function saveStory() {
                        const f = jc.bgFile
                        const story = {
                            content: JSON.stringify({
                                bgFid: f?.id,
                                bgType: f?.type,
                                tc: jc.tc, fc: jc.fc,
                                fcColor: jc.tcColor, tcColor: jc.tcColor,
                                title: jc.title,
                                contentBlock: jc.contentBlock,
                                body: jc.body
                            }),
                            status: "inactive"
                        }
                        if (app.useMysql) {
                            $http.post(app.getApiUrl('/wstory/saveUpdate'))
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
                const scope = {
                    story: u,//json content
                    onMax: onMax,
                    regAction: S_editor.regAction
                };
                if (!u.jc.bgImgUrl || !u.jc.bgVideoUrl) {
                    const type = u.jc.bgType;
                    if (type) {
                        if (type.startsWith("image")) {
                            u.jc.bgImgUrl = `http://localhost:4040/upload/${u.jc.bgFid}`;
                        } else if (type.startsWith("video")) {
                            u.jc.bgVideoUrl = `http://localhost:4040/upload/${u.jc.bgFid}`;
                        }
                    }
                }
                $modal.dialog('Edit Story', app.getPaths('views/modal/newStory.atom'), scope)
                    .width(768)
                    .ok(function () {
                        if (u.jc.bgFile instanceof File) {
                            $fup.uploadFile(u.jc.bgFile)
                                .then(updateStory, toastError);
                            return;
                        }
                        updateStory();
                    })
                    .cancel(function () {
                        cloneA2B(bakU, u);
                    });
                function updateStory() {
                    const f = u.jc.bgFile
                    delete u.jc.bgFile;
                    u.jc.bgFid = f?.id;
                    u.jc.bgType = f?.type;
                    const story = {
                        id: u.id,
                        content: JSON.stringify(u.jc),
                        status: u.status
                    }
                    if (app.useMysql) {
                        $http.post(app.getApiUrl('/wstory/saveUpdate'))
                            .responseJson()
                            .jsonData(story)
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
                }
            },
            delStory: function (u) {
                const db = getDB();
                return new Promise(function (resolve) {
                    $modal.alertDetail(`Are you sure want to delete [${u.jc.title}]?`,
                        `You can't undo this action!`, 'w')
                        .ok(function () {
                            if (app.useMysql) {
                                delete u.jc;
                                $http.post(app.getApiUrl('/wstory/delete'))
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
            preview: function (u) {
                const scope = {
                    story: u,
                    onMax: onMax
                };
                if (!u.jc.bgImgUrl || !u.jc.bgVideoUrl) {
                    const type = u.jc.bgType;
                    if (type) {
                        if (type.startsWith("image")) {
                            u.jc.bgImgUrl = `http://localhost:4040/upload/${u.jc.bgFid}`;
                        } else if (type.startsWith("video")) {
                            u.jc.bgVideoUrl = `http://localhost:4040/upload/${u.jc.bgFid}`;
                        }
                    }
                }
                $modal.dialog('Preview Story', app.getPaths('views/modal/previewStory.atom'), scope)
                    .width(490)
                    .canceledOnTouchOutside(true)
            }
        }
    }]);
})(Atom.app('wppStore-admin'))