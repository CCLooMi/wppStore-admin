/**
 * Created by guest on 11/16/2023 9:05:55 AM.
 */
(function (app) {
    app.useMysql = true;
    app.idbName = "wpp-store-admin";
    app.state("main", {
        title: "main",
        url: "/main",
        templateUrl: "views/main.atom",
        deps: ["lib/lib.js","ctrls/mainCtrl.js", "servs/menuServ.js", "servs/userServ.js"]
    }).state("login", {
        title: "login",
        url: "/login",
        templateUrl: "views/login.atom",
        deps: ["lib/lib.js","ctrls/loginCtrl.js", "servs/userServ.js"]
    }).state("main.roles", {
        title: "roles",
        url: "/roles",
        templateUrl: "views/roles.atom",
        deps: ["ctrls/roleCtrl.js", "servs/roleServ.js", "ctrls/userCtrl.js", "ctrls/menuCtrl.js", "servs/menuServ.js"]
    }).state("main.users", {
        title: "users",
        url: "/users",
        templateUrl: "views/users.atom",
        deps: ["ctrls/userCtrl.js", "servs/roleServ.js", "ctrls/roleCtrl.js"]
    }).state("main.menus", {
        title: "menus",
        url: "/menus",
        templateUrl: "views/menus.atom",
        deps: ["ctrls/menuCtrl.js", "servs/menuServ.js"]
    }).state("main.apis", {
        title: "main.apis",
        url: "/apis",
        templateUrl: "views/apis.atom",
        deps: ["servs/apiServ.js", "ctrls/apiCtrl.js"]
    }).state("main.configs", {
        title: "main.configs",
        url: "/configs",
        templateUrl: "views/configs.atom",
        deps: ["servs/configServ.js", "ctrls/configCtrl.js"]
    }).state("main.uploads", {
        title: "main.uploads",
        url: "/uploads",
        templateUrl: "views/uploads.atom",
        deps: ["servs/uploadServ.js", "ctrls/uploadCtrl.js"]
    }).state("main.wpps", {
        title: "main.wpps",
        url: "/wpps",
        templateUrl: "views/wpps.atom",
        deps: ["servs/wppServ.js", "ctrls/wppCtrl.js"]
    }).state("main.stories", {
        title: "main.stories",
        url: "/stories",
        templateUrl: "views/stories.atom",
        deps: ["servs/storyServ.js", "ctrls/storyCtrl.js","servs/wppServ.js", "ctrls/wppCtrl.js"]
    }).state("main.events", {
        title: "main.events",
        url: "/events",
        templateUrl: "views/events.atom",
        deps: ["servs/eventServ.js", "ctrls/eventCtrl.js","servs/wppServ.js", "ctrls/wppCtrl.js"]
    }).state("main.tasks", {
        title: "main.tasks",
        url: "/tasks",
        templateUrl: "views/tasks.atom",
        deps: [
            "servs/taskServ.js", "ctrls/taskCtrl.js",
            "servs/apiServ.js", "ctrls/apiCtrl.js"
        ]
    });
    app.regLoadingJobs(loadMonaco());
    function loadMonaco() {
        return new Promise(function (resolve, reject) {
            ld("ic-monaco").then(resolve, reject);
        });
    }
})(Atom.app("wppStore-admin"));