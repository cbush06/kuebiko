import en from '@renderer/localization/en';
import { createI18n } from 'vue-i18n';

export const VueI18n = createI18n({
    allowComposition: true,
    legacy: false,
    locale: 'en',
    messages: { en },
    fallbackWarn: false,
    missingWarn: false,
});
