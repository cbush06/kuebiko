<template>
    <div class="modal" :class="{ 'is-active': isActive }">
        <div class="modal-background" @click="close('closed')"></div>
        <div class="modal-card">
            <header
                class="modal-card-head is-shadowless"
                :style="{ padding: $slots.header || $props.title ? '' : '0.5rem' }"
            >
                <slot name="header" :close="close">
                    <template v-if="$props.title">
                        <p class="modal-card-title">
                            {{ $props.title }}
                        </p>
                        <button
                            class="delete"
                            :aria-label="t('close')"
                            :title="t('close')"
                            @click="close()"
                        ></button>
                    </template>
                </slot>
            </header>
            <section class="modal-card-body">
                <slot name="body" :close="close"></slot>
            </section>
            <footer class="modal-card-foot is-justify-content-end">
                <slot name="footer" :close="close">
                    <div class="buttons">
                        <button class="button is-success" @click="close('confirmed')">
                            {{ $props.confirmText ?? t('confirm') }}
                        </button>
                        <button class="button" @click="close('cancelled')">
                            {{ $props.cancelText ?? t('cancel') }}
                        </button>
                    </div>
                </slot>
            </footer>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Subject } from 'rxjs';
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

interface BulmaModalProps {
    title?: string;
    confirmText?: string;
    cancelText?: string;
}
defineProps<BulmaModalProps>();

interface BulmaModalEvents {
    (e: 'shown'): void;
    (e: 'closed', string: any): void;
}

const emit = defineEmits<BulmaModalEvents>();
const { t } = useI18n();

const isActive = ref(false);

let resultSubject: Subject<string>;

const show = () => {
    isActive.value = true;
    emit('shown');
    resultSubject = new Subject<any>();
    return resultSubject.asObservable();
};

const hide = () => {
    close('hidden');
};

const close = (reason?: any) => {
    emit('closed', reason);
    isActive.value = false;
    resultSubject.next(reason);
    resultSubject.complete();
};

const escapeKeyListener = (e: KeyboardEvent) => {
    if (e.code === 'Escape' && isActive.value) {
        close('closed');
    }
};

onMounted(() => {
    window.addEventListener('keydown', escapeKeyListener);
});

onUnmounted(() => {
    window.removeEventListener('keydown', escapeKeyListener);
});

defineExpose({ show, hide });
</script>

<style scoped>
.modal-card-head {
    background-color: #fff;
    border: 0;
    padding: 1.5rem 2rem 0rem 2rem;
}

.modal-card-body {
    padding: 1.5rem 2rem;
}
</style>
