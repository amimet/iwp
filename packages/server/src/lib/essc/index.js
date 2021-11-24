// random 5 digits number
const random5 = () => Math.floor(Math.random() * 90000) + 10000

// aa-bbbb-cccc
//* a: type (2 digits)
//* b: serial (4 digits)
//* c: manufacturer (4 digits)

const typesNumber = {
    "desktop": [1],
    "laptop": [2],
    "tablet": [3],
    "smartphone": [4],
    "network": [5],
    "printer": [6],
    "monitor": [7],
}

export function genV1(params) {
    const { type, serial, manufacturer } = params // please in that order

    let str = []

    // Type parsing
    let typeBuf = []

    if (typeof typesNumber[type] === "undefined") {
        typeBuf[0] = 0
        typeBuf[1] = "X"
    } else {
        typeBuf[0] = typesNumber[type][0]
        typeBuf[1] = typesNumber[type][1] ?? "X"
    }

    str.push(typeBuf.join(""))

    // Serial parsing
    // if serial is not defined, generate a random 4 digits number
    if (typeof serial === "undefined") {
        str.push(random5().toString())
    } else {
        // push last 4 digits of serial
        str.push(serial.slice(-4))
    }

    // Manufacturer parsing
    // abreviate manufacturer name to 4 letters
    if (typeof manufacturer === "undefined") {
        str.push("GENR")
    } else {
        str.push(manufacturer.slice(0, 4).toLowerCase())
    }

    return str.join("-")
}