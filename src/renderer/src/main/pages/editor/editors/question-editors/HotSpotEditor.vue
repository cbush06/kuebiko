<template>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Image</label>
        </div>
        <div class="field-body is-justify-content-center">
            <label v-if="!imageBytes" class="image is-5by3 placeholder rounded-lg">
                <input type="file" @change="selectFile" accept="image/bmp, image/jpeg, image/png" />
                <p class="instructions">{{ t('instructions') }}</p>
            </label>
            <AreaEditor
                v-else
                v-model="polys"
                :image="imageBytes"
                :mime="imageType"
                :width="800"
                :height="600"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from '~/vue-i18n';
import AreaEditor from '@renderer/components/area-editor/AreaEditor.vue';
import { Question } from '@renderer/db/models/question';
import { useTestEditorStore } from '@renderer/store/test-editor-store/test-editor-store';
import { EditorTestObjectProvider } from '@renderer/services/editor-test-object-provider';
import { Point } from '@renderer/db/models/point';

const { t } = useI18n({ inheritLocale: true, useScope: 'local', fallbackRoot: true });
const imageBytes = ref<Uint8Array>();
const imageType = ref<string>();
const testEditorStore = useTestEditorStore();

const { question } = defineProps<{ question: Question }>();

onBeforeMount(async () => {
    if (question.subjectImageRef) {
        const image = await EditorTestObjectProvider.fetchResource(question.subjectImageRef);
        if (image) {
            imageBytes.value = image.data as Uint8Array;
            imageType.value = image.mime;
        }
    }
});

const polys = computed({
    get: () =>
        (question.answer as Point[][]).map((coords) => coords.map(({ x, y }) => [x, y])) as Array<
            Array<[number, number]>
        >,

    set: (value: Array<Array<[number, number]>>) =>
        // eslint-disable-next-line vue/no-mutating-props
        (question.answer = value.map((coords) =>
            coords.map(([x, y]) => ({
                x,
                y,
            })),
        )),
});

async function selectFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0] as File;
    if (file) {
        imageBytes.value = new Uint8Array(await file.arrayBuffer());
        imageType.value = file.type;

        // Store image for question
        // eslint-disable-next-line vue/no-mutating-props
        question.subjectImageRef = testEditorStore.addResource(
            file.name,
            'IMAGE',
            file.type,
            imageBytes.value,
        );
    }
}
</script>

<style lang="scss" scoped>
.placeholder {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;

    position: relative;
    background-color: #f5f5f5;
    min-width: 800px;

    input {
        display: none;
    }

    &:hover {
        cursor: pointer;
        background-color: #ddd;

        &::before,
        .instructions {
            color: #aaa;
        }

        &:active,
        &:focus {
            background-color: #aaa;

            &::before,
            .instructions {
                color: #ccc;
            }
        }
    }

    &::before {
        position: absolute;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);

        font-family: 'Font Awesome 6 Free';
        font-weight: 900;
        font-size: 200px;
        content: '\f03e';
        color: #ccc;
    }

    .instructions {
        font-size: 1.5rem;
        font-weight: bold;
        color: #ccc;
        margin-bottom: 10%;
    }
}
</style>

<i18n lang="json">
{
    "en": {
        "instructions": "Click to select an image"
    }
}
</i18n>