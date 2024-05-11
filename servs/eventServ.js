/**
 * Created by Guest on 2024/4/12 16:52:25.
 */
(function (app) {
    app.factory('S_event', ['$idb', '$modal', '$http', '$fup', function ($idb, $modal, $http, $fup) {
        function getDB() {
            return $idb.get('wpp-store-admin');
        }
        function toastError(e) {
            $modal.toastAlert(Atom.formatError(e), 'e');
        }
        return {
            byPage: function (pg) {
                if (app.useMysql) {
                    return $http.post(`${app.serverUrl}/wevent/byPage`)
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
                return db.byPage("event", pg);
            },
            newEvent: function () {
                const db = getDB();
                return new Promise(function (resolve, reject) {
                    const id = uuid();
                    const jc = {
                        id: id,
                        bgImgUrl: `/images/wios/208.jpeg`,
                        bgVideoUrl: ``,
                        tc: [''],fc: [''],
                        fcColor:'#ffffff',tcColor:'#ffffff',
                        title: `Promoting Exclusive Features\n\nUnmissable New Game`,
                        contentBlock: `Big update\n\n# Within the painting's realm, all things possess a soul.\n\nWelcome to the 'Spirit of Art' season.`,
                    };
                    const ev = {jc:jc};
                    const scope = { event: ev };
                    dialogNewEvent(ev);
                    function dialogNewEvent(e) {
                        const scope = {
                            event: e,
                            onMax: function (ele) {
                                if (ele.hasClass('max')) {
                                    ele.removeClass('max');
                                    return;
                                }
                                ele.addClass('max');
                            }
                        };
                        $modal.dialog('New Event', app.getPaths('views/modal/newEvent.atom?'), scope)
                            .width(768)
                            .ok(function () {
                                if (e.jc.bgFile) {
                                    $fup.uploadFile(e.jc.bgFile)
                                        .then(saveEvent, toastError);
                                    return;
                                }
                                saveEvent();
                            }).cancel(() => 0);
                    }
                    function saveEvent() {
                        const f = jc.bgFile
                        const event = {
                            content: JSON.stringify({
                                bgFid: f?.id,
                                bgType: f?.type,
                                tc: jc.tc,fc: jc.fc,
                                fcColor:jc.tcColor,tcColor:jc.tcColor,
                                title: jc.title,
                                contentBlock: jc.contentBlock,
                                body: jc.body
                            }),
                            status: "inactive",
                            startDate:ev.startDate,
                            endDate:ev.endDate
                        }
                        if (app.useMysql) {
                            $http.post(`${app.serverUrl}/wevent/saveUpdate`)
                                .responseJson()
                                .jsonData(event)
                                .then(function (rsp) {
                                    const data = rsp.response;
                                    if (data[0]) {
                                        $modal.alertDetail('Save event error', data[1], 'e');
                                        resolve();
                                        return;
                                    }
                                    resolve(event);
                                    $modal.alert('Add event successd!', 's');
                                    Atom.broadcastMsg('refreshEvents');
                                }, function (e) {
                                    $modal.alertDetail('Save event error', Atom.formatError(e), 'e');
                                    resolve();
                                })
                            return;
                        }
                        db.put('event', event)
                            .then(function () {
                                resolve(event);
                                $modal.alert('Add event successd!', 's');
                                Atom.broadcastMsg('refreshEvents');
                            }, function (e) {
                                toastError(e), resolve();
                            });
                    }
                });
            },
            editEvent: function (u) {
                const db = getDB();
                const bakU = cloneFrom(u);
                const scope = {
                    event: u,//jc:json content
                    onMax: function (ele) {
                        if (ele.hasClass('max')) {
                            ele.removeClass('max');
                            return;
                        }
                        ele.addClass('max');
                    }
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
                $modal.dialog('Edit Event', app.getPaths('views/modal/newEvent.atom'), scope)
                    .width(768)
                    .ok(function () {
                        if (u.jc.bgFile instanceof File) {
                            $fup.uploadFile(u.jc.bgFile)
                                .then(updateEvent, toastError);
                            return;
                        }
                        updateEvent();
                    })
                    .cancel(function () {
                        cloneA2B(bakU, u);
                    });
                function updateEvent() {
                    const f = u.jc.bgFile
                    delete u.jc.bgFile;
                    u.jc.bgFid=f?.id;
                    u.jc.bgType= f?.type;
                    const event = {
                        id:u.id,
                        content: JSON.stringify(u.jc),
                        status: u.status,
                        startDate:u.startDate,
                        endDate:u.endDate
                    }
                    if (app.useMysql) {
                        $http.post(`${app.serverUrl}/wevent/saveUpdate`)
                            .responseJson()
                            .jsonData(event)
                            .then(function (rsp) {
                                const data = rsp.response;
                                if (data[0]) {
                                    $modal.alertDetail('Update event error', data[1], 'e');
                                    return;
                                }
                                $modal.alert('Update event successd!', 's');
                                Atom.broadcastMsg('refreshEvents');
                            }, function (e) {
                                $modal.alertDetail('Update event error', Atom.formatError(e), 'e');
                            })
                        return;
                    }
                    db.put('event', u).then(function () {
                        $modal.alert('Update event successd!', 's');
                        Atom.broadcastMsg('refreshEvents');
                    }, e => {
                        $modal.alertDetail('Update event error', Atom.formatError(e), 'e');
                    })
                }
            },
            delEvent: function (u) {
                const db = getDB();
                return new Promise(function (resolve) {
                    $modal.alertDetail(`Are you sure want to delete [${u.jc.title}]?`,
                        `You can't undo this action!`, 'w')
                        .ok(function () {
                            if (app.useMysql) {
                                delete u.jc;
                                $http.post(`${app.serverUrl}/wevent/delete`)
                                    .responseJson()
                                    .jsonData(u)
                                    .then(function (rsp) {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            $modal.alertDetail('Delete event error', data[1], 'e');
                                            resolve();
                                            return;
                                        }
                                        resolve(true);
                                        $modal.alert('Delete event successd!', 's');
                                        Atom.broadcastMsg('refreshEvents');
                                    }, function (e) {
                                        $modal.alertDetail('Delete event error', Atom.formatError(e), 'e');
                                        resolve();
                                    })
                                return;
                            }
                            Promise.all([
                                db.delete('event', u.id)
                            ]).then(function () {
                                $modal.alert('Delete event successd!', 's');
                                Atom.broadcastMsg('refreshEvents');
                                resolve(true);
                            }, e => {
                                $modal.alertDetail('Delete event error', Atom.formatError(e), 'e');
                                resolve();
                            })
                        })
                        .cancel(resolve);
                });
            },
            preview: function (u) {
                const scope = {
                    event: u,
                    onMax: function (ele) {
                        if (ele.hasClass('max')) {
                            ele.removeClass('max');
                            return;
                        }
                        ele.addClass('max');
                    }
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
                $modal.dialog('Preview Event', app.getPaths('views/modal/previewEvent.atom'), scope)
                    .width(490)
                    .canceledOnTouchOutside(true)
                    .role('alert');
            }
        }
    }]);
})(Atom.app('wppStore-admin'))