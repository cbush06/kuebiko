import { faker } from '@faker-js/faker';
import { Option } from '@renderer/db/models/option';
import { Factory } from 'rosie';

export default new Factory<Option>()
    .attr('uuid', () => faker.string.uuid())
    .attr('contentText', () => faker.lorem.words({ min: 3, max: 8 }))
    .attr('contentRef', () => {
        if (faker.number.float() < 0.5) return faker.string.uuid();
        return undefined;
    })
    .attr('explanation', () => faker.lorem.paragraph());
