import { editorViewOptionsCtx } from '@milkdown/core';
import type { Ctx } from '@milkdown/ctx';
import clsx from 'clsx';

import '~@milkdown/prose/lib/style/prosemirror.css';
import '~@milkdown/prose/lib/style/tables.css';
import './style.scss';

export function kuebiko(ctx: Ctx): void {
    ctx.update(editorViewOptionsCtx, (prev) => {
        const prevClass = prev.attributes;

        return {
            ...prev,
            attributes: (state) => {
                const attrs = typeof prevClass === 'function' ? prevClass(state) : prevClass;

                return {
                    ...attrs,
                    class: clsx(
                        'prose dark:prose-invert outline-none',
                        attrs?.class || '',
                        'milkdown-theme-kuebiko',
                    ),
                };
            },
        };
    });
}
