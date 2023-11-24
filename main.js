/**
 * Created by guest on 11/16/2023 9:05:55 AM.
 */
(function(app) {
    app.state("main", {
        title: "main",
        url: "/main",
        templateUrl: "views/main.atom",
        deps: [ "ctrls/mainCtrl.js", "servs/userServ.js" ]
    }).state("login", {
        title: "login",
        url: "/login",
        templateUrl: "views/login.atom",
        deps: [ "ctrls/loginCtrl.js", "servs/userServ.js" ]
    }).state("main.roles", {
        title: "roles",
        url: "/roles",
        templateUrl: "views/roles.atom",
        deps:['ctrls/roleCtrl.js','servs/roleServ.js','ctrls/roleUserCtrl.js']
    }).state("main.users", {
        title: "users",
        url: "/users",
        templateUrl: "views/users.atom",
        deps: [ "ctrls/userCtrl.js",'ctrls/userRoleCtrl.js']
    }).state("main.menus", {
        title: "menus",
        url: "/menus",
        templateUrl: "views/menus.atom",
        deps:['ctrls/menuCtrl.js','servs/menuServ.js']
    });
    app.directive("side-bar", {
        restrict: "C",
        link: function(scope, ele, attrs) {
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
    Atom.invoke([ "$idbProvider", function($idbProvider) {
        $idbProvider.createOrUpdateDb("wpp-store-admin", {
            user: "id k,username u,nickname,tags []",
            role: "id k,name,code u",
            userRole: "id k,userId,roleId",
            permission: "id k,name,code u",
            menu: "id k,name,rootId,pid,href,idx",
            userPermission: "id k,userId,permissionId",
            rolePermission: "id k,roleId,permissionId",
            roleMenu: "id k,roleId,menuId",
            wpp: "id k,name,fid",
            file: "id k"
        });
    } ]);
    Atom.invoke([ "$formCheckProvider", "$idb", function($fcp, $idb) {
        const db = $idb.get("wpp-store-admin");
        const userNameCach = {};
        $fcp.regCheck("user-name", function(v, ev, ele) {
            if (userNameCach[v]) {
                if (userNameCach[v] === ev) {
                    return true;
                }
                return false;
            }
            return new Promise(function(resolve, reject) {
                db.get("user", v).useIndex("username").then(function([ [ a ] ]) {
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
                }, function() {
                    resolve(true);
                });
            });
        });
    } ]);
    // Atom.invoke(['$idb',function($idb){
    //     const db = $idb.get('wpp-store-admin'); 
    //     db.put('user',{
    //         id:'dc76e9f0c0006e8f919e0c515c66dbba3982f785',
    //         username:'root',
    //         nickname:'Root',
    //         password:'66775d5b0ab6f5d1fd2f57f58dfc10d27afbf931'
    //     })
    //     .then(console.log,console.error);
    // }])
})(Atom.app("wppStore-admin"));