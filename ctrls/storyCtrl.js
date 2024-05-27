/**
 * Created by Guest on 2024/4/12 16:52:56.
 */
(function(app){
    app.controller('storyCtrl',['$scope','S_story','$modal',function(scope,S_story,$modal){
        scope.stories=[];
        scope.byPage=function(pg){
            return S_story.byPage(pg);
        }
        scope.newStory = function (stories) {
            S_story.newStory().then(function (newStory) {
                if (newStory) {
                    scope.doSearch();
                }
            });
        }
        scope.detail = function (u) {
            $modal.alertDetail('Story Detail', `<pre>${JSON.stringify(u, ' ', 2)}</pre>`)
            .width(768);
        }
        scope.editStory = function (u) {
            S_story.editStory(u);
        }
        scope.delStory = function (u, stories) {
            S_story.delStory(u).then(function (r) {
                if (r === true) {
                    stories.splice(stories.indexOf(u), 1);
                }
            });
        }
        scope.preview=function (u){
            S_story.preview(u);
        }
    }]);
})(Atom.app('wppStore-admin'))