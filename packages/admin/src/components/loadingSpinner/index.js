import { LoadingOutlined } from "@ant-design/icons"
import { Result } from 'antd'

export default () => {
    return <div>
        <Result
            icon={<LoadingOutlined spin />}
            title="Fetching data"
        />
    </div>
}