<script setup lang="ts">
import { ref } from 'vue';
import HistoryList from "./components/HistoryList.vue";
import Setting from "./components/Setting.vue"

import { LANGUAGE_MANAGER } from './language';

const tab = ref("historyList");

</script>

<template>
  <div class="full row">
    <q-tab-panels class="row-10 panel fill-width" v-model="tab" animated>
      <q-tab-panel name="historyList" class="q-pa-none q-ma-none">
        <HistoryList />
      </q-tab-panel>

      <q-tab-panel name="setting" class="q-pa-none q-ma-none">
        <Setting />
      </q-tab-panel>
    </q-tab-panels>

    <q-tabs
      v-model="tab"
      dense
      class="row-1 fill-width bg-blue text-white justify-around"
      narrow-indicator
    >
      <q-tab name="historyList" :label="LANGUAGE_MANAGER.getSheet().tabPanel.history"></q-tab>
      <q-tab name="setting" :label="LANGUAGE_MANAGER.getSheet().tabPanel.setting"></q-tab>
    </q-tabs>
  </div>
</template>

<style scoped>
.panel {
  height: 93.88%;
}
.fill-width {
  width: 100%;
}

</style>
