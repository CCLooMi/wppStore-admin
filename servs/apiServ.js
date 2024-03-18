/**
 * Created by guest on 2024/1/19 10:35:41.
 */
(function (app) {
    app.factory('S_api', ['$idb', '$modal', '$http', '$suggest', function ($idb, $modal, $http, $suggest) {
        var loadSugs = false;
        function getDB() {
            return $idb.get('wpp-store-admin');
        }
        if (!loadSugs) {
            $suggest.regJsSuggestions(function (monaco, kd, insertRule, sugs) {
                loadSugs = true;
                const a = [];
                a.push(['SELECT-demo', 'sql-select-demo', 'sql.SELECT("*").FROM("demo","d).WHERE("d.id=?","a123").Execute(db).GetResultAsMapList()']);
                a.push(['INSERT-demo', 'sql-insert-demo', 'sql.INSERT_INTO("demo","id","name").VALUES("a123","abc").ON_DUPLICATE_KEY_UPDATE().SET("name = ?", "abc").Execute(db).Update()']);
                a.push(['UPDATE-demo', 'sql-update-demo', 'sql.UPDATE("demo","d").SET("d.name=?","abc").WHERE("d.id=?","a123").Execute(db).Update()']);
                a.push(['DELETE-demo', 'sql-delete-demo', 'sql.DELETE().FROM("demo").WHERE("id=?","a123").Execute(db).Update()']);
                a.push(['byPage(func(sm))-demo', 'sql-by-page', 'byPage(function(sm,opts){sm.SELECT("*").FROM("sys_user","u").WHERE("u.username LIKE ?","%abc%")});\nfalse;']);

                a.push(['SELECT(...cols)-SM', 'SELECT', 'SELECT("*")']);
                a.push(['SELECT_AS(column,alias)-SM', 'SELECT_AS', 'SELECT_AS("${1}","${2}")']);
                a.push(['SELECT_SM(sm,alias)-SM', 'SELECT_SM', 'SELECT_SM("${1}","${2}")']);
                a.push(['SELECT_EXP(exp,alias)-SM', 'SELECT_EXP', 'SELECT_EXP("${1}","${2}")']);
                a.push(['FROM(table,alias)-SM-DM', 'FROM', 'FROM("${1}","${2}")']);
                a.push(['JOIN(table,alias,...args)-SM', 'JOIN', 'JOIN("${1}","${2}",${3})']);
                a.push(['JOIN_ON(table,alias,on,...args)-SM', 'JOIN_ON', 'JOIN_ON("${1}","${2}","${3}",${4})']);
                a.push(['LEFT_JOIN(table,alias,on,...args)-SM-UM', 'LEFT_JOIN', 'LEFT_JOIN("${1}","${2}","${3}",${4})']);
                a.push(['RIGHT_JOIN(table,alias,on,...args)-SM-UM', 'RIGHT_JOIN', 'RIGHT_JOIN("${1}","${2}","${3}",${4})']);
                a.push(['INNER_JOIN(table,alias,on,...args)-SM-UM', 'INNER_JOIN', 'INNER_JOIN("${1}","${2}","${3}",${4})']);
                a.push(['UNION(sm,...args)-SM', 'UNION', 'UNION(${1},${2})']);
                a.push(['UNION_ALIAS(sm,alias,...args)-SM', 'UNION_ALIAS', 'UNION_ALIAS(${1},"${2}",${3})']);
                a.push(['UNION_ALL(sm,...args)-SM', 'UNION_ALL', 'UNION_ALL(${1},${2})']);
                a.push(['UNION_ALL_ALIAS(sm,alias,...args)-SM', 'UNION_ALL_ALIAS', 'UNION_ALL_ALIAS(${1},"${2}",${3})']);
                a.push(['WHERE(where,...args)-SM-UM-DM', 'WHERE', 'WHERE("${1}",${2})']);
                a.push(['WHERE_IN(column,inOrNotIn,...args)-SM-UM-DM', 'WHERE_IN', 'WHERE_IN("${1}","${2}",${3})']);
                a.push(['WHERE_SUBQUERY(column,inOrNotIn,sm)-SM-UM-DM', 'WHERE_SUBQUERY', 'WHERE_SUBQUERY("${1}","${2}",${3})']);
                a.push(['AND(and,...args)-SM-UM-DM', 'AND', 'AND("${1}",${2})']);
                a.push(['AND_IN(column,inOrNotIn,...args)-SM-UM-DM', 'AND_IN', 'AND_IN("${1}","${2}",${3})']);
                a.push(['AND_SUBQUERY(column,inOrNotIn,sm)-SM-UM-DM', 'AND_SUBQUERY', 'AND_SUBQUERY("${1}","${2}",${3})']);
                a.push(['OR(or,...args)-SM-UM-DM', 'OR', 'OR("${1}",${2})']);
                a.push(['OR_IN(column,inOrNotIn,...args)-SM-UM-DM', 'OR_IN', 'OR_IN("${1}","${2}",${3})']);
                a.push(['OR_SUBQUERY(column,inOrNotIn,sm)-SM-UM-DM', 'OR_SUBQUERY', 'OR_SUBQUERY("${1}","${2}",${3})']);
                a.push(['GROUP_BY(...gbs)-SM', 'GROUP_BY', 'GROUP_BY("${1}")']);
                a.push(['ORDER_BY(...obs)-SM', 'ORDER_BY', 'ORDER_BY("${1}")']);
                a.push(['LIMIT(...limits)-SM-UM', 'LIMIT', 'LIMIT(${1})']);
                a.push(['ExpSQL()-SM', 'ExpSQL', 'ExpSQL()']);
                a.push(['Execute(db)-SM', 'Execute', 'Execute(db)']);
                a.push(['ColumnAlias()-SM', 'Column-Alias', 'ColumnAlias()']);
                a.push(['GetResultAsMap()-SMExecutor', 'Get-Result-As-Map', 'GetResultAsMap()']);
                a.push(['GetResultAsMapList()-SMExecutor', 'Get-Result-As-Map-List', 'GetResultAsMapList()']);
                a.push(['GetResultAsList()-SMExecutor', 'Get-Result-As-List', 'GetResultAsList()']);
                a.push(['ExtractorResultSet(extractor)-SMExecutor', 'Extractor-Result-Set', 'ExtractorResultSet(${1})']);
                a.push(['ExtractorResultTo(out)-SMExecutor', 'Extractor-Result-To', 'ExtractorResultTo(${1})']);
                a.push(['RowsToOut(rows,out)-SMExecutor', 'Rows-To-Out', 'RowsToOut(${1},${2})']);
                a.push(['Count()-SMExecutor', 'Count', 'Count()']);
                a.push(['GetResultAsListByPage(pageNumber,pageSize,totalNumber)-SMExecutor', 'Get-Result-As-List-By-Page', 'GetResultAsListByPage(${1},${2},${3})']);
                a.push(['GetResultAsListByPageWithFilter(pageNumber,pageSize,totalNumber,filterFunc)-SMExecutor', 'Get-Result-As-List-By-Page-With-Filter', 'GetResultAsListByPageWithFilter(${1},${2},${3},${4})']);
                a.push(['DefaultIfNull(value,defaultValue)-SMExecutor', 'Default-If-Null', 'DefaultIfNull(${1},${2})']);
                a.push(['RowsToMap(rows)-SMExecutor', 'Rows-To-Map', 'RowsToMap(${1})']);
                a.push(['RowsToMaps(rows)-SMExecutor', 'Rows-To-Maps', 'RowsToMaps(${1})']);
                a.push(['ColumnToList(rows,colIdx)-SMExecutor', 'Column-To-List', 'ColumnToList(${1},${2})']);

                a.push(['INSERT_INTO(table,...columns)-IM', 'INSERT_INTO', 'INSERT_INTO("${1}","${2}")']);
                a.push(['INTO_COLUMNS(...columns)-IM', 'INTO_COLUMNS', 'INTO_COLUMNS("${1}")']);
                a.push(['VALUES(...values)-IM', 'VALUES', 'VALUES(${1})']);
                a.push(['VALUES_SM(sm)-IM', 'VALUES_SM', 'VALUES_SM(${1})']);
                a.push(['ON_DUPLICATE_KEY_UPDATE()-IM', 'ON_DUPLICATE_KEY_UPDATE', 'ON_DUPLICATE_KEY_UPDATE()']);
                a.push(['SET(set,...args)-IM', 'SET', 'SET("${1}",${2})']);
                a.push(['SetBatchArgs(...[]batchArgs)-IM-UM-DM', 'Set-Batch-Args', 'SetBatchArgs(${1})']);
                a.push(['Execute(db)-IM-UM-DM', 'Execute', 'Execute(db)']);
                a.push(['Update()-IMExecutor', 'Update', 'Update()']);
                a.push(['BatchUpdate()-IMExecutor', 'BatchUpdate', 'BatchUpdate()']);

                a.push(['UPDATE(table,alias)-UM', 'UPDATE', 'UPDATE("${1}","${2}")']);
                a.push(['SET(set,...args)-UM', 'SET', 'SET("${1}",${2})']);

                a.push(['DELETE()-DM', 'DELETE', 'DELETE()']);

                a.push(['Exp(sm)-exp', 'exp-Exp', 'exp.Exp(${1})']);
                a.push(['ExpStr(exp)-exp', 'exp-ExpStr', 'exp.ExpStr(${1})']);
                a.push(['NOW()-exp', 'exp-NOW', 'exp.NOW()']);
                a.push(['UUID()-exp', 'exp-UUID', 'exp.UUID()']);
                a.push(['Exp()-exp', 'Exp', 'Exp()']);
                a.push(['Args()-exp', 'Args', 'Args()']);

                a.push(['request', 'request', 'request']);
                a.push(['reqBody', 'req-Body', 'reqBody']);
                a.push(['msgOk(data)', 'msg-ok', 'msgOk(${1})']);
                a.push(['msgError(data)', 'msg-error', 'msgError(${1})']);
                a.push(['msgOks(...datas)', 'msg-oks', 'msgOks(${1})']);
                a.push(['UUID()', 'UUID', 'UUID()']);
                a.push(['uuid()', 'uuid', 'uuid()']);
                a.push(['userInfo', 'user-Info', 'userInfo']);
                a.push(['db', 'db', 'db']);
                a.push(['rdb', 'rdb-redis', 'rdb']);
                a.push(['cfg', 'cfg-config', 'cfg']);
                a.push(['sql', 'sql', 'sql']);
                a.push(['fetch(url,opts)', 'fetch', 'fetch(${1},${2})']);
                a.push(['$(html)', '$', '$(${1})']);
                a.push(['exit()', 'exit', 'exit()']);
                a.forEach(ai => sugs.push({
                    label: ai[0],
                    kind: kd.Snippet,
                    filterText: ai[1],
                    insertTextRules: insertRule.InsertAsSnippet,
                    insertText: ai[2]
                }));
            });
        }
        return {
            byPage: function (pg) {
                if (app.useMysql) {
                    return $http.post(`${app.serverUrl}/api/byPage`)
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
                return db.byPage("api", pg);
            },
            newApi: function () {
                const db = getDB();
                const $this = this;
                return new Promise(function (resolve, reject) {
                    const newApi = {};
                    const scope = {
                        api: newApi, execute: function (a, args) {
                            $this.execute(a, args).then(setResult, setResult);
                            return false;
                        }
                    };
                    function setResult(r) {
                        scope.result = r;
                    };
                    $modal.dialog('New Api', app.getPaths('views/modal/newApi.atom?'), scope)
                        .width(768).height(555)
                        .ok(function () {
                            newApi.id = uuid();
                            if (app.useMysql) {
                                $http.post(`${app.serverUrl}/api/saveUpdate`)
                                    .responseJson()
                                    .jsonData(newApi)
                                    .then(function (rsp) {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            $modal.alertDetail('Save api error', data[1], 'e');
                                            resolve();
                                            return;
                                        }
                                        resolve(newApi);
                                        $modal.alert('Add api successd!', 's');
                                        Atom.broadcastMsg('refreshApis');
                                    }, function (e) {
                                        $modal.alertDetail('Save api error', Atom.formatError(e), 'e');
                                        resolve();
                                    })
                                return;
                            }
                            db.put('api', newApi)
                                .then(function () {
                                    resolve(newApi);
                                    $modal.alert('Add api successd!', 's');
                                    Atom.broadcastMsg('refreshApis');
                                }, function (e) {
                                    $modal.alertDetail('Save api error', Atom.formatError(e), 'e');
                                    resolve();
                                });
                        })
                        .cancel(function () {
                            resolve();
                        })
                        .ftBtns("Run", () => scope.execute(scope.api, scope.args));
                });
            },
            editApi: function (u) {
                const db = getDB();
                const $this = this;
                const bakU = cloneFrom(u);
                const scope = {
                    api: u, execute: function (a, args) {
                        $this.execute(a, args).then(setResult, setResult);
                        return false;
                    }
                };
                function setResult(r) {
                    scope.result = r;
                };
                function saveUpdate() {
                    if (app.useMysql) {
                        $http.post(`${app.serverUrl}/api/saveUpdate`)
                            .responseJson()
                            .jsonData(u)
                            .then(function (rsp) {
                                const data = rsp.response;
                                if (data[0]) {
                                    $modal.alertDetail('Update api error', data[1], 'e');
                                    return;
                                }
                                $modal.toastAlert('Update api successd!', 's');
                                Atom.broadcastMsg('refreshApis');
                            }, function (e) {
                                $modal.alertDetail('Update api error', Atom.formatError(e), 'e');
                            })
                        return;
                    }
                    db.put('api', u).then(function () {
                        $modal.toastAlert('Update api successd!', 's');
                        Atom.broadcastMsg('refreshApis');
                    }, e => {
                        $modal.alertDetail('Update api error', Atom.formatError(e), 'e');
                    })
                }
                $modal.dialog('Edit Api', app.getPaths('views/modal/newApi.atom'), scope)
                    .width(768).height(555)
                    .ok(saveUpdate)
                    .cancel(function () {
                        cloneA2B(bakU, u);
                    })
                    .ftBtns("Run", () => scope.execute(scope.api, scope.args), "save", () => (saveUpdate(), false));
            },
            delApi: function (u) {
                const db = getDB();
                return new Promise(function (resolve) {
                    $modal.alertDetail(`Are you sure want to delete [${u.desc}]?`,
                        `You can't undo this action!`, 'w')
                        .ok(function () {
                            if (app.useMysql) {
                                $http.post(`${app.serverUrl}/api/delete`)
                                    .responseJson()
                                    .jsonData(u)
                                    .then(function (rsp) {
                                        const data = rsp.response;
                                        if (data[0]) {
                                            $modal.alertDetail('Delete api error', data[1], 'e');
                                            resolve();
                                            return;
                                        }
                                        resolve(true);
                                        $modal.alert('Delete api successd!', 's');
                                        Atom.broadcastMsg('refreshApis');
                                    }, function (e) {
                                        $modal.alertDetail('Delete api error', Atom.formatError(e), 'e');
                                        resolve();
                                    })
                                return;
                            }
                            Promise.all([
                                db.delete('api', u.id)
                            ]).then(function () {
                                $modal.alert('Delete api successd!', 's');
                                Atom.broadcastMsg('refreshApis');
                                resolve(true);
                            }, e => {
                                $modal.alertDetail('Delete api error', Atom.formatError(e), 'e');
                                resolve();
                            })
                        })
                        .cancel(resolve);
                });
            },
            execute: function (a, args) {
                if (app.useMysql) {
                    var ags = [];
                    try {
                        ags = JSON.parse(args);
                    } catch (e) {
                        if (args) {
                            ags.push(args);
                        }
                    }
                    return new Promise(function (resolve, reject) {
                        const jsonData = { id: a.id, args: ags, script: a.script };
                        $http.post(`${app.serverUrl}/api/execute`)
                            .responseBlob()
                            .jsonData(jsonData)
                            .then(function (rsp) {
                                const data = rsp.response;
                                if (data.type.endsWith("json")) {
                                    data.text().then(json => JSON.parse(json))
                                        .then(data => {
                                            if (data[0]) {
                                                reject(data[1]);
                                                return;
                                            }
                                            resolve(JSON.stringify(data[1], ' ', 2));
                                        },reject);
                                }else{
                                    downloadFile(URL.createObjectURL(data),"GET")
                                    .filename(Date.now());
                                    resolve(data);
                                }
                            }, function (e) {
                                reject(Atom.formatError(e));
                            })
                    });
                }
                return new Promise(function (resolve) {
                    resolve("");
                });
            }
        }
    }]);
})(Atom.app('wppStore-admin'))