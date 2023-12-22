/**
 * Created by guest on 11/22/2023 11:16:44 PM.
 */
(function (app) {
    app.controller('menuCtrl', ['$scope','S_menu','$modal',function(scope,S_menu,$m){
        scope.menus=[];
        scope.byPage=function(pg){
            return S_menu.byPage(pg);
        }
        scope.newMenu = function (menus,parentMenu) {
            S_menu.newMenu(parentMenu).then(function (newMenu) {
                if (newMenu) {
                    menus.push(newMenu);
                }
            });
        }
        scope.detail = function (u) {
            $m.alertDetail('Menu Detail', `<pre>${JSON.stringify(u, ' ', 2)}</pre>`);
        }
        scope.editMenu = function (u) {
            S_menu.editMenu(u);
        }
        scope.delMenu = function (u, menus) {
            S_menu.delMenu(u).then(function (r) {
                if (r === true) {
                    menus.splice(menus.indexOf(u), 1);
                }
            });
        }
    }]);
})(Atom.app('wppStore-admin'))