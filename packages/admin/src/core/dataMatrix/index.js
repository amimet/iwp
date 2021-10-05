/*
   Copyright 2020 Alexander Stokes

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import finiteField from "../rsFiniteField"

const { ReedSolomonEncoder } = finiteField(0x100, 0x12D, 2);

const SymbolSizes = [
    { capacity: 44, ecc: 28, edgeLength: 24 },
    { capacity: 36, ecc: 24, edgeLength: 22 },
    { capacity: 30, ecc: 20, edgeLength: 20 },
    { capacity: 22, ecc: 18, edgeLength: 18 },
    { capacity: 18, ecc: 14, edgeLength: 16 },
    { capacity: 12, ecc: 12, edgeLength: 14 },
    { capacity: 8, ecc: 10, edgeLength: 12 },
    { capacity: 5, ecc: 7, edgeLength: 10 },
    { capacity: 3, ecc: 5, edgeLength: 8 }
];

class DataMatrixByteMap {
    constructor(options) {
        Object.assign(this, options);

        this.byteMap = [];
    }

    writeUp(coord, l) {
        while (l--) {
            this.utah(coord);
            coord.col += 2;
            coord.row -= 2;
        }
    }

    writeDn(coord, l) {
        while (l--) {
            this.utah(coord);
            coord.col -= 2;
            coord.row += 2;
        }
    }

    utah(coord) {
        const { row, col } = coord;

        this.byteMap.push([
            { y: 0, x: 0 },
            { y: 0, x: -1 },
            { y: 0, x: -2 },
            { y: -1, x: 0 },
            { y: -1, x: -1 },
            { y: -1, x: -2 },
            { y: -2, x: -1 },
            { y: -2, x: -2 }
        ].map((coord) => {
            const { x, y } = coord;
            const at = { x: x + col, y: y + row };
            return at;
        }));
    }

    cornerCondition(i) {
        if (i === 0) {
            this.byteMap.push([
                { y: 3, x: this.edgeLength - 1 },
                { y: 2, x: this.edgeLength - 1 },
                { y: 1, x: this.edgeLength - 1 },
                { y: 0, x: this.edgeLength - 1 },
                { y: 0, x: this.edgeLength - 2 },
                { y: this.edgeLength - 1, x: 2 },
                { y: this.edgeLength - 1, x: 1 },
                { y: this.edgeLength - 1, x: 0 }
            ]);
        }
        else if (i === 1) {
            this.byteMap.push([
                { y: 1, x: this.edgeLength - 1 },
                { y: 0, x: this.edgeLength - 1 },
                { y: 0, x: this.edgeLength - 2 },
                { y: 0, x: this.edgeLength - 3 },
                { y: 0, x: this.edgeLength - 4 },
                { y: this.edgeLength - 1, x: 0 },
                { y: this.edgeLength - 2, x: 0 },
                { y: this.edgeLength - 3, x: 0 }
            ]);
        }
        else if (i === 2) {
            this.byteMap.push([
                { x: 3, y: this.edgeLength - 1 },
                { x: 2, y: this.edgeLength - 1 },
                { x: 1, y: this.edgeLength - 1 },
                { x: 0, y: this.edgeLength - 1 },
                { x: 0, y: this.edgeLength - 2 },
                { x: this.edgeLength - 1, y: 0 },
                { x: this.edgeLength - 2, y: 0 },
                { x: this.edgeLength - 3, y: 0 }
            ]);
        }
        else if (i === 3) {
            this.byteMap.push([
                { x: 1, y: this.edgeLength - 1 },
                { x: 1, y: this.edgeLength - 2 },
                { x: 1, y: this.edgeLength - 3 },
                { x: 0, y: this.edgeLength - 1 },
                { x: 0, y: this.edgeLength - 2 },
                { x: 0, y: this.edgeLength - 3 },
                { x: this.edgeLength - 1, y: this.edgeLength - 1 },
                { x: this.edgeLength - 1, y: 0 }
            ]);
        }
    }
}


function ToX12(byte) {
    if (byte > 0x2f && byte < 0x3a) {
        return byte - 0x2c;
    }
    else if (byte > 0x40 && byte < 0x5b) {
        return byte - 0x33;
    }
    else if (byte === 0x2a) {
        return 0x01;
    }
    else if (byte === 0x3e) {
        return 0x02;
    }
    else if (byte === 0x20) {
        return 0x03;
    }
    else {
        return 0x00;
    }
}

class DataMatrix {
    constructor() { }

    encodeAscii(data) {
        this.symbols = data
            .split('')
            .map((that) => {
                return that.charCodeAt() + 1;
            });

        this.selectSymbolDimensions();
        this.generateEcc();
        this.writeSymbols();

        return this;
    }

    encodeX12(data) {
        this.symbols = [];
        this.symbols.push(0xee);

        for (let i = 0; i < data.length; i += 3) {
            let v = 0x640 * ToX12(data.charCodeAt(i)) + 1;
            if (i + 1 < data.length) v += 0x28 * ToX12(data.charCodeAt(i + 1));
            if (i + 2 < data.length) v += ToX12(data.charCodeAt(i + 2));

            this.symbols.push((v >>> 8) & 0xff);
            this.symbols.push(v & 0xff);
        }

        this.selectSymbolDimensions();

        if (this.symbols.length < this.capacity) {
            this.symbols.push(0xfe);
        }

        this.generateEcc();
        this.writeSymbols();

        return this;
    }

    selectSymbolDimensions() {
        let l = SymbolSizes.length;
        while (l--) {
            if (this.symbols.length <= SymbolSizes[l].capacity) break;
        }
        if (SymbolSizes[l].capacity < this.symbols.length) return false;

        Object.assign(this, SymbolSizes[l]);
        return this;
    }

    randomize253State(codewordPosition) {
        const pseudoRandom = ((149 * codewordPosition) % 253) + 1;
        const tempVariable = 0x81 + pseudoRandom;
        return (tempVariable <= 254 ? tempVariable : tempVariable - 254);
    }

    generateEcc() {
        if (this.symbols.length < this.capacity) {
            this.symbols.push(0x81);
        }
        while (this.symbols.length < this.capacity) {
            this.symbols.push(this.randomize253State(this.symbols.length + 1));
        }

        const rse = ReedSolomonEncoder.factory(this.ecc);

        this.symbols = rse.encode(this.symbols);
    }

    draw(coord) {
        this.pixels.push(coord);
    }

    writeSymbols() {
        this.pixels = [];

        const dt = new DataMatrixByteMap(this);
        this.byteMap = dt.byteMap;

        dt.writeUp({ col: 0, row: 4 }, 3);
        dt.writeDn({ col: 7, row: 1 }, 4);

        if (this.edgeLength > 14) {
            dt.writeUp({ col: 0, row: 12 }, 7);
            dt.writeDn({ col: 15, row: 1 }, 8);
        }

        if (this.edgeLength === 24) {
            dt.cornerCondition(0);
            dt.writeUp({ col: 2, row: 18 }, 10);
            dt.writeDn({ col: 23, row: 1 }, 12);
            dt.writeUp({ col: 6, row: 22 }, 9);
            dt.writeDn({ col: 23, row: 9 }, 8);
            dt.writeUp({ col: 14, row: 22 }, 5);
            dt.writeDn({ col: 23, row: 17 }, 4);
            dt.writeUp({ col: 22, row: 22 }, 1);
        }
        else if (this.edgeLength === 22) {
            dt.cornerCondition(1);
            dt.writeUp({ col: 2, row: 18 }, 9);
            dt.writeDn({ col: 21, row: 3 }, 10);
            dt.writeUp({ col: 8, row: 20 }, 7);
            dt.writeDn({ col: 21, row: 11 }, 6);
            dt.writeUp({ col: 16, row: 20 }, 3);
            dt.writeDn({ col: 21, row: 19 }, 2);
        }
        else if (this.edgeLength === 20) {
            dt.cornerCondition(0);
            dt.writeUp({ col: 2, row: 18 }, 9);
            dt.writeDn({ col: 19, row: 5 }, 8);
            dt.writeUp({ col: 10, row: 18 }, 5);
            dt.writeDn({ col: 19, row: 13 }, 4);
            dt.writeUp({ col: 18, row: 18 }, 1);
        }
        else if (this.edgeLength === 18) {
            dt.writeUp({ col: 4, row: 16 }, 7);
            dt.writeDn({ col: 17, row: 7 }, 6);
            dt.writeUp({ col: 12, row: 16 }, 3);
            dt.writeDn({ col: 17, row: 15 }, 2);
        }
        else if (this.edgeLength === 16) {
            dt.writeUp({ col: 6, row: 14 }, 5);
            dt.writeDn({ col: 15, row: 9 }, 4);
            dt.writeUp({ col: 14, row: 14 }, 1);
        }
        else if (this.edgeLength === 14) {
            dt.cornerCondition(1);
            dt.writeUp({ col: 2, row: 10 }, 5);
            dt.writeDn({ col: 13, row: 3 }, 6);
            dt.writeUp({ col: 8, row: 12 }, 3);
            dt.writeDn({ col: 13, row: 11 }, 2);
        }
        else if (this.edgeLength === 12) {
            dt.cornerCondition(0);
            dt.writeUp({ col: 2, row: 10 }, 5);
            dt.writeDn({ col: 11, row: 5 }, 4);
            dt.writeUp({ col: 10, row: 10 }, 1);
        }
        else if (this.edgeLength === 10) {
            dt.writeUp({ col: 4, row: 8 }, 3);
            dt.writeDn({ col: 9, row: 7 }, 2);
        }
        else if (this.edgeLength === 8) {
            dt.writeUp({ col: 6, row: 6 }, 1);
        }


        for (let i = 0; i < this.byteMap.length; i++) {
            let symbol = this.symbols[i];

            this.byteMap[i].filter((that, j) => {
                return ((symbol >>> j) & 1) !== 0;
            }).map((that) => {
                let { x, y } = that;

                if (y < 0) {
                    y += this.edgeLength;
                    x += 4 - ((this.edgeLength + 4) % 8);
                }

                if (x < 0) {
                    x += this.edgeLength;
                    y += 4 - ((this.edgeLength + 4) % 8);
                }

                this.draw({ x, y, i });
            });
        }
    }

    isoPattern() {
        this.pixels.push({ x: -1, y: this.edgeLength });

        for (let l = this.edgeLength + 1; l--;) {
            this.pixels.push({ x: -1, y: l - 1 });
            this.pixels.push({ x: l, y: this.edgeLength });
        }

        for (let l = this.edgeLength + 2;
            (l -= 2);) {
            this.pixels.push({ x: this.edgeLength, y: l - 2 });
            this.pixels.push({ x: l - 1, y: -1 });
        }

        if (this.edgeLength === 22 || this.edgeLength === 18 || this.edgeLength === 14 || this.edgeLength === 10) {
            this.pixels.push({ x: this.edgeLength - 1, y: this.edgeLength - 1 });
            this.pixels.push({ x: this.edgeLength - 2, y: this.edgeLength - 2 });
        }
    }

    renderAscii() {
        const data = new Array(this.edgeLength + 4);

        for (let i = 0; i < this.edgeLength + 4; i++) {
            data[i] = new Array(this.edgeLength + 4).fill('██');
        }

        this.isoPattern();

        this.pixels.forEach((that) => {
            data[that.y + 2][that.x + 2] = '  '; // (that.i !== undefined) ? that.i.toString().padStart(2, '0') : '  ';
        });

        return data.map((that) => {
            return that.join('');
        }).join('\n');
    }

    renderPBM() {
        const data = new Array(this.edgeLength + 4);

        for (let i = 0; i < this.edgeLength + 4; i++) {
            data[i] = new Array(this.edgeLength + 4).fill('0');
        }

        this.isoPattern();

        this.pixels.forEach((that) => {
            data[that.y + 2][that.x + 2] = '1';
        });

        const size = (this.edgeLength + 4).toString();

        return `P1\n${size} ${size}\n` + data.map((that) => {
            return that.join(' ');
        }).join('\n');
    }
}

export default DataMatrix
