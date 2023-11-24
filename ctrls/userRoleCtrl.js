/**
 * Created by guest on 11/24/2023 7:11:28 PM.
 */
(function(app){
    app.controller('userRoleCtrl',['$scope','$modal','S_user',function(scope,$m,S_user){
        scope.leftRoles=[];
        scope.rightRoles=[];
        scope.userRoles=function(role,pg,y){
            return S_user.getUserRoles(role,pg,y);
        }
        scope.moveLeft=function(u,r,leftRoles,rightRoles){
            S_user.addRole(u,r).then(function(){
                rightRoles.splice(rightRoles.indexOf(r),1);
                leftRoles.push(r);
            },e=>{
                $m.alertDetail('Add role error!',`<pre>${Atom.formatError(e)}</pre>`,'e');
            });
        }
        scope.moveRight=function(u,r,leftRoles,rightRoles){
            S_user.removeRole(u,r).then(function(){
                leftRoles.splice(leftRoles.indexOf(r),1);
                rightRoles.push(r);
            },e=>{
                $m.alertDetail('Remove role error!',`<pre>${Atom.formatError(e)}</pre>`,'e');
            });
        }
    }]);
})(Atom.app('wppStore-admin'))