import { intervalToDuration } from 'date-fns';
import { createMask } from 'imask/esm/index';

const MILLIS_IN_HOUR = 3_600_000;
const MILLIS_IN_MINUTE = 60_000;
const MILLIS_IN_SECOND = 1000;

/**
 * Converts a duration of milliseconds to clock format (e.g., 2:33:09 for 2 hours, 33 minutes, and 9 seconds).
 * @param duration Duration in milliseconds.
 */
export const durationToClockFormat = (duration: number) => {
    const { hours, minutes, seconds } = intervalToDuration({ start: 0, end: duration });
    return (
        (hours ? `${hours.toString().padStart(2, '0')}:` : '') +
        `${(minutes ?? 0).toString().padStart(2, '0')}:${(seconds ?? 0).toString().padStart(2, '0')}`
    );
};

/**
 * Converts a clock formatted duration (e.g., 2:33:09 for 2 hours, 33 minuts, and 9 seconds) to milliseconds.
 * @param clockFormat Clock format.
 */
export const clockFormatToDuration = (clockFormat: string) => {
    const tokens = clockFormat.split(':');

    if (tokens.length < 2 || tokens.length > 3)
        throw new Error(
            `${clockFormat} is not a valid clock format duration. Expected mm:ss or hh:mm:ss.`,
        );

    const hasHour = tokens.length === 3;

    return (
        (hasHour ? parseInt(tokens[0]) * MILLIS_IN_HOUR : 0) +
        (hasHour ? parseInt(tokens[1]) : parseInt(tokens[0])) * MILLIS_IN_MINUTE +
        (hasHour ? parseInt(tokens[2]) : parseInt(tokens[1])) * MILLIS_IN_SECOND
    );
};

export const millisToHours = (millis: number) => {
    return millis / MILLIS_IN_HOUR;
};

export const durationMask = createMask({ mask: '00:`00:`00', lazy: false });
