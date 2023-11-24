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
        const nvBar = new NavBar('normal');
        hd.append(nvBar);
        function logout () {
            S_user.logout().then(function(r){
                if(r){
                    $state.go('login');
                }
            });
        };
        function updateNVBar(u) {
            nvBar.updateCmdMenu('', {
                'welcome': `Welcome, ${u?.username || ''}!`,
                'Change Password': function () { },
                'Preferences': function () { },
                'Logout': logout
            });
            nvBar.updateBrdMenu(
                'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png',
                {
                    'About':function(){},
                    'Logout':logout
                }
            );
            nvBar.updateAppMenu({
                'Help':{}
            });
        };
        scope.$destroy=Atom.onMsg('refreshMenus',getUserMenus);
    }]);
})(Atom.app('wppStore-admin'))