<script setup lang="ts">

import { ref, reactive, Ref } from "vue";
import { computed } from "@vue/reactivity";

import { clipboard } from "@tauri-apps/api";

import { Timestamp } from "../ffi/types";
import { LANGUAGE_MANAGER } from "../language";
import { ClipboardListener } from "../clipboard"
import { HISTORYS, ArrayReverseIter } from "../history";
import { LabelId, LabelSet, LABEL_MANAGER, validateLabelName } from "../label";

const updateHistory = (newText: string) => {
  if (HISTORYS.isSameAsCopy(newText)) {
    return ;
  } else {
    HISTORYS.clearCopy();
  }
  HISTORYS.addText(newText);
};

const CLIPBOARD_LISTENER = reactive(new ClipboardListener(updateHistory));

async function copyToClipboard(text: string) {
  HISTORYS.copy = text;
  await clipboard.writeText(text);
}

async function deleteHistory(stamp: Timestamp) {
  HISTORYS.removeHistoryByTimestamp(stamp);
}

CLIPBOARD_LISTENER.listen();

const newLabelName = ref("");

const searchLabelName = ref("");

const group: Ref<LabelId[]> = ref([]);

const options = computed(
  () => LABEL_MANAGER
    .getCurrentLabels()
    .map((label) => {
      return { label: label.name, value: label.getId() };
    })
);

const filterHistories = computed(() => {
  let histories = HISTORYS.cache;

  if (searchLabelName.value !== "") {
    histories = histories.filter((history) => history.isMatch(searchLabelName.value));
  }

  if (group.value.length > 0) {
    let labelSet = LabelSet.fromIds(group.value.map((id) => new LabelId(id.getUnderlyingBitMap())));
    histories = histories.filter((history) => history.getLableSet().subset(labelSet));
  }

  return new ArrayReverseIter(histories);
})

const val = ref(false);
</script>

<template>
  <div class="full">
    <q-toolbar>
      <q-input
        :placeholder="LANGUAGE_MANAGER.getSheet().searchInputPlaceholder"
        style="width: 90%;"
        input-style="box-shadow: none;"
        color="blue" 
        v-model="searchLabelName"
        clearable
        dense
        >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-btn-dropdown flat style="border-radius: 30px;box-shadow: none;" color="blue" icon="bookmark" size="1em">  
        <q-option-group
          v-model="group"
          :options="options"
          color="blue"
          type="checkbox"
        />
      </q-btn-dropdown>
    </q-toolbar>

    <!-- Display Histories -->
    <div class="q-pa-md row items-start q-gutter-md" color="white" v-if="!HISTORYS.isEmpty()">
      <q-card vertical class="justify-start full" bordered v-for="history in filterHistories" :key="history.timestamp.stamp">

        <!-- Display Clipboard Text Start -->
        <q-card-section vertical class="q-px-md justify-center item-center ellipsis-3-lines" style="min-height: 20px;">
          <div>{{ history.text }}</div>
          <q-tooltip>{{ history.text }}</q-tooltip>
        </q-card-section>
        <!-- Display Clipboard Text End -->

        <q-separator/>

        <!-- Display Btns Start -->
        <q-card-actions horizontal class="justify-end item-center q-px-md">

          <!-- Copy Btn -->
          <q-btn flat color="blue" style="box-shadow: none;" icon="file_copy" @click="copyToClipboard(history.text)" size="0.8em">
            <q-tooltip>
              {{ LANGUAGE_MANAGER.getSheet().copyBtn }}
            </q-tooltip>  
          </q-btn>

          <!-- Delete Btn -->
          <q-btn flat color="red" style="box-shadow: none;" icon="delete" @click="deleteHistory(history.timestamp)" size="0.8em">
            <q-tooltip>
              {{ LANGUAGE_MANAGER.getSheet().deleteBtn }}
            </q-tooltip>
          </q-btn>

          <!-- Add Label Btn Start -->
          <q-btn flat style="box-shadow: none;" icon="add_circle_outline" size="0.8em">
            <q-tooltip>
              {{ LANGUAGE_MANAGER.getSheet().addLabelBtn }}
            </q-tooltip>
            <q-popup-edit v-model="newLabelName" :cover="false" :offset="[0, 10]" v-slot="scope">
  
              <!-- For Creating New Label -->
              <q-input 
                input-style="box-shadow: none;"
                :label="LANGUAGE_MANAGER.getSheet().newLabelInput.label"
                color="blue" 
                v-model.trim="scope.value" 
                dense 
                counter
                :rules="[validateLabelName]"
                @keyup.enter="
                typeof validateLabelName(scope.value) === 'boolean' && // for vaildate input
                !!(LABEL_MANAGER.addLabel(scope.value), scope.value = '')
                // for add new label to label mananger when it is valid and set scope.value to ''
                "
                >
                <template v-slot:prepend>
                  <q-icon name="bookmark" color="blue" />
                </template>
              </q-input>
              
              <!-- Display a spearator between input and label list -->
              <div v-if="LABEL_MANAGER.hasLabel()">
                <div style="height: 5px;">&nbsp;</div>
                <q-separator/>
                <div style="height: 5px;">&nbsp;</div>
              </div>

              <!-- Display Label List -->
              <q-list bordered separator v-if="LABEL_MANAGER.hasLabel()">
                <q-item clickable v-ripple 
                  v-for="label in LABEL_MANAGER.getCurrentLabels()"
                  @click="history.addLabelById(label.getId())"
                  >
                  <q-item-section>{{ label.name }}</q-item-section>
                </q-item>
              </q-list>

            </q-popup-edit>

          </q-btn>
          <!-- Add Label Btn End -->

        </q-card-actions>
        <!-- Display Btns End -->

        <!-- Display separator if History has label -->
        <q-separator v-if="history.hasLabel()"/>

        <!-- Display Labels if History has label -->
        <q-card-section horizontal class="q-pa-md q-mx-xs justify-start items-start q-gutter-md" v-if="history.hasLabel()">
          <q-card-section class="q-pa-none q-ma-none">
            <q-chip
              :clickable="false"
              style="border-radius: 30px;"
              removable 
              color="blue" 
              text-color="white" 
              v-for="label in history.getLables()" 
              @remove="history.removeLabelById(label.getId())"
              >
              {{ label.name }}
            </q-chip>
          </q-card-section>
        </q-card-section>

      </q-card>
    </div>

    <!-- Display Empty Icon if there is no history -->
    <div class="full" v-else>
      <q-icon name="hourglass_empty" color="blue" class="full" size="30vw" />
    </div>

  </div>
</template>

<style scoped>
.full {
  height: 100%;
  width: 100%;
}
</style>
