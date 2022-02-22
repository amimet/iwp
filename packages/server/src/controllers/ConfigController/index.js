import { ComplexController } from "linebridge/dist/classes"

export default class ConfigController extends ComplexController {
    static refName = "ConfigController"
    static useMiddlewares = ["withAuthentication", "onlyAdmin"]

    post = {
        "/update": async (req, res) => {

        },
    }
}