/**
 * Created by Guest on 2024/4/12 16:52:25.
 */
(function(app){
    app.controller('eventCtrl',['$scope','S_event','$modal',function(scope,S_event,$modal){
        scope.events=[];
        scope.byPage=function(pg){
            return S_event.byPage(pg);
        }
        scope.newEvent = function (events) {
            S_event.newEvent().then(function (newEvent) {
                if (newEvent) {
                    events.push(newEvent);
                }
            });
        }
        scope.detail = function (u) {
            $modal.alertDetail('Event Detail', `<pre>${JSON.stringify(u, ' ', 2)}</pre>`)
            .width(768);
        }
        scope.editEvent = function (u) {
            S_event.editEvent(u);
        }
        scope.delEvent = function (u, events) {
            S_event.delEvent(u).then(function (r) {
                if (r === true) {
                    events.splice(events.indexOf(u), 1);
                }
            });
        }
        scope.preview = function (u){
            S_event.preview(u);
        }
    }]);
})(Atom.app('wppStore-admin'))