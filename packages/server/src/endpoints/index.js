module.exports = [
    {
        route: "/upload",
        method: "POST",
        middleware: ["fileUpload", "withAuthentication"],
        fn: "FilesController.upload",
    },
    {
        route: "/uploads/:id",
        method: "GET",
        fn: "FilesController.get"
    },
    // User roles controller
    {
        route: "/user_roles",
        method: "GET",
        fn: "RolesController.getUserRoles",
    },
    {
        route: "/update_user_roles",
        method: "POST",
        middleware: ["withAuthentication", "roles"],
        fn: "RolesController.updateRoles",
    },
    // Roles controller
    {
        route: "/roles",
        method: "GET",
        fn: "RolesController.get",
    },
    {
        route: "/role",
        method: "DELETE",
        middleware: ["withAuthentication", "roles"],
        fn: "RolesController.delete",
    },
    {
        route: "/role",
        method: "POST",
        middleware: ["withAuthentication", "roles"],
        fn: "RolesController.create"
    },
    // Sessions controller
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
        route: "/current_session",
        method: "GET",
        middleware: "withAuthentication",
        fn: "SessionController.getCurrentSession",
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
        fn: "WorkorderController.regeneratesUUID",
    },
    {
        route: "/assigned_workorders",
        method: "GET",
        middleware: ["withAuthentication"],
        fn: "WorkorderController.getWorkorderAssignedToUserID",
    },
    {
        route: "/workorder_operators",
        method: "PUT",
        middleware: ["withAuthentication", "privileged", "useWS"],
        fn: "WorkorderController.appendOperators",
    },
    {
        route: "/workorder_operators",
        method: "DELETE",
        middleware: ["withAuthentication", "privileged", "useWS"],
        fn: "WorkorderController.removeOperators",
    },
    {
        route: "/update_workorder",
        method: "PUT",
        middleware: ["withAuthentication", "privileged"],
        fn: "WorkorderController.update",
    },
    {
        route: "/workorder_commits",
        method: "GET",
        middleware: ["withAuthentication"],
        fn: "WorkorderController.getCommits",
    },
    {
        route: "/workorder",
        method: "GET",
        middleware: "withAuthentication",
        fn: "WorkorderController.get",
    },
    {
        route: "/workorder_payload_UUID",
        method: "GET",
        middleware: ["withAuthentication"],
        fn: "WorkorderController.getWorkorderWithPayloadUUID",
    },
    {
        route: "/workorder",
        method: "PUT",
        middleware: ["withAuthentication", "useWS"],
        fn: "WorkorderController.create",
    },
    {
        route: "/workorder",
        method: "DELETE",
        middleware: ["withAuthentication", "useWS"],
        fn: "WorkorderController.delete",
    },
    // Sections
    {
        route: "/section",
        method: "GET",
        fn: "SectionController.get",
    },
    {
        route: "/sections",
        method: "GET",
        fn: "SectionController.getAll",
    },
    {
        route: "/section",
        method: "PUT",
        middleware: "withAuthentication",
        fn: "SectionController.new",
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
        route: "/update_user",
        method: "POST",
        middleware: ["withAuthentication", "roles"],
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