<script setup lang="ts">
import { ref } from "vue";
import { useQuasar } from "quasar"
import { HISTORYS } from "../history";
import { LABEL_MANAGER, Label } from "../label"
import { LANGUAGE_MANAGER } from "../language";

const $q = useQuasar();

function showNotify(labelName: string) {
  let sheet = LANGUAGE_MANAGER.getSheet();
  let msg = sheet
    .setting.removeLabelErrorNotifyMsg.header
    .replace("$LABEL_NAME$", labelName);
  $q.notify({
      message: msg,
      caption: sheet.setting.removeLabelErrorNotifyMsg.caption,
      icon: "error",
      color: "red",
      textColor: "white",
      actions: [{ icon: 'close', color: 'white', style: "box-shadow: none;" }],
      timeout: 3000,
  })
}

function removeLabel(label: Label) {
    let historiesRefLabel = HISTORYS.cache.filter(
        (history) => history.getLableSet().contains(label.getId())
    );

    if (historiesRefLabel.length != 0 ) {
        showNotify(label.name);
        return ;
    }

    LABEL_MANAGER.removeLabel(label);
}

const languageChoice = ref(LANGUAGE_MANAGER.getCurrentLanguage());
const availableLanguages = LANGUAGE_MANAGER.availableLanguages()
  .map((name) => { return { label: name, value: name } });

function updateLanguageChoice(choice: string) {
  languageChoice.value = choice;
  LANGUAGE_MANAGER.setLanguage(choice);
}

</script>

<template>
  <div class="full">
    <q-list bordered padding>

      <q-item :clickable="false">
        <q-item-section>
          <q-item-label>{{ LANGUAGE_MANAGER.getSheet().setting.manageLabels.header }}</q-item-label>
          <q-item-label caption>{{ LANGUAGE_MANAGER.getSheet().setting.manageLabels.caption }}</q-item-label>
          <q-card vertical class="remove-shadow">
            <q-card-section horizontal class="q-pa-md justify-start items-start q-gutter-md" v-if="LABEL_MANAGER.hasLabel()">
            <q-card-section class="q-pa-none q-ma-none">
              <q-chip
                :clickable="false"
                style="border-radius: 30px;"
                removable 
                color="blue" 
                text-color="white" 
                v-for="label in LABEL_MANAGER.getCurrentLabels()" 
                @remove="removeLabel(label)"
                >
                  {{ label.name }}
              </q-chip>
            </q-card-section>
            </q-card-section>
            <q-card-section class="q-pa-md justify-center items-center q-gutter-md" v-else>
              <q-card-section class="text-blue justify-center items-center">
                  {{ LANGUAGE_MANAGER.getSheet().setting.manageLabels.emptyMsg }}
              </q-card-section>
            </q-card-section>
          </q-card>
        </q-item-section>
      </q-item>
      <!-- Label Manage End -->

      <q-separator spaced />

      <q-item class="q-pa-xs">
        <q-expansion-item
            class="q-pa-none"
            expand-separator
            style="width: 100%;"
            icon="language"
            :label="LANGUAGE_MANAGER.getSheet().setting.languageSetting.header"
          >
          <q-option-group
            :model-value="languageChoice"
            @update:model-value="updateLanguageChoice($event)"
            :options="availableLanguages"
            color="primary"
          />
          </q-expansion-item>
      </q-item>
    </q-list>
  </div>
</template>

<style scoped>
.remove-shadow {
    box-shadow: none;
}
</style>
