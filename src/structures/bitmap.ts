export { Bitmap }
export { MAX_BIT_COUNT }

const MAX_BIT_COUNT: number = 64;

class Bitmap {
    private bits: number = 0;

    public static empty(): Bitmap {
        return new Bitmap();
    }

    public isEmpty(): boolean {
        return this.bits == 0;
    }

    public getUnderlyBits(): number {
        return this.bits;
    }

    public static fromRaw(bits: number): Bitmap {
        let bitmap = new Bitmap();
        bitmap.bits = bits;

        return bitmap;
    }

    public set(bitmap: Bitmap) {
        this.bits |= bitmap.bits; 
    }

    public unset(bitmap: Bitmap) {
        this.bits &= ~bitmap.bits;
    }

    public clear() {
        this.bits = 0;
    }

    public trailingZeros(): number {
        let bits = this.bits;
        let zeros = 0;
        while (bits != 0) {
            bits = bits >> 1;
            zeros += 1;
        }
        return zeros;
    }
}
