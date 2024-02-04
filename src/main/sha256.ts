import { createHash, BinaryLike } from 'crypto';

export default function sha256(data: BinaryLike) {
    return createHash('sha256').update(data).digest('hex');
}
