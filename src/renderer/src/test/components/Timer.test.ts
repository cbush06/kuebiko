import TimerVue from '@renderer/components/timer/Timer.vue';
import { render } from '@testing-library/vue';

describe('timer component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders at 00:00', async () => {
        const { container } = render(TimerVue, {
            props: {
                duration: 0,
            },
        });
        expect(container).toHaveTextContent('00:00');
    });

    it('should operate in stopwatch mode when started with a duration of 0', async () => {
        const { container } = render(TimerVue, {
            props: {
                duration: 0,
                ticking: true,
            },
        });

        expect(container).toHaveTextContent('00:00');

        await vi.advanceTimersByTimeAsync(1000);
        expect(container).toHaveTextContent('00:01');

        await vi.advanceTimersByTimeAsync(4503000); // move forward 1 hr, 15 mins, 3 secs
        expect(container).toHaveTextContent('1:15:04');
    });

    it('should operate in timer mode when started with a non-zero duration', async () => {
        const { container } = render(TimerVue, {
            props: {
                duration: 4503000, // 1:15:03
                ticking: true,
            },
        });

        expect(container).toHaveTextContent('1:15:03');

        await vi.advanceTimersByTime(1000);
        expect(container).toHaveTextContent('1:15:02');

        await vi.advanceTimersByTime(2700000); // 45 mins
        expect(container).toHaveTextContent('30:02');
    });
});
