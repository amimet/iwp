import config from 'config'
import { DJail } from 'core/libs'

export const settings = new DJail({ name: config.app?.storage?.settings ?? "settings", voidMutation: true })
export default settings