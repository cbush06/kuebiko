<template>
    <div class="modal" :class="{ 'is-active': !!results }">
        <div class="modal-background">
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title"></p>
                    <button class="button is-inverted" @click="cancel()">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>
                <section class="modal-card-body">Some content...</section>
                <footer class="modal-card-foot is-justify-content-flex-end">
                    <button class="button is-success" @click="confirm()">Select</button>
                    <button class="button" @click="cancel()">Cancel</button>
                </footer>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Observable, Subject, Subscription } from 'rxjs';
import { onBeforeUnmount, ref, watch } from 'vue';

export interface ImageSelectorProps {
    shown?: boolean;
}

export interface ImageSelectionPayload {
    path: string;
    title: string;
    alt: string;
}

export interface ImageSelectorEvents {
    (e: 'select', payload: ImageSelectionPayload): void;
    (e: 'cancel'): void;
}

const props = defineProps<ImageSelectorProps>();
const emits = defineEmits<ImageSelectorEvents>();
const results = ref<Subject<ImageSelectionPayload | undefined>>();
let selfSubscription: Subscription | undefined;

defineExpose({
    show,
});

watch(
    () => props.shown,
    (isShown) => {
        if (isShown) show();
    },
    { immediate: true },
);

onBeforeUnmount(() => {
    if (selfSubscription) {
        selfSubscription.unsubscribe();
        selfSubscription = undefined;
    }
});

function show(): Observable<ImageSelectionPayload | undefined> {
    const payloadSubject = new Subject<ImageSelectionPayload | undefined>();
    selfSubscription = payloadSubject.subscribe({
        next: (r) => {
            if (r) {
                emits('select', r);
                return;
            }
            emits('cancel');
        },
        complete: () => (results.value = undefined),
    });
    results.value = payloadSubject;
    return payloadSubject.asObservable();
}

function confirm() {
    if (results.value) {
        results.value.next({} as unknown as ImageSelectionPayload);
        results.value.complete();
        results.value = undefined;
        return;
    }
    throw new Error(
        'confirm() called with an undefined Observable callback -- this could mean the modal was not shown',
    );
}

function cancel() {
    if (results.value) {
        results.value.next(undefined);
        results.value.complete();
        results.value = undefined;
        return;
    }
    throw new Error(
        'cancel() called with an undefined Observable callback -- this could mean the modal was not shown',
    );
}
</script>

<style scoped lang="scss"></style>
