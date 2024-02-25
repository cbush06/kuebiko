import { App } from 'vue';
import * as bulmaToast from 'bulma-toast';

type Toast = typeof bulmaToast.toast;
export const BulmaToast = Symbol();

const mergeOptionsAndToast = (type: bulmaToast.ToastType) => {
    return (options: bulmaToast.Options) => {
        const finalOptions = Object.assign(options, { type });
        bulmaToast.toast(finalOptions);
    };
};

export interface BulmaToastService {
    toast: Toast;
    primary: Toast;
    link: Toast;
    info: Toast;
    success: Toast;
    warning: Toast;
    danger: Toast;
}

export const BulmaToastPlugin = {
    install(app: App) {
        bulmaToast.setDefaults({
            position: 'top-center',
            dismissible: true,
            duration: 5000,
        });
        app.provide(BulmaToast, {
            toast: bulmaToast.toast,
            primary: mergeOptionsAndToast('is-primary'),
            link: mergeOptionsAndToast('is-link'),
            info: mergeOptionsAndToast('is-info'),
            success: mergeOptionsAndToast('is-success'),
            warning: mergeOptionsAndToast('is-warning'),
            danger: mergeOptionsAndToast('is-danger'),
        } as BulmaToastService);
    },
};
