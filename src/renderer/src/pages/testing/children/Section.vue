<template>
    <div class="section content">
        <MdPreview
            :modelValue="sectionDescription ?? t('defaultSectionIntro', { sectionTitle: testDeliveryStore.section?.title ?? 'Unknown Section' })"
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
import { from, useObservable } from '@vueuse/rxjs';
import { liveQuery } from 'dexie';
import { KuebikoDb } from '@renderer/db/kuebiko-db';

const testDeliveryStore = useTestDeliveryStore();
const { t } = useI18n({ inheritLocale: true, useScope: 'local' });
const sectionDescription = useObservable(
    from(
        liveQuery<string | undefined>(
            async () => (await KuebikoDb.INSTANCE.resources.where('uuid').equals(testDeliveryStore.section!.descriptionRef!).first())?.data as string,
        ),
    ),
);

testDeliveryStore.deliveryItem?.visit();
</script>

<style scoped></style>

<i18n lang="json">
{
    "en": {
        "defaultSectionIntro": "# Section: {sectionTitle}"
    }
}
</i18n>
@renderer/db/kuebiko-db
