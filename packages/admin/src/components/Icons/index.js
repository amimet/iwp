import React from "react"

// import icons lib
import * as lib1 from "feather-reactjs"
import * as lib2 from "@ant-design/icons"

export const Icons = {
    ...lib1,
    ...lib2
}

export function createIconRender(icon, props) {
    if (typeof Icons[icon] !== "undefined") {
        return React.createElement(Icons[icon], props)
    }

    return null
}

export default Icons