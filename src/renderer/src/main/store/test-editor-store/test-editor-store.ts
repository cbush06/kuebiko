import { TreeNodeStruct } from '@renderer/components/tree/structures';
import { Author } from '@renderer/db/models/author';
import { Question, QuestionType } from '@renderer/db/models/question';
import { Resource } from '@renderer/db/models/resource';
import { Section } from '@renderer/db/models/section';
import { Test } from '@renderer/db/models/test';
import { QuestionsService } from '@renderer/services/questions-service';
import { ResourcesService } from '@renderer/services/resources-service';
import { TestsService } from '@renderer/services/tests-service';
import { defineStore } from 'pinia';

export interface TestEditorStoreState {
    // Props
    test: Test;
    questions: Map<string, Question>;
    resources: Map<string, Resource>;
    resourceNamesToUuids: Map<string, string>;
    testEditMode: 'test' | 'section' | 'question';
    testEditPart: Test | Section | Question;

    // Actions
    addAuthor: (author: Author) => void;
    removeAuthor: (author: Author) => void;
    addTag: (tag: string) => void;
    removeTag: (tag: string) => void;
    addResource: (
        name: Resource['name'],
        type: Resource['type'],
        mime: Resource['mime'],
        data: Resource['data'],
    ) => string;
    removeResource: (uuid: string) => void;
    updateResourceData: (uuid: string, data: Resource['data']) => void;
    updateResourceDataByName: (name: string, data: Resource['data']) => void;
    addSection: () => void;
    addQuestion: (section: Section) => void;
}

export const useTestEditorStore = defineStore('test-editor', {
    state: () => {
        const test = {
            uuid: globalThis.kuebikoAPI.randomUUID(),
            version: 0,
            title: '',
            descriptionRef: '',
            authors: [],
            created: new Date(),
            resourceRefs: [],
            sections: [],
            tags: [],
            passingPercentage: 75,
            allowedTime: 3_600_000, // 1 hour
        } as Test;

        return {
            test,
            resources: new Map<string, Resource>(),
            questions: new Map<string, Question>(),
            resourceNamesToUuids: new Map<string, string>(),
            testEditMode: 'test',
            testEditPart: test,
        } as TestEditorStoreState;
    },
    getters: {},
    actions: {
        async initializeForTest(uuid: string) {
            const test = await TestsService.fetchTest(uuid);
            if (!test) throw new Error(`test with ID [${uuid}] does not exist`);
            this.test = test;

            this.resources.clear();
            this.resourceNamesToUuids.clear();

            (await ResourcesService.fetchResources(test.resourceRefs)).forEach((r) => {
                if (!r) return;
                this.resources.set(r.uuid, r);
                this.resourceNamesToUuids.set(r.name, r.uuid);
            });

            (
                await QuestionsService.fetchQuestions(test.sections.flatMap((s) => s.questionRefs))
            ).forEach((q) => {
                this.questions.set(q!.uuid, q!);
            });
        },
        addAuthor(author: Author) {
            this.test.authors.push(author);
        },
        removeAuthor(author: Author) {
            const index = this.test.authors.findIndex(
                (a) => a.name === author.name && a.email === author.email,
            );
            if (index > -1) this.test.authors.splice(index, 1);
        },
        addTag(tag: string) {
            this.test.tags.push(tag);
        },
        removeTag(tag: string) {
            const index = this.test.tags.indexOf(tag);
            if (index > -1) this.test.tags.splice(index, 1);
        },
        addResource(
            name: Resource['name'],
            type: Resource['type'],
            mime: Resource['mime'],
            data: Resource['data'],
        ) {
            const uuid = globalThis.kuebikoAPI.randomUUID() as string;
            this.resources.set(uuid, {
                uuid,
                name,
                type,
                mime,
                sha256: '',
                data,
            } as Resource);
            this.resourceNamesToUuids.set(name, uuid);
            this.test.resourceRefs.push(uuid);
            return uuid;
        },
        removeResource(uuid: string) {
            if (this.resources.has(uuid)) {
                const resource = this.resources.get(uuid)!;
                this.resourceNamesToUuids.delete(resource.name);
                this.resources.delete(uuid);

                const resourceRefsIdx = this.test.resourceRefs.indexOf(uuid);
                if (resourceRefsIdx > -1) this.test.resourceRefs.splice(resourceRefsIdx, 1);
            }
        },
        updateResourceData(uuid: string, data: Resource['data']) {
            if (this.resources.has(uuid)) this.resources.get(uuid)!.data = data;
        },
        updateResourceDataByName(name: string, data: Resource['data']) {
            if (this.resourceNamesToUuids.has(name)) {
                this.updateResourceData(this.resourceNamesToUuids.get(name)!, data);
            }
        },
        setTestEditPartFromTreeNode(node: TreeNodeStruct) {
            if (node.id === 'root') {
                this.testEditMode = 'test';
                this.testEditPart = this.test;
                return;
            }

            if (node.isContainer) {
                this.testEditMode = 'section';
                this.testEditPart = this.test.sections.find((s) => s.uuid === node.id)!;
                return;
            }

            this.testEditMode = 'question';
            this.testEditPart = this.questions.get(node.id)!;
        },
        addSection() {
            const newSectionUuid = globalThis.kuebikoAPI.randomUUID();
            const descriptionRef = this.addResource(
                `section-${newSectionUuid}-description.md`,
                'MARKDOWN',
                'text/markdown',
                '',
            );
            this.test.sections.push({
                uuid: newSectionUuid,
                title: 'New Section',
                default: false,
                descriptionRef: descriptionRef,
                questionRefs: [],
            });
        },
        addQuestion(section: Section, type: QuestionType) {
            const uuid = globalThis.kuebikoAPI.randomUUID();
            this.questions.set(uuid, {
                uuid,
                title: 'New Question',
                type,
                options: [],
                categories: [],
            } as Question);
            section.questionRefs.push(uuid);
        },
    },
});
