import { faker } from '@faker-js/faker';
import { Author } from '@renderer/db/models/author';
import { Factory } from 'rosie';
import sectionFactory from './section-factory';
import { Test } from '@renderer/db/models/test';

export default new Factory<Test>()
    .attr('uuid', () => faker.string.uuid())
    .attr('title', () => faker.lorem.words(3))
    .attr('descriptionRef', () => faker.string.uuid())
    .attr('authors', () =>
        // prettier-ignore
        new Array(faker.number.int({ min: 0, max: 3 }))
            .fill(undefined)
            .map(
                () =>
                    ({
                        name: faker.person.fullName(),
                        email: faker.internet.email(),
                    }) as Author,
            ),
    )
    .attr('created', () => faker.date.recent({ days: 60 }))
    .attr('resourceRefs', () =>
        // prettier-ignore
        new Array(faker.number.int({ min: 0, max: 10 }))
            .fill(undefined)
            .map(() => faker.string.uuid()),
    )
    .option('defaultSection', true)
    .option('sectionCount', undefined)
    .option('questionsPerSection', undefined)
    .attr(
        'sections',
        ['defaultSection', 'sectionCount', 'questionsPerSection'],
        (defaultSection: boolean, sectionCount?: number, questionsPerSection?: number) => {
            if (defaultSection) {
                // prettier-ignore
                return [sectionFactory
                .attrs({ default: true })
                .option('questionsPerSection', questionsPerSection)
                .build()];
            } else {
                // prettier-ignore
                return (new Array(sectionCount ?? faker.number.int({ min: 0, max: 5 })))
                .fill(undefined)
                .map(() => 
                    sectionFactory
                        .attrs({ default: false })
                        .option('questionsPerSection', questionsPerSection)
                        .build()
                )
            }
        },
    );
