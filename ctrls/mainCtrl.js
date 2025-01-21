/**
 * Created by guest on 11/16/2023 9:28:27 AM.
 */
(function (app) {
    app.controller('mainCtrl', ['$scope', '$state', '$element', 'S_menu', 'S_user', function (scope, $state, ele, S_menu,S_user) {
        function getLoginUser() {
            S_user.getLoginUser().then(function (userInfo) {
                if (!userInfo) {
                    return;
                }
                scope.u = userInfo.user;
                if(scope.u){
                    getUserMenus(scope.u);
                    updateNVBar(scope.u);
                }
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
            app.resetViewCache();
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
                '≣':Atom.extFunc(function(){
                    var sv = ele.querySelector('#SV001');
                    var g = sv.style.gridTemplateColumns;
                    sv.style.transition='all ease 0.5s';
                    if(g!=='0px 0px 1fr'){
                        this.g=g;
                        sv.style.gridTemplateColumns='0px 0px 1fr';
                        return;
                    }
                    sv.style.gridTemplateColumns=this.g;
                    clearTimeout(this.to);
                    this.to = setTimeout(function(){
                        sv.style.transition='';
                    },500);
                },'isItemBtn',true)
            });
        };
        scope.initMenus = function(){
            S_menu.initMenus();
        }
        function reload(){
            getUserMenus();
            getLoginUser();
            app.resetViewCache();
        }
        const dsps = [Atom.onMsg('refreshMenus',reload),Atom.onMsg('reload',reload)];
        scope.$destroy=function(){
            dsps.forEach(dsp=>dsp());
            dsps.length=0;
        };
    }]);
})(Atom.app('wppStore-admin'))