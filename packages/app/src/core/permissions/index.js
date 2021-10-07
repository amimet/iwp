import { getCurrentUser } from "core/models/user"

export function hasPermissions() {

}

export function hasAdmin() {
    const user = getCurrentUser()

    if (!user) {
        return false
    }

    // TODO: Check with API
    
    return Array.isArray(user.roles) && user.roles.includes("admin")
}