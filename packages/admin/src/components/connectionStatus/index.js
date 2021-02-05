import React from 'react'
import withConnector from 'core/libs/withConnector'
import styles from './index.less'
import { AlertTriangle } from 'components/Icons'

class ConnectionStatus extends React.Component {
    render() {
        return <div className={styles.connection_status_wrapper}>
            {this.props.socket.status? <AlertTriangle className={styles.shockwave} style={{ color: "red", marginRight: "7px" }} /> : null}
            {this.props.socket.status? "Disconnected from server" : null}
        </div>
    }
}

export default withConnector(ConnectionStatus, ["app", "socket"])