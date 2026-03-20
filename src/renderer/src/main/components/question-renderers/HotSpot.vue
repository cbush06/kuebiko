<template>
    <div class="content block">
        <!-- prettier-ignore -->
        <MdPreview
            :modelValue="props.questionContent"
            noMermaid
            noKatex
            noHighlight
            noIconfont
        />
    </div>
    <div class="block is-flex is-flex-direction-row is-justify-content-center">
        <AreaPicker
            v-model="polys"
            class="is-inline-block"
            :image="props.subjectImageData"
            :mime="props.subjectImageMime"
            :width="800"
            :height="600"
        />
    </div>
</template>

<script setup lang="ts">
import { RendererBaseProps } from '@renderer/components/question-renderers/renderer-base-props';
import { MdPreview } from '@node/md-editor-v3';
import { Point } from '@renderer/db/models/point';
import { computed, onBeforeMount, ref } from 'vue';
import { DeliveryTestObjectProvider } from '@renderer/services/delivery-test-object-provider';
import AreaPicker from '@renderer/components/area-picker/AreaPicker.vue';

export interface HotSpotProps extends RendererBaseProps {
    hotZones: Point[][];
    subjectImageData?: Uint8Array;
    subjectImageMime?: string;
}

const props = defineProps<HotSpotProps>();
const model = defineModel<Point[][]>({
    default: [],
});

const polys = computed({
    get: () =>
        (model.value as Point[][]).map((coords) => coords.map(({ x, y }) => [x, y])) as Array<Array<[number, number]>>,

    set: (value: Array<Array<[number, number]>>) =>
        // eslint-disable-next-line vue/no-mutating-props
        (model.value = value.map((coords) =>
            coords.map(([x, y]) => ({
                x,
                y,
            })),
        )),
});
</script>

<style lang="scss" scoped></style>