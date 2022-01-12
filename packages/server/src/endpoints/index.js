module.exports = [
    {
        route: "/regenerate",
        method: "POST",
        middleware: ["withAuthentication", "useJwtStrategy"],
        fn: "SessionController.regenerate"
    },
    {
        route: "/role",
        method: 'PUT',
        middleware: ["withAuthentication", "roles"],
        fn: "UserController.grantRole"
    },
    {
        route: "/role",
        method: "DELETE",
        middleware: ["withAuthentication", "roles"],
        fn: "UserController.denyRole"
    },
    {
        route: "/roles",
        method: "GET",
        fn: "RolesController.get",
    },
    {
        route: "/session",
        method: "DELETE",
        middleware: "withAuthentication",
        fn: "SessionController.delete",
    },
    {
        route: "/sessions",
        method: "DELETE",
        middleware: "withAuthentication",
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
        middleware: "withAuthentication",
        fn: "SessionController.get",
    },
    // FABRIC
    {
        route: "/fabric",
        method: "PUT",
        middleware: ["withAuthentication", "privileged"],
        fn: "FabricController.create",
    },
    {
        route: "/fabric",
        method: "POST",
        middleware: ["withAuthentication", "privileged"],
        fn: "FabricController.update",
    },
    {
        route: "/fabric",
        method: "GET",
        middleware: ["withAuthentication"],
        fn: "FabricController.get",
    },
    {
        route: "/fabric_by_id",
        method: "GET",
        middleware: ["withAuthentication"],
        fn: "FabricController.getById",
    },
    {
        route: "/fabric",
        method: "DELETE",
        middleware: ["withAuthentication"],
        fn: "FabricController.delete",
    },
    {
        route: "/fabric_import",
        method: "PUT",
        middleware: ["withAuthentication", "privileged"],
        fn: "FabricController.import",
    },
    // WORKLOADS
    {
        route: "/regenerates_uuid",
        method: "POST",
        middleware: ["withAuthentication", "privileged"],
        fn: "WorkloadController.regeneratesUUID",
    },
    {
        route: "/assigned_workloads",
        method: "GET",
        middleware: ["withAuthentication"],
        fn: "WorkloadController.getWorkloadAssignedToUserID",
    },
    {
        route: "/workload_operators",
        method: "PUT",
        middleware: ["withAuthentication", "privileged"],
        fn: "WorkloadController.appendOperators",
    },
    {
        route: "/workload_operators",
        method: "DELETE",
        middleware: ["withAuthentication", "privileged"],
        fn: "WorkloadController.removeOperators",
    },
    {
        route: "/update_workload",
        method: "PUT",
        middleware: ["withAuthentication", "privileged"],
        fn: "WorkloadController.update",
    },
    {
        route: "/workloads",
        method: "GET",
        middleware: "withAuthentication",
        fn: "WorkloadController.getAll",
    },
    {
        route: "/workload",
        method: "GET",
        middleware: "withAuthentication",
        fn: "WorkloadController.get",
    },
    {
        route: "/workload",
        method: "PUT",
        middleware: ["withAuthentication", "useWS"],
        fn: "WorkloadController.set",
    },
    {
        route: "/workload",
        method: "DELETE",
        middleware: "withAuthentication",
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
        middleware: "withAuthentication",
        fn: "RegionController.new",
    },
    {
        route: "/has_permissions",
        method: "POST",
        middleware: [
            "withAuthentication",
            "hasPermissions"
        ]
    },
    {
        route: "/self",
        method: "GET",
        middleware: "withAuthentication",
        fn: "UserController.getSelf",
    },
    {
        route: "/users",
        method: "GET",
        middleware: "withAuthentication",
        fn: "UserController.get",
    },
    {
        route: "/user",
        method: "GET",
        middleware: "withAuthentication",
        fn: "UserController.getOne",
    },
    {
        route: "/self_user",
        method: "PUT",
        middleware: "withAuthentication",
        fn: "UserController.updateSelf",
    },
    {
        route: "/user",
        method: "PUT",
        middleware: ["withAuthentication", "privileged"],
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
        middleware: ["withAuthentication"],
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
        middleware: "withAuthentication",
        fn: "UserController.isAuth",
    },
    {
        route: "/workshifts",
        method: "GET",
        middleware: "withAuthentication",
        fn: "WorkshiftsController.get",
    },
    {
        route: "/workshift",
        method: "PUT",
        middleware: ["withAuthentication", "privileged"],
        fn: "WorkshiftsController.set",
    },
    {
        route: "/workshift",
        method: "DELETE",
        middleware: ["withAuthentication", "privileged"],
        fn: "WorkshiftsController.del",
    },
    {
        route: "/reports",
        method: "GET",
        middleware: ["withAuthentication"],
        fn: "ReportsController.get"
    },
    {
        route: "/report",
        method: "PUT",
        middleware: ["withAuthentication"],
        fn: "ReportsController.new"
    },
    {
        route: "/report",
        method: "delete",
        middleware: ["withAuthentication"],
        fn: "ReportsController.delete"
    },
]