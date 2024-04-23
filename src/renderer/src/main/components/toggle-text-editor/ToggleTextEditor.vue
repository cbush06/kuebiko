<template>
    <div class="panel is-shadowless is-flex is-flex-grow-1 is-flex-direction-column">
        <div class="is-flex is-flex-grow-1">
            <div v-if="textMode === 'plain'" class="editor plain">
                <textarea
                    class="textarea is-flex-grow-1"
                    v-model="model"
                    :style="{ 'min-height': props.startingHeight }"
                ></textarea>
            </div>
            <div
                v-else
                class="editor rich is-flex is-flex-direction-column"
                :style="{ 'min-height': props.startingHeight }"
            >
                <MilkdownEditor v-model="model" />
            </div>
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
@import '~bulma/sass/utilities/initial-variables.sass';

.text-mode-button {
    border-top-width: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-color: $grey-light;
    &.is-active {
        background-color: $white-ter;
    }
}

.editor {
    .rich {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }
}
</style>
