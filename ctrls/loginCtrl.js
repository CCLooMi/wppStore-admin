/**
 * Created by guest on 11/16/2023 9:16:43 AM.
 */
(function (app) {
    app.controller('loginCtrl', ['$scope', '$modal', '$state', 'S_user', function (scope, $modal, $state, S_user) {
        scope.loading=false;
        scope.fadeOut=false;
        scope.doLogin = function (lo) {
            scope.loading=true;
            S_user.login(lo)
                .then(function (u) {
                    if(u){
                        delete scope.lo.password;
                        scope.loading=false;
                        scope.fadeOut=true;
                        setTimeout(()=>{
                            scope.fadeOut=false;
                            $state.go('main');
                        },1000);
                        return;
                    }
                    $modal.alert('Login failed!','e');
                    scope.loading=false;
                    return true;
                },function(e){
                    if(e.message||typeof e == 'string'){
                        $modal.toastAlert(e.message||e,'e');
                    }else{
                        $modal.toastAlertDetail('Request error!','Service Unavailable!','e');
                    }
                    scope.loading=false;
                    return true;
                });
        }
    }]);
})(Atom.app('wppStore-admin'))