/**
 * Created by guest on 11/24/2023 8:20:54 PM.
 */
(function(app){
    app.controller('roleMenuCtrl',['$scope','S_role',function(scope,S_role){
        scope.menus=[];
        scope.roleMenus=function(r){
            S_role.getRoleMenus(r).then(function(menus){
                scope.menus=menus;
            },console.error);
        }
    }]);
})(Atom.app('wppStore-admin'))