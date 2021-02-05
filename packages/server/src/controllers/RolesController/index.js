export const RolesController = {
    hasPermissions: (req, res, next) => {
        return res.json(`You are lucky today 🥳 > ${req.userPermissions}`)
    },
    get: (req, res, next) => {
        
    }
}

export default RolesController