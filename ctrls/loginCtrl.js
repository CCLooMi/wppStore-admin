/**
 * Created by guest on 11/16/2023 9:16:43 AM.
 */
(function (app) {
    app.controller('loginCtrl', ['$scope', '$modal', '$state', 'S_user', function (scope, $modal, $state, S_user) {
        scope.doLogin = function (lo) {
            S_user.login(lo)
                .then(function (u) {
                    if(u){
                        $modal.toastAlert('Login successful.')
                        .onDestroy(()=>$state.go('main'));
                        delete scope.lo.password;
                        return;
                    }
                    $modal.alert('Login failed!','e');
                    return true;
                },function(e){
                    $modal.toastAlert(e.message||e,'e');
                    return true;
                });
        }
    }]);
})(Atom.app('wppStore-admin'))