import { connect } from 'umi'
import config from 'config'

export default (childrenClass) => {
    const connectedStore = config.app.app_model
    
    return connect(({ app }) => ({ app }))(childrenClass)
}