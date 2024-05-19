export class Color {
    constructor(r, g, b) {
        [this.r, this.g, this.b] = [r, g, b];
    }

    static add(a, b) {
        return new Color(
            a.r + b.r,
            a.g + b.g,
            a.b + b.b,
        );
    }

    scaleBy(x) {
        return new Color(
            this.r * x,
            this.g * x,
            this.b * x,
        );
    }
}

