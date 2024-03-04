import { faker } from '@faker-js/faker';
import { QuestionResponse } from '@renderer/db/models/question-response';
import { Factory } from 'rosie';

export default new Factory<QuestionResponse>()
    .attr('questionRef', () => faker.string.uuid())
    .attr('sectionRef', () => faker.string.uuid())
    .attr('response', () => {
        // Return either a uuid (45%), an array of uuids (45%), or nothing (10%)
        const n = faker.number.float();
        if (n > 0.55) {
            return faker.string.uuid();
        } else if (n > 0.1) {
            return new Array(faker.number.int({ min: 0, max: 5 }))
                .fill(undefined)
                .map(() => faker.string.uuid());
        } else {
            return undefined;
        }
    })
    .attr('credit', () => faker.number.int({ min: 0, max: 100 }));
