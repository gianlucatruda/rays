export class Color {
    constructor(r, g, b) {
        [this.r, this.g, this.b] = [r, g, b];
    }

    add(c) {
        this.r += c.r; this.g += c.g; this.b += c.b;
        return this;
    }

    scaleBy(x) {
        this.r *= x; this.g *= x; this.b *= x;
        return this;
    }
}

