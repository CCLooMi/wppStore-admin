/**
 * Created by guest on 11/23/2023 3:16:32 PM.
 */
(function(app){
    app.controller('roleUserCtrl',['$scope',function(scope){
        scope.moveLeft=function(u,leftUsers,rightUsers){
            rightUsers.splice(rightUsers.indexOf(u),1);
            leftUsers.push(u);
        }
        scope.moveRight=function(u,leftUsers,rightUsers){
            leftUsers.splice(leftUsers.indexOf(u),1);
            rightUsers.push(u);
        }
    }]);
})(Atom.app('wppStore-admin'))