export { History, HistoryManager, ArrayReverseIter, HISTORYS }

import { Timestamp } from "./ffi/types"
import { Label, LabelId, LabelSet, LABEL_MANAGER } from "./label"

import { reactive } from "vue";

class History {
    public timestamp: Timestamp;
    public text: string;
    private labels: LabelSet;

    public constructor(timestamp: Timestamp, text: string) {
        this.timestamp = timestamp;
        this.labels = LabelSet.emptySet();
        this.text = text;
    }

    public isMatch(text: string): boolean {
        return this.text.search(new RegExp(text)) != -1;
    }

    public hasLabel(): boolean {
        return !this.labels.isEmpty();
    }

    public addLabelById(id: LabelId) {
        this.labels.addLableById(id);
    }

    public removeLabelById(id: LabelId) {
        this.labels.removeLableById(id);
    }

    public getLableSet(): LabelSet {
        return this.labels;
    }

    public getLables(): Array<Label> {
        return LABEL_MANAGER.getLabelsBySet(this.labels);
    }
}

class ArrayReverseIter<T> implements IterableIterator<T> {
    private array: Array<T>;
    private idx: number = 0;

    constructor(array: Array<T>) {
        this.array = array;
        this.idx = array.length - 1;
    }

    [Symbol.iterator](): IterableIterator<T> {
        return this;
    }
    next(...args: [] | [undefined]): IteratorResult<T, any> {
        if (this.idx == - 1) {
            return { done: true, value: null }
        } else {
            let item = this.array[this.idx];
            this.idx -= 1;
            return { done: false, value: item };
        }
    }
    
    return?(value?: any): IteratorResult<T, any> {
        throw new Error("Method not implemented.");
    }
    throw?(e?: any): IteratorResult<T, any> {
        throw new Error("Method not implemented.");
    }
}

class HistoryManager {
    public cache: Array<History>;
    public copy: string|null = null;
    
    public constructor() {
        this.cache = new Array();
    }

    public isEmpty(): boolean {
        return this.cache.length == 0;
    }

    public setCopy(text: string) {
        this.copy = text;
    }

    public clearCopy() {
        this.copy = null;
    }

    public isSameAsCopy(text: string) {
        return this.copy !== null && this.copy == text;
    }

    public lastHistoryText(): string|null {
        if (this.cache.length == 0) {
            return null;
        } else {
            return this.cache[this.cache.length - 1].text;
        }
    }

    public addText(text: string) {
        if (this.cache.length == 0 || text != this.cache[this.cache.length - 1].text) {
            let timestamp = Timestamp.now();
            let history = new History(timestamp, text);
            this.add(history);
        }
    }

    public add(history: History) {
        this.cache.push(history);
    }

    public removeHistoryByTimestamp(stamp: Timestamp) {
        this.cache = this.cache.filter((value) => value.timestamp.stamp != stamp.stamp);
    }

    public reverse(): IterableIterator<History> {
        return new ArrayReverseIter(this.cache);
    }
}

const HISTORYS = reactive(new HistoryManager());