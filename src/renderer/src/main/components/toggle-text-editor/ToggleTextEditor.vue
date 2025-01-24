<template>
    <div class="panel is-shadowless is-flex is-flex-grow-1 is-flex-direction-column">
        <div
            class="is-flex is-flex-grow-1 is-align-items-stretch"
            :style="{ 'min-height': props.startingHeight }"
        >
            <textarea
                v-if="textMode === 'plain'"
                class="textarea"
                v-model="model"
                :style="{ 'min-height': props.startingHeight }"
            ></textarea>
            <MilkdownEditor v-else v-model="model" />
        </div>
        <div class="panel-tabs is-justify-content-end pr-4 is-flex-grow-0">
            <div class="buttons has-addons">
                <button
                    class="button is-small text-mode-button"
                    :class="{ 'is-active': textMode === 'rich' }"
                    @click="textMode = 'rich'"
                >
                    <i class="fa-solid fa-brush mr-1"></i> Rich
                </button>
                <button
                    class="button is-small text-mode-button"
                    :class="{ 'is-active': textMode === 'plain' }"
                    @click="textMode = 'plain'"
                >
                    <i class="fa-solid fa-font mr-1"></i> Plain
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MilkdownEditor from '../milkdown-editor/MilkdownEditor.vue';

interface ToggleTextEditorProps {
    startingHeight: string;
}

const props = defineProps<ToggleTextEditorProps>();
const model = defineModel({ default: '' });
const textMode = ref<'plain' | 'rich'>('rich');
</script>

<style scoped lang="scss">
@use '~bulma/sass/utilities/initial-variables.scss' as *;

.text-mode-button {
    border-top-width: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-color: $grey-light;
    &.is-active {
        background-color: $white-ter;
    }
}
</style>
