/**
 * Scales an image to fit within the given width and height.
 */
export function scaleImage(image: HTMLImageElement, width: number, height: number) {
    const scale = Math.min(width / image.width, height / image.height);
    image.width = image.width * scale;
    image.height = image.height * scale;
}
