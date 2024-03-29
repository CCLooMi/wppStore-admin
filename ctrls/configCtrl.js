/**
 * Created by guest on 2024/1/25 22:47:01.
 */
(function (app) {
    app.controller('configCtrl', ['$scope', 'S_config', '$modal', function (scope, S_config, $modal) {
        scope.configs = [];
        scope.byPage = function (pg) {
            return S_config.byPage(pg);
        }
        scope.newConfig = function (configs) {
            S_config.newConfig().then(function (newConfig) {
                if (newConfig) {
                    configs.push(newConfig);
                }
            });
        }
        scope.detail = function (u) {
            $modal.alertDetail('Config Detail', `<pre>${JSON.stringify(u, ' ', 2)}</pre>`);
        }
        scope.editConfig = function (u) {
            S_config.editConfig(u);
        }
        scope.delConfig = function (u, configs) {
            S_config.delConfig(u).then(function (r) {
                if (r === true) {
                    configs.splice(configs.indexOf(u), 1);
                }
            });
        }
        scope.reload = function(){
            S_config.reload();
        }
    }]);
})(Atom.app('wppStore-admin'))