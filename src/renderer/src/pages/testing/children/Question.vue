<template>
    <div class="section content">
        <!-- prettier-ignore -->
        <MdPreview 
            :modelValue="questionContent?.data.toString() ?? t('noQuestionContent')" 
            noMermaid 
            noKatex 
            noHighlight 
            noIconfont 
        />
    </div>
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3';
import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { useTestDeliveryStore } from '@renderer/store/test-delivery-store/test-delivery-store';
import { from, useObservable } from '@vueuse/rxjs';
import { liveQuery } from 'dexie';
import { useI18n } from 'vue-i18n';
import { Resource } from '@renderer/db/models/resource';

const testDeliveryStore = useTestDeliveryStore();
const { t } = useI18n({ inheritLocale: true, useScope: 'local' });

// prettier-ignore
const questionContent = useObservable(
    from(liveQuery<Resource | undefined>(async () => 
        await KuebikoDb.INSTANCE.resources.where('uuid').equals(testDeliveryStore.deliveryItem!.getContentRef()).first()
    )),
);

testDeliveryStore.deliveryItem?.visit();
</script>

<style scoped></style>

<i18n lang="json">
{
    "en": {
        "noQuestionContent": "Uh oh! There was no question content for this item."
    }
}
</i18n>
@renderer/db/kuebiko-db
