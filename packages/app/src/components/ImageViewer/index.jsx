import React from "react"
import { Swiper } from "antd-mobile"
import { LazyLoadImage } from "react-lazy-load-image-component"
import classnames from "classnames"

import "./index.less"

const ImageViewer = (props) => {
    React.useEffect(() => {
        if (!Array.isArray(props.src)) {
            props.src = [props.src]
        }
    }, [])

    const openViewer = () => {
        if (props.extended) {
            return false
        }

        window.app.DrawerController.open("ImageViewer", ImageViewer, {
            componentProps: {
                src: props.src,
                extended: true
            }
        })
    }

    return <div className={classnames("imagesViewer", { ["extended"]: props.extended })}>
        <Swiper>
            {props.src.map((image) => {
                return <Swiper.Item
                    onClick={() => {
                        openViewer(image)
                    }}
                >
                    <LazyLoadImage
                        src={image}
                        effect="blur"
                        wrapperClassName="image-wrapper"
                        onClick={() => {
                            openViewer()
                        }}
                    />
                </Swiper.Item>
            })}
        </Swiper>
    </div>
}

export default ImageViewer