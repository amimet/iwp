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
        fn: "RolesController.get",
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
        route: "/validate_session",
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
    // FABRIC
    {
        route: "/fabric",
        method: "PUT",
        middleware: ["ensureAuthenticated", "privileged"],
        fn: "FabricController.create",
    },
    {
        route: "/fabric",
        method: "POST",
        middleware: ["ensureAuthenticated", "privileged"],
        fn: "FabricController.update",
    },
    {
        route: "/fabric",
        method: "GET",
        middleware: ["ensureAuthenticated"],
        fn: "FabricController.get",
    },
    {
        route: "/fabric",
        method: "DELETE",
        middleware: ["ensureAuthenticated"],
        fn: "FabricController.delete",
    },
    {
        route: "/fabric_import",
        method: "PUT",
        middleware: ["ensureAuthenticated", "privileged"],
        fn: "FabricController.import",
    },
    // WORKLOADS
    {
        route: "/regenerates_uuid",
        method: "POST",
        middleware: ["ensureAuthenticated", "privileged"],
        fn: "WorkloadController.regeneratesUUID",
    },
    {
        route: "/workload_operators",
        method: "PUT",
        middleware: ["ensureAuthenticated", "privileged"],
        fn: "WorkloadController.appendOperators",
    },
    {
        route: "/workload_operators",
        method: "DELETE",
        middleware: ["ensureAuthenticated", "privileged"],
        fn: "WorkloadController.removeOperators",
    },
    {
        route: "/update_workload",
        method: "PUT",
        middleware: ["ensureAuthenticated", "privileged"],
        fn: "WorkloadController.update",
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
        route: "/region",
        method: "PUT",
        middleware: "ensureAuthenticated",
        fn: "RegionController.new",
    },
    {
        route: "/has_permissions",
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
        route: "/is_auth",
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
    {
        route: "/reports",
        method: "GET",
        middleware: ["ensureAuthenticated"],
        fn: "ReportsController.get"
    },
    {
        route: "/report",
        method: "PUT",
        middleware: ["ensureAuthenticated"],
        fn: "ReportsController.new"
    },
    {
        route: "/report",
        method: "delete",
        middleware: ["ensureAuthenticated"],
        fn: "ReportsController.delete"
    },
]