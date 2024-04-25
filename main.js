/**
 * Created by guest on 11/16/2023 9:05:55 AM.
 */
(function (app) {
    app.useMysql = true;
    app.serverUrl = "http://localhost:4040";
    app.idbName = "wpp-store-admin";
    app.state("main", {
        title: "main",
        url: "/main",
        templateUrl: "views/main.atom?",
        deps: ["ctrls/mainCtrl.js?", "servs/menuServ.js?", "servs/userServ.js?"]
    }).state("login", {
        title: "login",
        url: "/login",
        templateUrl: "views/login.atom?",
        deps: ["ctrls/loginCtrl.js?", "servs/userServ.js?"]
    }).state("main.roles", {
        title: "roles",
        url: "/roles",
        templateUrl: "views/roles.atom?",
        deps: ["ctrls/roleCtrl.js?", "servs/roleServ.js?", "ctrls/userCtrl.js?", "ctrls/menuCtrl.js?", "servs/menuServ.js?"]
    }).state("main.users", {
        title: "users",
        url: "/users",
        templateUrl: "views/users.atom?",
        deps: ["ctrls/userCtrl.js?", "servs/roleServ.js?", "ctrls/roleCtrl.js?"]
    }).state("main.menus", {
        title: "menus",
        url: "/menus",
        templateUrl: "views/menus.atom?",
        deps: ["ctrls/menuCtrl.js?", "servs/menuServ.js?"]
    }).state("main.apis", {
        title: "main.apis",
        url: "/apis",
        templateUrl: "views/apis.atom?",
        deps: ["servs/apiServ.js?", "ctrls/apiCtrl.js?"]
    }).state("main.configs", {
        title: "main.configs",
        url: "/configs",
        templateUrl: "views/configs.atom?",
        deps: ["servs/configServ.js?", "ctrls/configCtrl.js?"]
    }).state("main.uploads", {
        title: "main.uploads",
        url: "/uploads",
        templateUrl: "views/uploads.atom?",
        deps: ["servs/uploadServ.js?", "ctrls/uploadCtrl.js?"]
    }).state("main.stories", {
        title: "main.stories",
        url: "/stories",
        templateUrl: "views/stories.atom?",
        deps: ["servs/storyServ.js?", "ctrls/storyCtrl.js?"]
    }).state("main.events", {
        title: "main.events",
        url: "/events",
        templateUrl: "views/events.atom?",
        deps: ["servs/eventServ.js?", "ctrls/eventCtrl.js?"]
    });
    app.regLoadingJobs(loadMonaco());
    function loadMonaco() {
        return new Promise(function (resolve, reject) {
            ld("ic-monaco").then(resolve, reject);
        });
    }
    app.invoke(["$httpProvider", "$modal", function ($hp, $md) {
        $hp.interceptors.push({
            response: function (xhr, opt) {
                if (xhr.status == 401) {
                    if (!app.onShowLogin) {
                        app.onShowLogin = true;
                        app.invoke(['S_user', function (S_user) {
                            var scope = { loading: false };
                            $md.dialog('Login', app.getPaths('views/modal/login.atom?'), scope)
                                .width(666).height(450)
                                .ok(() => new Promise(function (resolve) {
                                    scope.loading = true;
                                    S_user.login(scope.lo)
                                        .then(function (u) {
                                            if (u) {
                                                delete scope.lo.password;
                                                setTimeout(() => {
                                                    Atom.broadcastMsg('reload');
                                                    scope.loading = false;
                                                    resolve(true);
                                                }, 700);
                                                return;
                                            }
                                            $md.alert('Login failed!', 'e');
                                            scope.loading = false;
                                            resolve(false);
                                            return;
                                        }, function (e) {
                                            if (e.message || typeof e == 'string') {
                                                $md.toastAlert(e.message || e, 'e');
                                            } else {
                                                $md.toastAlertDetail('Request error!', 'Service Unavailable!', 'e');
                                            }
                                            scope.loading = false;
                                            resolve(false);
                                            return true;
                                        });
                                }))
                                .okValue('Login')
                                .onDestroy(() => (app.onShowLogin = false));
                        }]);
                    }
                    return;
                }
                if (xhr.status == 403) {
                    if (!app.onShowPermissionAlert) {
                        app.onShowPermissionAlert = true;
                        $md.toastAlert(`You don't have access permission!`)
                            .onDestroy(() => app.onShowPermissionAlert = false);
                    }
                    return;
                }
            }
        });
    }]);
    app.directive("side-bar", {
        restrict: "C",
        link: function (scope, ele, attrs) {
            attacheEvent(ele).on("click", e => {
                const tg = e.target;
                const p = tg.parentElement.parentElement;
                const pp = p.parentElement;
                const isSubMenu = pp.hasClass("sub-menus");
                if (!isSubMenu) {
                    if (ele.actived != p) {
                        p.addClass("active");
                        ele.actived && ele.actived.removeClass("active");
                        ele.subActived && ele.subActived.removeClass("active");
                        delete ele.subActived;
                        ele.actived = p;
                        return;
                    }
                    ele.actived.removeClass("active");
                    ele.subActived && ele.subActived.removeClass("active");
                    delete ele.subActived;
                    delete ele.actived;
                    return;
                }
                if (ele.subActived != p) {
                    p.addClass("active");
                    ele.subActived && ele.subActived.removeClass("active");
                    ele.subActived = p;
                    return;
                }
                ele.subActived.removeClass("active");
                delete ele.subActived;
                return;
            });
        }
    });
    app.directive("fetch", ["$http", function ($http) {
        const catche = {};
        return {
            restrict: "A",
            link: function (scope, ele, attrs) {
                const from = attrs["fetch"]?.value;
                const to = attrs["fetch-to"]?.value;
                if (!from || !to) {
                    return;
                }
                const rspData = catche[from] || (catche[from] = new Promise(function (resolve) {
                    const data = {
                        id: "ac60584a5c9a432dd1881cd6501c0bd9",
                        args: [from]
                    };
                    $http.post(`${app.serverUrl}/api/executeById`).responseJson().jsonData(data).then(function (rsp) {
                        const d = rsp.response;
                        if (!d[0]) {
                            return resolve(d[1]);
                        }
                        return resolve([]);
                    }, function (err) {
                        return resolve([]);
                    });
                }));
                const toFunc = Atom.evalExp(to);
                rspData.then(function (data) {
                    toFunc(scope, data);
                });
            }
        };
    }]);
    app.directive('drop-bg', function () {
        return {
            restrict: 'A',
            link: function (scope, ele, attrs) {
                const dsps = [];
                function fileSelect(e) {
                    const file = getFiles(e)[0];
                    if (file.type.startsWith('image')) {
                        const url = URL.createObjectURL(file);
                        ele.style.backgroundImage = `url('${url}')`;
                        if (ele._dsp_func) {
                            ele._dsp_func();
                        }
                        ele._dsp_func = function () {
                            URL.revokeObjectURL(url);
                        };
                        return;
                    }
                    if (file.type.startsWith('video')) {
                        const v = ele.querySelector('video');
                        if (v) {
                            const url = URL.createObjectURL(file);
                            v.src = url;
                            if (ele._dsp_func) {
                                ele._dsp_func();
                            }
                            ele._dsp_func = function () {
                                URL.revokeObjectURL(url);
                            };
                        }
                        return;
                    }
                }
                function getFiles(e) {
                    e.stopPropagation(), e.preventDefault();
                    return [...(e.dataTransfer?.files || e.target.files || [])];
                }
                dsps.push(attacheEvent(ele)
                    .on('dragover', e => (e.preventDefault(), e.stopPropagation()))
                    .on('drop', fileSelect));
                watchInDomTree(ele, function () {
                    if (ele._dsp_func) {
                        ele._dsp_func();
                    }
                    while (dsps.length) {
                        dsps.pop()();
                    }
                });
            }
        }
    });
    Atom.invoke(["$idbProvider", function ($idbProvider) {
        $idbProvider.createOrUpdateDb(app.idbName, {
            user: "id k,username u,nickname,tags []",
            role: "id k,name,code u",
            userRole: "id k,userId,roleId",
            permission: "id k,name,code u",
            menu: "id k,name,rootId,pid,href,idx",
            userPermission: "id k,userId,permissionId",
            rolePermission: "id k,roleId,permissionId",
            roleMenu: "id k,roleId,menuId",
            wpp: "id k,name,fid",
            file: "id k",
            api: "id k,type,category,status"
        });
    }]);
    Atom.invoke(["$formCheckProvider", "$idb", function ($fcp, $idb) {
        const db = $idb.get(app.idbName);
        const userNameCach = {};
        $fcp.regCheck("user-name", function (v, ev, ele) {
            if (userNameCach[v]) {
                if (userNameCach[v] === ev) {
                    return true;
                }
                return false;
            }
            return new Promise(function (resolve, reject) {
                db.get("user", v).useIndex("username").then(function ([[a]]) {
                    if (a) {
                        userNameCach[v] = a.id;
                        if (ev == a.id) {
                            resolve(true);
                            return;
                        }
                        resolve(false);
                        return;
                    }
                    resolve(true);
                }, function () {
                    resolve(true);
                });
            });
        });
    }]);
    Atom.invoke(["$idb", function ($idb) {
        const db = $idb.get(app.idbName);
        db.get("user", "root").useIndex("username").then(function ([[a]]) {
            if (a) {
                return a;
            }
            a = {
                id: "dc76e9f0c0006e8f919e0c515c66dbba3982f785",
                username: "root",
                nickname: "Root",
                password: "66775d5b0ab6f5d1fd2f57f58dfc10d27afbf931"
            };
            db.put("user", a);
            return a;
        }, console.error);
    }]);
})(Atom.app("wppStore-admin"));