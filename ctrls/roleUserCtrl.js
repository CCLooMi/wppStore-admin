/**
 * Created by guest on 11/23/2023 3:16:32 PM.
 */
(function(app){
    app.controller('roleUserCtrl',['$scope','$modal','S_role',function(scope,$m,S_role){
        scope.leftUsers=[];
        scope.rightUsers=[];
        scope.roleUsers=function(role,pg,y){
            return S_role.getRoleUsers(role,pg,y);
        }
        scope.moveLeft=function(r,u,leftUsers,rightUsers){
            S_role.addUser(r,u).then(function(){
                rightUsers.splice(rightUsers.indexOf(u),1);
                leftUsers.push(u);
            },e=>{
                $m.alertDetail('Add user error!',`<pre>${Atom.formatError(e)}</pre>`,'e');
            });
        }
        scope.moveRight=function(r,u,leftUsers,rightUsers){
            S_role.removeUser(r,u).then(function(){
                leftUsers.splice(leftUsers.indexOf(u),1);
                rightUsers.push(u);
            },e=>{
                $m.alertDetail('Remove user error!',`<pre>${Atom.formatError(e)}</pre>`,'e');
            });
        }
    }]);
})(Atom.app('wppStore-admin'))