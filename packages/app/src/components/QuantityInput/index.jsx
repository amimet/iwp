import React from "react"
import * as antd from "antd"
import { NumberKeyboard } from "antd-mobile"
import { Translation } from "react-i18next"

import { Icons } from "components/Icons"

import "./index.less"

export default (props) => {
    const [visible, setVisible] = React.useState(true)
    const [value, setValue] = React.useState(null)

    const onClose = () => {
        setVisible(false)
        props.onClose()
    }

    const onOk = () => {
        setVisible(false)
        props.onOk(Number(value ?? 0))
    }

    const setQuantityLeft = () => {
        if (typeof props.fullFillQuantity === "number") {
            setValue(props.fullFillQuantity)
        }
    }

    return <div className="number_picker">
        <div className="value">
            {value ?? 0}
        </div>

        {props.fullFillQuantity && <div>
            <antd.Button shape="round" onClick={setQuantityLeft}>
                <Icons.MdDoneAll />
                <Translation>
                    {t => t("Mark remaining amount")}
                </Translation>
            </antd.Button>
        </div>}

        <div className="actions">
            <div>
                <antd.Button onClick={onOk} type="primary">
                    <Icons.Check />
                    <Translation>
                        {t => t("Ok")}
                    </Translation>
                </antd.Button>
            </div>

            <div>
                <antd.Button onClick={onClose}>
                    <Icons.X />
                    <Translation>
                        {t => t("Cancel")}
                    </Translation>
                </antd.Button>
            </div>
        </div>

        <NumberKeyboard
            visible={visible}
            onClose={onClose}
            onInput={(e) => {
                setValue(Number(`${value ?? ""}${e}`))
            }}
            onDelete={() => {
                if (!value) {
                    return false
                }
                setValue(Number(`${value}`.slice(0, -1)))
            }}
        />
    </div>
}