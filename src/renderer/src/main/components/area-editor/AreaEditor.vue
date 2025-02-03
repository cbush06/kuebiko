<template>
    <div id="stage" ref="stageEl"></div>
    <div id="menu" ref="konvaMenuEl">
        <button id="delete-button" @click="deletePoly">Delete</button>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Konva from 'konva';
import { DragPoint } from './shapes/drag-point';
import { Polygon } from './shapes/polygon';
import { map, tap } from 'rxjs';

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
const konvaMenuEl = ref<HTMLDivElement>();
let stage: Konva.Stage;
let polyLayer: Konva.Layer;
let imageLayer: Konva.Layer;
const polys = new Array<Polygon>();
const polyCoords = new Map<Konva.Node['_id'], Array<[number, number]>>();
let activePoly: Polygon | undefined;

onMounted(() => {
    // Deactivate all objects when anything outside of Konva is clicked
    document.addEventListener('click', clearAllSelections);

    // Deactivate all objects when the escape key is pressed
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') clearAllSelections();
    });

    // If image is selected at load-time, go ahead and show it
    if (props.image && props.mime && props.width && props.height) {
        imageSelected(props.image, props.mime, props.width, props.height);
    }
});

/**
 * Watches for changes to the image and initializes the stage when an image is selected.
 */
watch<[Uint8Array | undefined, string | undefined, number | undefined, number | undefined]>(
    () => [props.image, props.mime, props.width, props.height],
    ([image, mime, width, height]) => {
        if (image && mime && width && height) {
            imageSelected(image, mime, width, height);
        }
    },
);

/**
 * Scales an image to fit within the given width and height.
 */
function scaleImage(image: HTMLImageElement, width: number, height: number) {
    const scale = Math.min(width / image.width, height / image.height);
    image.width = image.width * scale;
    image.height = image.height * scale;
}

/**
 * Use a selected image to initialize the Konva stage.
 */
async function imageSelected(
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

        hideContextMenu();

        // Ignore right-clicks
        if (e.evt.button === 2) return;

        // Only add a point if the Stage was the target
        if (e.currentTarget !== stage) return;

        // Create a new point
        const point = new DragPoint(
            evtStage.getPointerPosition()!.x,
            evtStage.getPointerPosition()!.y,
            evtStage,
        );

        // Start a new poly if there isn't an active or open one
        if (!activePoly || activePoly.isClosed) {
            addPoly();
        }

        // Add the point to the active poly
        activePoly!.addPoint(point);
    });

    // Handle right-click context menu
    stage.on('contextmenu', (e: Konva.KonvaEventObject<MouseEvent>) => {
        e.evt.preventDefault();
        e.evt.stopPropagation();

        if (e.target === stage) return;

        // Show context menu
        konvaMenuEl.value!.style.display = 'flex';
        konvaMenuEl.value!.style.left = `${e.evt.clientX}px`;
        konvaMenuEl.value!.style.top = `${e.evt.clientY}px`;
    });

    // Add pre-existing polygons
    model.value.forEach((polyCoords) => addPoly(polyCoords));
}

/**
 * Handles activating and deactivating polygons.
 * @param poly The polygon to activate, or undefined to deactivate all.
 */
function updateActivePoly(poly?: Polygon) {
    // If it's the same poly, bail
    if (poly === activePoly) return;

    // If the active poly is not complete, kill it
    if (activePoly && !activePoly.isClosed) {
        activePoly.destroy();
        const index = polys.indexOf(activePoly);
        if (index > -1) polys.splice(index, 1);
        activePoly = undefined;
    }

    // Deactivate all polys
    polys.forEach((p) => (p.isActive = false));

    // If no new poly was selected, bail
    if (!poly) return;

    // Activate the selected poly
    activePoly = poly;
    activePoly.isActive = true;
}

/**
 * Clears all polygon selections.
 */
function clearAllSelections(e?: Event) {
    // If the user clicks outside Konva, clear selection
    if (!e || !stage?.container().contains(e?.target as Node)) {
        updateActivePoly();
        return;
    }
}

/**
 * Hide the context menu.
 */
function hideContextMenu() {
    konvaMenuEl.value!.style.display = 'none';
}

/**
 * Add a polygon to the stage (coords are optional).
 */
function addPoly(coords: Array<[number, number]> = []) {
    // Create a new poly and track its points
    updateActivePoly(new Polygon(coords, polyLayer));
    activePoly!.mouseDown.subscribe((e) => {
        hideContextMenu();
        updateActivePoly(e.currentTarget as Polygon);
    });
    polys.push(activePoly!);
    polyCoords.set(activePoly!._id, coords);

    // Propagate the poly's changes to the model
    activePoly!.change
        .pipe(
            tap((update) => polyCoords.set(update.id, update.coords)),
            map(() => getCoords()),
        )
        .subscribe((coords) => (model.value = coords));

    // Render the poly
    polyLayer.add(activePoly!);
}

/**
 * Delete the active poly.
 */
function deletePoly() {
    if (activePoly) {
        activePoly.destroy();
        const index = polys.indexOf(activePoly);
        if (index > -1) polys.splice(index, 1);
        polyCoords.delete(activePoly._id);
        updateActivePoly();
    }
    hideContextMenu();
}

/**
 * Get arrays of coords for each polygon.
 */
function getCoords() {
    return Array.from(polyCoords.values());
}
</script>

<style scoped>
#stage {
    display: inline-block;
    border: 1px solid black;
}

#menu {
    display: none;
    flex-direction: column;
    position: absolute;
    width: 60px;
    background-color: white;
    box-shadow: 0 0 5px grey;
    border-radius: 3px;
}

#menu button {
    width: 100%;
    background-color: white;
    border: none;
    margin: 0;
    padding: 10px;
}

#menu button:hover {
    background-color: lightgray;
}
</style>
