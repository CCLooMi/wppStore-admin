/**
 * Created by guest on 11/16/2023 9:28:27 AM.
 */
(function (app) {
    app.controller('mainCtrl', ['$scope', '$state', '$element', 'S_user', function (scope, $state, ele, S_user) {
        function getLoginUser() {
            S_user.getLoginUser().then(function (user) {
                if (!user) {
                    $state.go('login');
                    return;
                }
                scope.u = user;
                getUserMenus(user);
                updateNVBar(user);
            });
        }
        function getUserMenus(user) {
            S_user.getUserMenus(user)
                .then(function (menus) {
                    scope.menus = menus;
                })
        }
        scope.onShow = function () {
            getLoginUser();
        };
        getLoginUser();
        const hd = ele.findOne('.header');
        const NavBar = getDefElement('nav-bar');
        const nvBar = new NavBar();
        hd.append(nvBar);
        function updateNVBar(u) {
            nvBar.updateCmdMenu('', {
                'welcome': `Welcome, ${u?.username || ''}!`,
                'Change Password': function () { },
                'Preferences': function () { },
                'Logout': function () {
                    S_user.logout();
                    $state.go('login');
                }
            });
        }
    }]);
})(Atom.app('wppStore-admin'))