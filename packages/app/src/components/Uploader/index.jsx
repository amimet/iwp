import React from "react"
import { Icons } from "components/Icons"
import * as antd from "antd"
import { getBase64 } from "utils"

export default class Uploader extends React.Component {
    state = {
        previewVisible: false,
        previewImage: "",
        previewTitle: "",
        fileList: [],
    }

    handleChange = ({ fileList }) => this.setState({ fileList }, () => console.log(this.state.fileList))

    handleCancel = () => this.setState({ previewVisible: false }, () => console.log(this.state.previewVisible))

    handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj)
        }

        this.setState({
            previewImage: file.url || file.preview,
            previewVisible: true,
            previewTitle: file.name || file.url.substring(file.url.lastIndexOf("/") + 1),
        })
    }

    handleUploadRequest = (req) => {
        if (typeof this.props.onUpload === "function") {
            this.props.onUpload(req)
        } else {
            req.onSuccess()
            return req
        }
    }

    render() {
        const uploadButton = (<div>
            <Icons.Plus />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>)

        return <div>
            <antd.Upload
                listType="picture-card"
                fileList={this.state.fileList}
                onPreview={this.handlePreview}
                onChange={this.handleChange}
                customRequest={this.handleUploadRequest}
            >
                {this.state.fileList.length >= 8 ? null : uploadButton}
            </antd.Upload>
            <antd.Modal
                visible={this.state.previewVisible}
                title={this.state.previewTitle}
                footer={null}
                onCancel={this.handleCancel}
            >
                <img style={{ width: "100%" }} src={this.state.previewImage} />
            </antd.Modal>
        </div>
    }
}