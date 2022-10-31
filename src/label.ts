export { Label, LabelId, LabelSet }

export { LABEL_MANAGER, MAX_LABEL_COUNT, MAX_NAME_LEN, validateLabelName }

import { reactive } from "vue";

import { LANGUAGE_MANAGER } from "./language";
import { Bitmap, MAX_BIT_COUNT } from "./structures/bitmap";

const MAX_NAME_LEN = 12;
const MAX_LABEL_COUNT = MAX_BIT_COUNT;

class LabelId {
    private bitmap: Bitmap;

    public constructor(bitmap: Bitmap) {
        this.bitmap = bitmap;
    }

    public static fromIdx(idx: number): LabelId {
        let bits = 1 << idx;
        return new LabelId(Bitmap.fromRaw(bits));
    }

    public getUnderlyingBitMap(): Bitmap {
        return this.bitmap;
    }

    public asIdx(): number {
        return this.bitmap.trailingZeros();
    }
}

class Label {
    public name: string;
    private id: LabelId;

    constructor(name: string, id: LabelId) {
        this.name = name;
        this.id = id;
    }

    public getId(): LabelId {
        return this.id;
    }
}

class LabelSet {
    private labelIds: Bitmap;

    constructor() {
        this.labelIds = Bitmap.empty();
    }

    public static emptySet(): LabelSet {
        return new LabelSet();
    }

    public static fromIds(ids: LabelId[]): LabelSet {
        let emptySet = LabelSet.emptySet();
        ids.forEach((id) => emptySet.addLableById(id));
        return emptySet;
    }

    public contains(id: LabelId) {
        let idBits = id.getUnderlyingBitMap().getUnderlyBits();
        let labelBits = this.labelIds.getUnderlyBits();

        return (idBits & labelBits) != 0;
    }

    public subset(set: LabelSet): boolean {
        let setBits = set.labelIds.getUnderlyBits();
        let labelBist = this.labelIds.getUnderlyBits()
        return (labelBist & setBits) == setBits;
    }

    public isEmpty(): boolean {
        return this.labelIds.isEmpty();
    }

    public addLableById(id: LabelId) {
        this.labelIds.set(id.getUnderlyingBitMap());  
    }

    public removeLableById(id: LabelId) {
        this.labelIds.unset(id.getUnderlyingBitMap());
    }
}

class LabelManager {
    // for tracking free id
    private ids: Array<LabelId>;
    // cache current labels
    private labels: Array<Label>;

    constructor() {
        this.ids = new Array<LabelId>();
        this.labels = new Array<Label>();

        for (let idx = 0; idx < MAX_BIT_COUNT; idx++) {
            this.ids.push(LabelId.fromIdx(idx));
        }
    }

    public hasLabel(): boolean {
        return this.labels.length > 0;
    }

    public getCurrentLabels(): Array<Label> {
        return this.labels;
    }

    public addLabel(name: string) {
        if (this.isNameExisted(name)) {
            return;
        }
    
        let res = this.getFreeId();
        if (res === undefined) {
            throw new Error(`Too many labels! The max number of labels is ${MAX_BIT_COUNT}!`);
        }

        let id = res as LabelId;
        let newLabel = new Label(name, id);
        this.labels.push(newLabel);
    }

    public removeLabel(labelToRemove: Label) {
        this.labels = this.labels.filter((label) => label.getId() != labelToRemove.getId());
        this.ids.push(labelToRemove.getId());
    }

    public getLabelByName(name: string): Label|undefined {
        return this.labels.find((label) => label.name == name);
    }

    public getFreeId(): LabelId|undefined {
        return this.ids.pop();
    }

    public getLabelsBySet(set: LabelSet): Array<Label> {
        let labels = this.labels.filter((label) => set.contains(label.getId()));

        return labels;
    }

    public hasFreeId(): boolean {
        return this.ids.length > 0;
    }

    private isNameExisted(name: string): boolean {
        return this.getLabelByName(name) !== undefined;
    }
}

function validateLabelName(name: string): boolean|string {
    let sheet = LANGUAGE_MANAGER.getSheet();
    if (!LABEL_MANAGER.hasFreeId()) {
        return sheet.addLabelErrorMsg.tooManyLabels;
    }
    
    if (name.length == 0) {
        return sheet.addLabelErrorMsg.emptyLabelName;
    } else if (name.length > 12) {
        return sheet.addLabelErrorMsg.nameTooLong;
    }

    return true;
}

const LABEL_MANAGER = reactive(new LabelManager());
