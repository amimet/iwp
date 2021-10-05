module.exports = [
    {
        route: "/regenerate",
        method: "POST",
        middleware: ["ensureAuthenticated", "useJwtStrategy"],
        fn: "SessionController.regenerate"
    },
    {
        route: "/role",
        method: 'PUT',
        middleware: ["ensureAuthenticated", "roles"],
        fn: "UserController.grantRole"
    },
    {
        route: "/role",
        method: 'DELETE',
        middleware: ["ensureAuthenticated", "roles"],
        fn: "UserController.denyRole"
    },
    {
        route: "/roles",
        method: "GET",
        fn: "RolesController.getAll",
    },
    {
        route: "/session",
        method: 'DELETE',
        middleware: "ensureAuthenticated",
        fn: "SessionController.delete",
    },
    {
        route: "/sessions",
        method: 'DELETE',
        middleware: "ensureAuthenticated",
        fn: "SessionController.deleteAll",
    },
    {
        route: "/validateSession",
        method: "POST",
        middleware: "useJwtStrategy",
        fn: "SessionController.validate",
    },
    {
        route: "/sessions",
        method: "GET",
        middleware: "ensureAuthenticated",
        fn: "SessionController.get",
    },
    {
        route: "/itemVault",
        method: "GET",
        middleware: "ensureAuthenticated",
        fn: "VaultController.get",
    },
    {
        route: "/itemVault",
        method: "PUT",
        middleware: "ensureAuthenticated",
        fn: "VaultController.set",
    },
    {
        route: "/fabricItem",
        method: "PUT",
        middleware: ["ensureAuthenticated", "privileged"],
        fn: "FabricController.create",
    },
    {
        route: "/fabricItems",
        method: "GET",
        middleware: ["ensureAuthenticated"],
        fn: "FabricController.getAll",
    },
    {
        route: "/fabricItem",
        method: "GET",
        middleware: ["ensureAuthenticated"],
        fn: "FabricController.get",
    },
    {
        route: "/workloads",
        method: "GET",
        middleware: "ensureAuthenticated",
        fn: "WorkloadController.getAll",
    },
    {
        route: "/workload",
        method: "GET",
        middleware: "ensureAuthenticated",
        fn: "WorkloadController.get",
    },
    {
        route: "/workload",
        method: "PUT",
        middleware: "ensureAuthenticated",
        fn: "WorkloadController.set",
    },
    {
        route: "/workload",
        method: "DELETE",
        middleware: "ensureAuthenticated",
        fn: "WorkloadController.delete",
    },
    {
        route: "/vault",
        method: "GET",
        middleware: "ensureAuthenticated",
        fn: "VaultController.getAll",
    },
    {
        route: "/region",
        method: "GET",
        fn: "RegionController.get",
    },
    {
        route: "/regions",
        method: "GET",
        fn: "RegionController.getAll",
    },
    {
        route: "/hasPermissions",
        method: "POST",
        middleware: [
            "ensureAuthenticated",
            "hasPermissions"
        ]
    },
    {
        route: "/self",
        method: "GET",
        middleware: "ensureAuthenticated",
        fn: "UserController.getSelf",
    },
    {
        route: "/users",
        method: "GET",
        middleware: "ensureAuthenticated",
        fn: "UserController.get",
    },
    {
        route: "/user",
        method: "GET",
        middleware: "ensureAuthenticated",
        fn: "UserController.getOne",
    },
    {
        route: "/self_user",
        method: "PUT",
        middleware: "ensureAuthenticated",
        fn: "UserController.updateSelf",
    },
    {
        route: "/user",
        method: "PUT",
        middleware: ["ensureAuthenticated", "privileged"],
        fn: "UserController.update",
    },
    {
        route: "/login",
        method: "POST",
        fn: "UserController.login",
    },
    {
        route: "/logout",
        method: "POST",
        middleware: ["ensureAuthenticated"],
        fn: "UserController.logout",
    },
    {
        route: "/register",
        method: "POST",
        fn: "UserController.register",
    },
    {
        route: "/isAuth",
        method: "POST",
        middleware: "ensureAuthenticated",
        fn: "UserController.isAuth",
    },
    {
        route: "/workshifts",
        method: "GET",
        middleware: "ensureAuthenticated",
        fn: "WorkshiftsController.get",
    },
    {
        route: "/workshift",
        method: "PUT",
        middleware: ["ensureAuthenticated", "privileged"],
        fn: "WorkshiftsController.set",
    },
    {
        route: "/workshift",
        method: "DELETE",
        middleware: ["ensureAuthenticated", "privileged"],
        fn: "WorkshiftsController.del",
    },
]