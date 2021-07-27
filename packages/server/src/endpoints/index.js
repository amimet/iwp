module.exports = [
    {
        route: "/session",
        method: 'DELETE',
        controller : "SessionController",
        middleware: "ensureAuthenticated",
        fn: "delete"
    },
    {
        route: "/sessions",
        method: 'DELETE',
        controller : "SessionController",
        middleware: "ensureAuthenticated",
        fn: "deleteAll"
    },
    {
        route: "/validateSession",
        method: "POST",
        controller: "SessionController",
        middleware: "useJwtStrategy",
        fn: "validate"
    },
    {
        route: "/sessions",
        method: "GET",
        controller: "SessionController",
        middleware: "ensureAuthenticated",
        fn: "get"
    },
    {
        route: "/itemVault",
        method: "GET",
        controller: "VaultController",
        middleware: "ensureAuthenticated"
    },
    {
        route: "/itemVault",
        method: "PUT",
        controller: "VaultController",
        middleware: "ensureAuthenticated",
        fn: "set"
    },
    {
        route: "/workload",
        method: "GET",
        controller: "WorkloadController",
        middleware: "ensureAuthenticated"
    },
    {
        route: "/workload",
        method: "POST",
        controller: "WorkloadController",
        middleware: "ensureAuthenticated",
        fn: "set"
    },
    {
        route: "/vault",
        method: "GET",
        controller: "VaultController",
        middleware: "ensureAuthenticated",
        fn: "getAll"
    },
    {
        route: "/region",
        method: "GET",
        controller: "RegionController"
    },
    {
        route: "/regions",
        method: "GET",
        controller: "RegionController",
        fn: "getAll"
    },
    {
        route: "/hasPermissions",
        method: "POST",
        controller: "RolesController",
        middleware: [
            "ensureAuthenticated",
            "hasPermissions"
        ],
        fn: "hasPermissions"
    },
    {
        route: "/role",
        method: "POST",
        controller: "RolesController",
        fn: "set"
    },
    {
        route: "/roles",
        method: "GET",
        controller: "RolesController"
    },
    {
        route: "/users",
        method: "GET",
        controller: "UserController",
        middleware: "ensureAuthenticated",
        fn: "get"
    },
    {
        route: "/user",
        method: "GET",
        controller: "UserController",
        middleware: "ensureAuthenticated",
        fn: "getOne"
    },
    {
        route: "/login",
        method: "POST",
        controller: "UserController",
        fn: "login"
    },
    {
        route: "/logout",
        method: "POST",
        controller: "UserController",
        middleware: ["ensureAuthenticated"],
        fn: "logout"
    },
    {
        route: "/register",
        method: "POST",
        controller: "UserController",
        fn: "register"
    },
    {
        route: "/isAuth",
        method: "POST",
        controller: "UserController",
        middleware: "ensureAuthenticated",
        fn: "isAuth"
    }
]