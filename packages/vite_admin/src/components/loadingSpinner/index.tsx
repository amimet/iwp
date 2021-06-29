import { LoadingOutlined } from "@ant-design/icons"
import { Result } from 'antd'

export default (title) => {
    return <div>
        <Result
            icon={<LoadingOutlined spin />}
            title={title?? "Loading"}
        />
    </div>
}