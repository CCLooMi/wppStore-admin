/**
 * Created by Guest on 2024/4/12 16:52:56.
 */
(function (app) {
    app.factory('S_story', ['$idb', '$modal', '$http', '$less', function ($idb, $modal, $http, $less) {
        function getDB() {
            return $idb.get('wpp-store-admin');
        }
        let lastType = 'a';
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
                    const newStory = { id: id, type: lastType };
                    let timeout;
                    const scope = { story: newStory };
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
                    $modal.dialog('Select Story Template', app.getPaths('views/modal/selectStory.atom?'), scope)
                        .width(768).height(480)
                        .ok(function () {
                            lastType = newStory.type;
                            const se = this.getBody().findOne(`input[value='${lastType}']+s-v`);
                            se.setAttribute('ckeditor', '');
                            const t = this.getBody().findOne('template');
                            const df = t.content;
                            df.append(se);

                            const styleScript = df.querySelector('script');
                            styleScript.remove();
                            $less.renderToStyleElement(styleScript.innerHTML)
                                .then(style => {
                                    df.append(style);
                                    editStory(df);
                                });
                        })
                        .cancel(resolve);
                    function editStory(df) {
                        const blobUrl = URL.createObjectURL(new Blob([''], { type: "text/html" }));
                        function revokeUrl() {
                            URL.revokeObjectURL(blobUrl);
                        }
                        const iframe = document.createElement('iframe');
                        iframe.src = blobUrl;
                        iframe.onload = function () {
                            const iwindow = iframe.contentWindow;
                            const doc = iframe.contentDocument || iwindow.document;
                            doc.body.appendChild(df);
                            const ckUrl = require.toUrl("ckeditor");
                            $http
                                .get(ckUrl)
                                .responseBlob()
                                .then(r => r.response)
                                .then(blob => {
                                    const comStyleUrl = Paths.get(Atom.swScope(), "styles/common.css");
                                    const script = document.createElement('script');
                                    script.src = URL.createObjectURL(blob);
                                    doc.head.append(script);
                                    script.onload = function () {
                                        const sv = doc.body.querySelector('s-v');
                                        const fTitle = sv.querySelector('.face>.title');
                                        const fCBlock = sv.querySelector('.face>.footer>.content-block');
                                        const bod = sv.querySelector('.face+.body');
                                        const eles = [fTitle, fCBlock, bod];
                                        const opts = { styles: [comStyleUrl],autoHideToolbar: true};
                                        eles.forEach(function (e) {
                                            if (e) {
                                                console.log(['e', e]);
                                                iwindow.InlineEditor.create(e, opts).then(editor => {
                                                    console.log("ckeditor init ok");
                                                });
                                            }
                                        });
                                    };
                                });
                        }
                        const style = document.createElement('style');
                        style.setAttribute('type', 'text/less');
                        style.innerHTML = `iframe{height: inherit;width: inherit;padding: 0;border: none !important;}`;
                        const ddf = document.createDocumentFragment();
                        ddf.append(iframe, style);
                        $modal.dialog('Edit Story Template', ddf, scope)
                            .width(768).height(480)
                            .ok(function () {

                            })
                            .cancel(resolve)
                            .onDestroy(revokeUrl);
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