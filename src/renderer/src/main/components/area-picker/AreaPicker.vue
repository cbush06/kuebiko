<template>
    <div id="stage" ref="stageEl"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Konva from '@node/konva';
import { scaleImage } from '@renderer/utils/image-utils';
import { DragPoint } from '@renderer/components/konva-shapes/drag-point';

// NOTE: While this model is Array<Array<[number, number]>>, it is expected to only contain a
// single polygon (i.e. a single array of points). This is because the area picker is designed
// to only allow the user to select a single area at a time.
//
// The reason for the odd type is to be compatible with QuestionEvaluators which expect the
// "correct" response to be the same format as the "user" response. In this case, the correct
// response is the area of the containing polygon while the user response is a single point.
const model = defineModel<Array<Array<[number, number]>>>({
    default: [],
});

const props = defineProps<{
    mime?: string;
    image?: Uint8Array;
    width?: number;
    height?: number;
}>();

const stageEl = ref<HTMLDivElement>();
let stage: Konva.Stage;
let polyLayer: Konva.Layer;
let imageLayer: Konva.Layer;

onMounted(() => {
    // If image is selected at load-time, go ahead and show it
    if (props.image && props.mime && props.width && props.height) {
        showImage(props.image, props.mime, props.width, props.height);
    }
});

/**
 * Watches for changes to the image and initializes the stage when an image is selected.
 */
watch<[Uint8Array | undefined, string | undefined, number | undefined, number | undefined]>(
    () => [props.image, props.mime, props.width, props.height],
    ([image, mime, width, height]) => {
        if (image && mime && width && height) {
            showImage(image, mime, width, height);
        }
    },
);

async function showImage(
    image: Uint8Array,
    imageMime: string,
    maxWidth: number,
    maxHeight: number,
) {
    const base64Data = btoa(image.reduce((data, byte) => data + String.fromCharCode(byte), ''));
    const imageEl = new window.Image();
    imageEl.addEventListener('load', () => {
        scaleImage(imageEl, maxWidth, maxHeight);
        initializeStage(imageEl.width, imageEl.height, imageEl);
    });
    imageEl.src = `data:${imageMime};base64,${base64Data}`;
}

/**
 * Initializes the Konva stage with the given width, height, and image.
 */
function initializeStage(width: number, height: number, image?: HTMLImageElement) {
    stage?.destroy();

    stage = new Konva.Stage({
        container: stageEl.value,
        width,
        height,
    });

    // Add the image to the stage
    imageLayer = new Konva.Layer();
    stage.add(imageLayer);
    imageLayer.add(
        new Konva.Image({
            image,
            width,
            height,
        }),
    );
    imageLayer.drawScene();

    // Init poly layer
    polyLayer = new Konva.Layer();
    stage.add(polyLayer);
    polyLayer.drawScene();

    // Handle adding new points
    stage.on('click', (e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;

        // Get stage from event
        const evtStage = e.target.getStage()!;

        // Ignore right-clicks
        if (e.evt.button === 2) return;

        // Only add a point if the Stage was the target
        if (e.currentTarget !== stage) return;

        // Add point
        const { x, y } = evtStage.getPointerPosition()!;
        addPoint(x, y, evtStage);
    });

    // Add pre-existing point
    model.value.forEach((polyCoords) => {
        if (polyCoords?.length > 0) {
            addPoint(polyCoords[0][0], polyCoords[0][1], stage);
        }
    });
}

function addPoint(x: number, y: number, stage: Konva.Stage) {
    // Create a new point
    const point = new DragPoint(x, y, stage);

    // Clear existing point
    polyLayer.removeChildren();

    // Add new point
    polyLayer.add(point);

    // Update model
    model.value = [[[x, y]]];
}
</script>

<style scoped lang="scss"></style>
