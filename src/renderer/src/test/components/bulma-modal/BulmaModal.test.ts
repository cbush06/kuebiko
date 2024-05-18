import BulmaModal from '@renderer/components/bulma-modal/BulmaModal.vue';
import { mount } from '@vue/test-utils';

describe('bulma modal component', () => {
    it('renders correctly', () => {
        const modal = mount(BulmaModal, {
            props: {
                title: 'My Bulma Modal',
                confirmText: 'OK',
                cancelText: 'Not OK',
            },
            slots: {
                body: 'How do you feel?',
            },
        });

        modal.vm.show();

        expect(modal.get('header .modal-card-title').text()).toBe('My Bulma Modal');
        expect(modal.get('section').text()).toBe('How do you feel?');
        expect(modal.get('footer button:first-of-type').text()).toBe('OK');
        expect(modal.get('footer button:nth-of-type(2)').text()).toBe('Not OK');
    });

    it('emits shown and closed events', async () => {
        const modal = mount(BulmaModal, {
            props: { title: 'My Bulma Modal' },
            slots: {
                body: 'How do you feel?',
            },
        });

        modal.vm.show();

        expect(modal.emitted('shown')).toBeDefined();

        modal.vm.hide();

        const closed = modal.emitted('closed');
        expect(closed).toBeDefined();
        expect(closed?.[0]).toEqual(['hidden']);

        modal.vm.show();
        await modal.get('footer button:nth-of-type(2)').trigger('click');
        expect(closed?.[1]).toEqual(['cancelled']);

        modal.vm.show();
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));
        expect(closed?.[2]).toEqual(['closed']);

        modal.vm.show();
        await modal.get('header button').trigger('click');
        expect(closed?.[3]).toEqual(['closed']);

        modal.vm.show();
        await modal.get('footer button:first-of-type').trigger('click');
        expect(closed?.[4]).toEqual(['confirmed']);
    });
});
