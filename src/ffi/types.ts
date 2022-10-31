export { Timestamp };

class Timestamp {
    stamp: number;

    private constructor(stamp: number) {
        this.stamp = stamp;
    }

    public static now(): Timestamp {
        let stamp = Date.now();
        return new Timestamp(stamp);
    }
}
