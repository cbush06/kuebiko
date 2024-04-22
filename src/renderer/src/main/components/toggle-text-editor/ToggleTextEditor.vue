<template>
    <div class="panel is-shadowless w-100">
        <div>
            <div v-if="textMode === 'plain'" class="editor plain">
                <textarea class="textarea" v-model="model"></textarea>
            </div>
            <div v-else class="editor rich">
                <MilkdownEditor v-model="model" />
            </div>
        </div>
        <div class="panel-tabs is-justify-content-end pr-4">
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
    .plain {
        textarea {
            min-height: 16rem;
        }
    }
    .rich {
        display: flex;
        flex-direction: column;
        min-height: 16rem;
    }
}
</style>
