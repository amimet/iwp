import config from 'config'
import { DSO } from 'core/libs'


export const settings = new DSO({ name: config.app?.storage?.settings ?? "settings", voidMutation: true })
export default settings