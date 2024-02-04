<template>
    <div class="section content">
        <MdPreview
            :modelValue="testDeliveryStore.description ?? t('defaultTestIntro', { testName: testDeliveryStore.test?.title ?? 'Unknown Test' })"
            noMermaid
            noKatex
            noHighlight
            noIconfont
        />
    </div>
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3';
import { useTestDeliveryStore } from '@renderer/store/test-delivery-store/test-delivery-store';
import { useI18n } from 'vue-i18n';

const testDeliveryStore = useTestDeliveryStore();
const { t } = useI18n({ inheritLocale: true, useScope: 'local' });
</script>

<style scoped lang="scss"></style>

<i18n lang="json">
{
    "en": {
        "defaultTestIntro": "# Welcome to {testName}\nNo description was provided for this test. Please click **Next** to begin."
    }
}
</i18n>
