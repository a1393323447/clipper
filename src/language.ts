export { LANGUAGE_MANAGER }

import * as enUS from "./languages/en-US.json";
import * as zhCN from "./languages/zh-CN.json";

import { MAX_NAME_LEN, MAX_LABEL_COUNT } from "./label";

import { reactive } from "vue";

type LanguageSheet = typeof enUS;


class LanguageManager {
    private static sheets: Map<string, LanguageSheet>;
    private language: string;

    constructor() {
        LanguageManager.sheets = new Map();
        LanguageManager.sheets.set(enUS.name, enUS);
        LanguageManager.sheets.set(zhCN.name, zhCN);
        
        // default set to english
        this.language = enUS.name;

        for (let sheet of LanguageManager.sheets.values()) {
            sheet.addLabelErrorMsg.tooManyLabels = 
                sheet.addLabelErrorMsg.tooManyLabels.replace("$MAX_LABEL_COUNT$", `${MAX_LABEL_COUNT}`);
            sheet.addLabelErrorMsg.nameTooLong = 
                sheet.addLabelErrorMsg.nameTooLong.replace("$MAX_NAME_LEN$", `${MAX_NAME_LEN}`);
        }
    }

    public setLanguage(language: string) {
        if (LanguageManager.sheets.get(language) !== undefined) {
            this.language = language;
        }
    }

    public getSheet(): LanguageSheet {
        return LanguageManager.sheets.get(this.language) as LanguageSheet;
    }

    public getCurrentLanguage(): string {
        return this.language;
    }

    public availableLanguages(): Array<string> {
        let languages = new Array<string>();
        for (let name of LanguageManager.sheets.keys()) {
            languages.push(name);
        }
        return languages;
    }
}

const LANGUAGE_MANAGER = reactive(new LanguageManager());
