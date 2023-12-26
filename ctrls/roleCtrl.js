/**
 * Created by guest on 11/23/2023 10:18:03 AM.
 */
(function(app){
    app.controller('roleCtrl',['$scope','S_role','$modal',function(scope,S_role,$m){
        scope.byPage=function(pg){
            return S_role.byPage(pg);
        }
        scope.newRole=function(roles){
            S_role.newRole().then(function(newRole){
                if(newRole){
                    roles.push(newRole);
                }
            });
        }
        scope.detail=function(r){
            $m.alertDetail('Role Detail',`<pre>${JSON.stringify(r,' ',2)}</pre>`);
        }
        scope.editRole=function(r){
            S_role.editRole(r);
        }
        scope.delRole=function(r,roles){
            S_role.delRole(r).then(function(r){
                if(r===true){
                    roles.splice(roles.indexOf(r),1);
                }
            });
        }
        scope.roleUsers=function(r){
            S_role.roleUsers(r);
        }
        scope.roleMenus=function(r){
            S_role.roleMenus(r);
        }
    }]);
})(Atom.app('wppStore-admin'))