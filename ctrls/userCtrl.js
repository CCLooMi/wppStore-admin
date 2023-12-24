/**
 * Created by guest on 11/18/2023 1:43:27 PM.
 */
(function(app){
    app.controller('userCtrl',['$scope','S_user','$modal',function(scope,S_user,$m){
        scope.byPage=function(pg){
            return S_user.byPage(pg);
        }
        scope.newUser=function(users){
            S_user.newUser().then(function(newUser){
                if(newUser){
                    users.push(newUser);
                }
            });
        }
        scope.detail=function(u){
            $m.alertDetail('User Detail',`<pre>${JSON.stringify(u,' ',2)}</pre>`);
        }
        scope.editUser=function(u){
            S_user.editUser(u);
        }
        scope.delUser=function(u,users){
            S_user.delUser(u).then(function(r){
                if(r===true){
                    users.splice(users.indexOf(u),1);
                }
            });
        }
        scope.userRoles=function(u){
            S_user.userRoles(u);
        }
    }]);
})(Atom.app('wppStore-admin'))