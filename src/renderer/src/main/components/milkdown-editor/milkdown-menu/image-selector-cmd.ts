import { UpdateImageCommandPayload } from '@milkdown/preset-commonmark';
import { $command } from '@milkdown/utils';

export type ImageSelectorCallback = () => Promise<UpdateImageCommandPayload | undefined>;

export const ImageSelectorCommand = (imageSelectorCallback: ImageSelectorCallback) => {
    return $command(
        'ImageSelector',
        () =>
            () =>
            (/* state?: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView */) => {
                imageSelectorCallback().then((payload) => {
                    console.log(payload);
                });
                return true;
            },
    );
};
