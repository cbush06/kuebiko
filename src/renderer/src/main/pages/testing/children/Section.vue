<template>
    <div class="section content">
        <MdPreview :modelValue="sectionContent" noMermaid noKatex noHighlight noIconfont />
    </div>
</template>

<script setup lang="ts">
import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { SectionDeliveryItem } from '@renderer/store/test-delivery-store/delivery-item/section-delivery-item';
import { useTestDeliveryStore } from '@renderer/store/test-delivery-store/test-delivery-store';
import { MdPreview } from 'md-editor-v3';
import { onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const testDeliveryStore = useTestDeliveryStore();
const { t } = useI18n({ inheritLocale: true, useScope: 'local' });
const sectionContent = ref(t('defaultSectionIntro', { sectionTitle: 'Unknown Section' }));

const updateSectionContent = async (newSection: SectionDeliveryItem) => {
    const sectionDescriptionResource = (
        await KuebikoDb.INSTANCE.resources
            .where('uuid')
            .equals(newSection?.getContentRef() ?? 'nonce')
            .first()
    )?.data as string;
    sectionContent.value =
        newSection?.getContentText() ??
        sectionDescriptionResource ??
        t('defaultSectionIntro', {
            sectionTitle: testDeliveryStore.section?.title ?? 'Unknown Section',
        });
};

onBeforeMount(() => updateSectionContent(testDeliveryStore.deliveryItem as SectionDeliveryItem));
watch(() => testDeliveryStore.deliveryItem as SectionDeliveryItem, updateSectionContent);

testDeliveryStore.deliveryItem?.visit();
</script>

<style scoped></style>

<i18n lang="json">
{
    "en": {
        "defaultSectionIntro": "# Section: {sectionTitle}\nNo description provided."
    }
}
</i18n>
