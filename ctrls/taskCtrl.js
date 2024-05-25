/**
 * Created by Guest on 2024/5/12 20:53:21.
 */
(function(app){
    app.controller('taskCtrl',['$scope','S_task','$modal',function(scope,S_task,$modal){
        scope.tasks=[];
        scope.byPage=function(pg){
            return S_task.byPage(pg);
        }
        scope.detail = function (u) {
            $modal.alertDetail('Task Detail', `<pre>${JSON.stringify(u, ' ', 2)}</pre>`);
        }
        scope.stopTask = function (u) {
            S_task.stopTask(u);
        }
        scope.newTask=function(){
            S_task.newTask()
            .then(()=>scope.doSearch());
        }
        scope.onShow=function(){
            scope.doSearch();
        }
    }]);
})(Atom.app('wppStore-admin'))