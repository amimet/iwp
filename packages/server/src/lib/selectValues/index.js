export default (query = [], fn) => {
    return async (req, res, next) => {
        if (typeof fn === "function") {
            const obj = {}

            if (Array.isArray(query)) {
                query.forEach(key => {
                    const value = req.query[key] ?? req.body[key]
                    if (typeof value !== "undefined") {
                        obj[key] = value
                    }
                })
            }

            req.selectedValues = obj
                
            return await fn(req, res, next)
        }
    }
}