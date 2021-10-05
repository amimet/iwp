const supportedFormats = [
    'P1',
    'P2'
]

function draw(canvas, image, options = {}) {
    let { format, height, width } = image
    let ctx = canvas.getContext('2d')

    canvas.height = height
    canvas.width = width

    if (options.scale) {
        canvas.height = canvas.height * options.scale
        canvas.width = canvas.width * options.scale
    }

    switch (format) {
        case 'P1':
            drawPBM(ctx, image, options)
            break
        case 'P2':
            drawPGM(ctx, image, options)
            break
    }
}

function drawPBM(ctx, { height, width, data }, options = {}) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (data[y][x] === 1) {
                ctx.fillRect(x, y, 1, 1)
            }
        }
    }
}

function drawPGM(ctx, { height, width, data, maxValue }) {
    let imageData = ctx.createImageData(width, height)
    let pixels = imageData.data

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let rawValue = data[y][x]
            let grayValue = rawValue / maxValue * 255
            let pixelAddress = (x + y * width) * 4
            pixels[pixelAddress] = grayValue
            pixels[pixelAddress + 1] = grayValue
            pixels[pixelAddress + 2] = grayValue
            pixels[pixelAddress + 3] = 255
        }
    }
    
    ctx.putImageData(imageData, 0, 0)
}

function parse(string) {
    let lines = string.split('\n')
    let format = lines[0]

    if (!format || supportedFormats.indexOf(format) === -1) {
        throw new Error('Could not determine image format')
    }

    let [width, height] = lines[1]
        .match(/^(\d+) (\d+)$/)
        .slice(1)
        .map(Number)

    let maxValue
    switch (format) {
        case 'P1':
            maxValue = 1
            break
        case 'P2':
            maxValue = Number(lines[2])
            break
    }

    let data = lines.slice(2).map(parseLine)

    return { format, width, height, data, maxValue }
}

function parseLine(line) {
    return line
        .replace(/\s+/g, '|')
        .replace(/^\|/, '')
        .split('|')
        .map(Number)
}

export default function pbm2canvas(pbmString, canvas, options) {
    let parsed = parse(pbmString)
    if (!parsed.format) {
        throw new Error('Could not determine format')
    }
    if (!canvas) {
        canvas = document.createElement('canvas')
    }

    draw(canvas, parsed, options)

    return canvas
}