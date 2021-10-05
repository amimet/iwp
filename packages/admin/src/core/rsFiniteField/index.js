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

export default (size, generator, base) => {
    const ExpTable = [];
    const LogTable = [0];

    let j = 1;
    for (let i = 0; i < size; i++) {
        ExpTable[i] = j;
        j = j << 1;
        if (j >= size) j ^= generator;
    }
    for (let i = 0; i < size - 1; i++) {
        LogTable[ExpTable[i]] = i;
    }

    const Base = base;
    const Size = size - 1;

    function Zero(x) {
        return x === 0;
    }

    function One(x) {
        return x === 1;
    }

    function Multiply(x, y) {
        if (x === 0 || y === 0) return 0;
        return ExpTable[(LogTable[x] + LogTable[y]) % Size];
    }

    function Invert(x) {
        return ExpTable[Size - LogTable[x]];
    }

    function Divide(x, y) {
        return Multiply(x, Invert(y));
    }

    function Log(x) {
        return LogTable[x];
    }

    function Exp(x) {
        return ExpTable[x];
    }

    function Add(x, y) {
        return x ^ y;
    }

    class Polynomial {
        constructor() { }

        copy() {
            const that = new Polynomial();
            that.coefficients = this.coefficients.slice(0);
            return that;
        }

        reduce() {
            let l = this.coefficients.length;
            if (l === 1) {
                return this;
            }

            while (this.coefficients.length > 1 && Zero(this.leadingCoefficient())) {
                this.coefficients.pop();
            }

            return this;
        }

        degree() {
            return this.coefficients.length - 1;
        }

        leadingCoefficient() {
            return this.coefficients[this.degree()];
        }

        constantCoefficient() {
            return this.coefficients[0];
        }

        zero() {
            return (this.degree() === 0 && this.constantCoefficient() === 0);
        }

        coefficientAt(i) {
            if (i > this.degree())
                return 0;

            return this.coefficients[i];
        }

        evaluateAt(a) {
            if (Zero(a)) {
                return this.constantCoefficient();
            }
            else if (One(a)) {
                let result = 0;
                for (let l = this.coefficients.length; l--;) {
                    result = Add(result, this.coefficients[l]);
                }
                return result;
            }

            let result = this.leadingCoefficient();
            for (let l = this.degree(); l--;) {
                result = Add(Multiply(result, a), this.coefficients[l]);
            }

            return result;
        }

        add(that) {
            for (let l = Math.max(this.coefficients.length, that.coefficients.length), i = 0; l--; i++) {
                this.coefficients[i] = Add(this.coefficientAt(i), that.coefficientAt(i));
            }

            return this.reduce();
        }

        multiply(that) {
            const newSize = that.coefficients.length + this.coefficients.length + 1;
            const coefficients = new Array(newSize).fill(0);

            that.coefficients.map((that) => {
                return this.copy().multiplyByScalar(that);
            }).forEach((that, i) => {
                that.coefficients.forEach((that, j) => {
                    coefficients[i + j] = Add(coefficients[i + j], that);
                });
            });

            this.coefficients = coefficients;
            return this.reduce();
        }

        multiplyByScalar(coefficient) {
            for (let l = this.coefficients.length; l--;) {
                this.coefficients[l] = Multiply(this.coefficients[l], coefficient);
            }

            return this;
        }

        findZeroes() {
            const errorCount = this.degree();

            if (errorCount === 1) {
                return [Invert(this.leadingCoefficient())];
            }

            const zeroes = [];
            for (let i = 1, l = Size; l--; i++) {
                if (!Zero(this.evaluateAt(i))) continue;
                zeroes.push(i);
                if (zeroes.length === errorCount) return zeroes;
            }

            return zeroes;
        }

        shift(degree) {
            for (let l = degree; l--;) {
                this.coefficients.unshift(0);
            }

            return this;
        }

        euclideanAlgorithm(r, rLast) {
            while (r.degree() >= rLast.degree() && r.leadingCoefficient() !== 0) {
                const degreeDiff = r.degree() - rLast.degree();
                const scale = Divide(r.leadingCoefficient(), rLast.leadingCoefficient());

                this.add(Polynomial.monomial(degreeDiff, scale));
                r.add(rLast.copy().multiplyByScalar(scale).shift(degreeDiff));
            }
            return this;
        }

        toLaTeX() {
            const cols = this.coefficients.map((coefficient, power) => {
                return { coefficient, power };
            }).filter((that) => {
                return !Zero(that.coefficient);
            }).reverse().map((that) => {
                const { coefficient, power } = that;
                const coefficientLaTeX = `\\text{${coefficient.toString(16).padStart(2, '0').toUpperCase()}}_{16}`;
                if (power === 0) {
                    return `${coefficientLaTeX}`;
                }
                else if (power === 1) {
                    return `${coefficientLaTeX}a`;
                }

                let powerString = power.toString();
                if (powerString.length > 1) powerString = '{' + powerString + '}';
                return `${coefficientLaTeX}a^${powerString}`;
            });

            if (!cols.length) {
                cols.push(this.constantCoefficient().toString());
            }

            return cols.join(' + ');
        }
    }

    Polynomial.from = (array, BLOCKS_ECC) => {
        const poly = Polynomial.fromArray(array);
        const that = new Polynomial();
        that.coefficients = new Array(BLOCKS_ECC);

        for (let i = BLOCKS_ECC; i--;) {
            that.coefficients[i] = poly.evaluateAt(Exp(One(Base) ? i : i + 1));
        }

        return that.reduce();
    };

    Polynomial.monomial = (degree, scale) => {
        const that = new Polynomial();
        that.coefficients = new Array(degree).fill(0);
        that.coefficients[degree] = scale;

        return that;
    };

    Polynomial.zero = () => {
        const that = new Polynomial();
        that.coefficients = [0];

        return that;
    };

    Polynomial.one = () => {
        const that = new Polynomial();
        that.coefficients = [1];

        return that;
    };

    Polynomial.fromArray = (array) => {
        const that = new Polynomial();
        that.coefficients = array.slice().reverse();
        that.reduce();

        return that;
    };

    class ErrorCorrectingAlgorithm {
        constructor(rsSyndrome, BLOCKS_ECC) {
            this.t = Polynomial.one();
            this.r = rsSyndrome;
            this.tNext = Polynomial.zero();
            this.rNext = Polynomial.monomial(BLOCKS_ECC, 1);
        }

        calculate() {
            if (this.r.leadingCoefficient() === 0) return true;

            const tNextNext = this.t;
            this.t = Polynomial.zero().euclideanAlgorithm(this.rNext, this.r).multiply(this.t).add(this.tNext);

            this.tNext = tNextNext;

            const rNextNext = this.r;
            this.r = this.rNext;
            this.rNext = rNextNext;

            return (this.r.degree() >= this.rNext.degree());
        }

        repair(array) {

            const inverse = Invert(this.t.constantCoefficient());

            const evaluator = this.r.multiplyByScalar(inverse);
            const zeroes = this.t.multiplyByScalar(inverse).findZeroes();

            this.t = undefined;
            this.r = undefined;
            this.tNext = undefined;
            this.rNext = undefined;

            for (let i = 0; i < zeroes.length; i++) {
                const eccPosition = array.length - Log(Invert(zeroes[i])) - 1;
                if (eccPosition < 0 || eccPosition > array.length) {
                    continue;
                }

                let denominator = 1;
                for (var j = 0; j < zeroes.length; j++) {
                    if (i === j) continue;
                    denominator = Multiply(denominator, Add(1, Divide(zeroes[i], zeroes[j])));
                }

                let k = evaluator.evaluateAt(zeroes[i]);

                if (!One(base)) {
                    k = Multiply(evaluator.evaluateAt(zeroes[i]), zeroes[i]);
                }

                array[eccPosition] ^= Divide(k, denominator);
            }
        }
    }

    function ReedSolomonDecoder(array, BLOCKS_ECC) {
        const rsSyndrome = Polynomial.from(array, BLOCKS_ECC);
        if (rsSyndrome.zero()) return false;

        const that = new ErrorCorrectingAlgorithm(rsSyndrome, BLOCKS_ECC);
        const R = BLOCKS_ECC / 2;
        while (that.r.coefficients.length >= R)
            if (that.calculate()) return true;

        if (that.t.constantCoefficient() === 0) return true;

        return that.repair(array);
    }

    class ReedSolomonEncoder {
        encode(array) {
            const output = new Array(array.length + this.coefficients.length);

            for (let l = array.length; l--;) {
                output[l] = array[l];
            }

            const ecc = new Array(this.coefficients.length).fill(0);

            for (let i = 0; i < array.length; i++) {
                ecc.push(0);
                const factor = Add(array[i], ecc.shift());
                for (var j = 0; j < this.coefficients.length; j++)
                    ecc[j] = Add(ecc[j], Multiply(this.coefficients[j], factor));
            }

            ecc.forEach((that, i) => {
                output[array.length + i] = that;
            });

            return output;
        }
    }

    ReedSolomonEncoder.factory = (BLOCKS_ECC) => {
        const that = new ReedSolomonEncoder();

        that.coefficients = new Array(BLOCKS_ECC);
        that.coefficients.fill(0);
        that.coefficients[BLOCKS_ECC - 1] = 1;

        let root = Base;
        for (let i = 0; i < BLOCKS_ECC; i++) {
            for (let j = 0; j < BLOCKS_ECC; j++) {
                that.coefficients[j] = Multiply(that.coefficients[j], root);
                if (j + 1 < BLOCKS_ECC)
                    that.coefficients[j] = Add(that.coefficients[j], that.coefficients[j + 1]);
            }

            root = Multiply(root, 2);
        }

        return that;
    };

    return { Zero, One, Add, Multiply, Divide, Exp, Log, Invert, Size, Base, Polynomial, ErrorCorrectingAlgorithm, ReedSolomonDecoder, ReedSolomonEncoder };
};