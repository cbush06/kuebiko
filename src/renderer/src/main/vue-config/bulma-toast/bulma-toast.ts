import { App } from 'vue';
import * as bulmaToast from 'bulma-toast';

type Toast = typeof bulmaToast.toast;
export const BulmaToast = Symbol();

const mergeOptionsAndToast = (type: bulmaToast.ToastType, extraClasses = '') => {
    return (options: bulmaToast.Options) => {
        const finalOptions = Object.assign(options, {
            type,
            dismissible: false,
            extraClasses: `${extraClasses} has-grey-shadow`,
        });
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
            message: '',
        });
        app.provide(BulmaToast, {
            toast: bulmaToast.toast,
            primary: mergeOptionsAndToast('is-primary', 'has-text-white'),
            link: mergeOptionsAndToast('is-link'),
            info: mergeOptionsAndToast('is-info', 'has-text-white'),
            success: mergeOptionsAndToast('is-success', 'has-text-white'),
            warning: mergeOptionsAndToast('is-warning'),
            danger: mergeOptionsAndToast('is-danger'),
        } as BulmaToastService);
    },
};
