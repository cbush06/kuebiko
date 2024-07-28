import { Author } from '@renderer/db/models/author';
import { Question, QuestionType } from '@renderer/db/models/question';
import { Resource } from '@renderer/db/models/resource';
import { Section } from '@renderer/db/models/section';
import { Test } from '@renderer/db/models/test';
import { EditorQuestionsService } from '@renderer/services/editor-questions-service';
import { EditorResourcesService } from '@renderer/services/editor-resources-service';
import { EditorTestsService } from '@renderer/services/editor-tests-service';
import { defineStore } from 'pinia';
import { toRaw } from 'vue';

export interface TestEditorStoreState {
    // Props
    test: Test;
    lastSavedTest: string;
    questions: Map<string, Question>;
    lastSavedQuestions: Map<string, string>;
    resources: Map<string, Resource>;
    lastSavedResources: Map<string, string>;
    resourceNamesToUuids: Map<string, string>;
    testEditMode: 'test' | 'section' | 'question';
    testEditPart: Test | Section | Question;

    // Actions
    initializeForTest: (uuid: string) => Promise<void>;
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
    setTestEditPartFromTreeNode: (uuid: string) => void;
    addSection: () => Section;
    removeSection: (uuid: string) => void;
    isSectionUuid: (uuid: string) => boolean;
    addQuestion: (section: Section) => Question;
    removeQuestion: (uuid: string) => void;
    appendOption: (question: Question) => void;
    snapshotState: () => void;
    hasChangedWithoutSaving: () => boolean;
    save: () => Promise<void>;
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
            lastSavedTest: globalThis.kuebikoAPI.sha256(JSON.stringify(test)),
            resources: new Map<string, Resource>(),
            lastSavedResources: new Map<string, string>(),
            questions: new Map<string, Question>(),
            lastSavedQuestions: new Map<string, string>(),
            resourceNamesToUuids: new Map<string, string>(),
            testEditMode: 'test',
            testEditPart: test,
        } as TestEditorStoreState;
    },
    getters: {},
    actions: {
        async initializeForTest(uuid: string) {
            const test = await EditorTestsService.fetchTest(uuid);
            if (!test) throw new Error(`test with ID [${uuid}] does not exist`);
            this.test = test;

            this.resources.clear();
            this.resourceNamesToUuids.clear();

            (await EditorResourcesService.fetchResources(test.resourceRefs)).forEach((r) => {
                if (!r) return;
                this.resources.set(r.uuid, r);
                this.resourceNamesToUuids.set(r.name, r.uuid);
            });

            (
                await EditorQuestionsService.fetchQuestions(
                    test.sections.flatMap((s) => s.questionRefs),
                )
            ).forEach((q) => {
                this.questions.set(q!.uuid, q!);
            });

            this.snapshotState();
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
        setTestEditPartFromTreeNode(uuid: string) {
            if (uuid === 'root') {
                this.testEditMode = 'test';
                this.testEditPart = this.test;
                return;
            }

            const isSection = this.isSectionUuid(uuid);

            if (isSection) {
                this.testEditMode = 'section';
                this.testEditPart = this.test.sections.find((s) => s.uuid === uuid)!;
                return;
            }

            this.testEditMode = 'question';
            this.testEditPart = this.questions.get(uuid)!;
        },
        addSection() {
            const newSectionUuid = globalThis.kuebikoAPI.randomUUID();
            const newSection = {
                uuid: newSectionUuid,
                title: 'New Section',
                default: false,
                descriptionRef: this.addResource(
                    `section-${newSectionUuid}-description.md`,
                    'MARKDOWN',
                    'text/markdown',
                    '',
                ),
                questionRefs: [],
            } as Section;
            this.test.sections.push(newSection);
            return newSection;
        },
        removeSection(uuid: string) {
            const sectionIdx = this.test.sections.findIndex((s) => s.uuid === uuid);
            if (sectionIdx > -1) {
                const section = this.test.sections[sectionIdx];

                // Remove all questions for this section
                section.questionRefs.forEach((q) => this.removeQuestion(q));

                // Delete section description
                if (section.descriptionRef) this.removeResource(section.descriptionRef);

                // Delete section
                this.test.sections.splice(sectionIdx, 1);
            }
        },
        isSectionUuid(uuid: string) {
            return this.test.sections.map((s) => s.uuid).includes(uuid);
        },
        addQuestion(section: Section, type: QuestionType) {
            const uuid = globalThis.kuebikoAPI.randomUUID();

            const newQuestion = {
                uuid,
                title: 'New Question',
                type,
                options: [],
                categories: [],
            } as Question;
            this.questions.set(uuid, newQuestion);

            switch (type) {
                case 'MULTIPLE': {
                    newQuestion.answer = '';
                    this.appendOption(newQuestion);
                    break;
                }
                case 'MANY': {
                    newQuestion.answer = [] as string[];
                    this.appendOption(newQuestion);
                    break;
                }
            }
            section.questionRefs.push(uuid);

            return newQuestion;
        },
        removeQuestion(uuid: string) {
            if (this.questions.has(uuid)) {
                const question = this.questions.get(uuid);
                if (question?.contentRef) this.removeResource(question.contentRef);
                if (question?.subjectImageRef) this.removeResource(question.subjectImageRef);
                if (question?.successFeedbackRef) this.removeResource(question.successFeedbackRef);
                if (question?.failureFeedbackRef) this.removeResource(question.failureFeedbackRef);
                this.questions.delete(uuid);
                this.test.sections.forEach((s) => {
                    const qIdx = s.questionRefs.indexOf(uuid);
                    if (qIdx > -1) s.questionRefs.splice(qIdx, 1);
                });
            }
        },
        appendOption(question: Question) {
            const uuid = globalThis.kuebikoAPI.randomUUID();
            question.options.push({
                uuid,
                contentRef: this.addResource(`option-${uuid}`, 'MARKDOWN', 'text/markdown', ''),
            });
        },
        snapshotState() {
            // TODO: Make this WAYYY more efficient by using hashes of resources & questions
            this.lastSavedTest = globalThis.kuebikoAPI.sha256(JSON.stringify(this.test));

            this.lastSavedQuestions.clear();
            this.questions.forEach((q) =>
                this.lastSavedQuestions.set(
                    q.uuid,
                    globalThis.kuebikoAPI.sha256(JSON.stringify(q)),
                ),
            );

            this.lastSavedResources.clear();
            this.resources.forEach((r) =>
                this.lastSavedResources.set(r.uuid, globalThis.kuebikoAPI.sha256(r.data)),
            );
        },
        hasChangedWithoutSaving() {
            const currentTestHash = globalThis.kuebikoAPI.sha256(JSON.stringify(this.test));
            const currentQuestionsHashes = new Map<string, string>(
                Array.from(this.questions.entries()).map(([k, v]) => [
                    k,
                    globalThis.kuebikoAPI.sha256(JSON.stringify(v)),
                ]),
            );
            const currentResourcesHashes = new Map<string, string>(
                Array.from(this.resources.entries()).map(([k, v]) => [
                    k,
                    globalThis.kuebikoAPI.sha256(v.data),
                ]),
            );

            // prettier-ignore
            return !(
                // Test
                this.lastSavedTest === currentTestHash &&

                // Questions
                this.lastSavedQuestions.size === currentQuestionsHashes.size &&
                Array.from(this.lastSavedQuestions.keys()).every(
                    (k) => this.lastSavedQuestions.get(k) === currentQuestionsHashes.get(k),
                ) &&

                // Resources
                this.lastSavedResources.size === currentResourcesHashes.size &&
                Array.from(this.lastSavedResources.keys()).every(
                    (k) => this.lastSavedResources.get(k) === currentResourcesHashes.get(k),
                )
            );
        },
        async save() {
            this.snapshotState();

            try {
                await EditorTestsService.saveTestAndRelations(
                    toRaw(this.test),
                    Array.from(this.resources.values()).map((r) => toRaw(r)),
                    Array.from(this.questions.values()).map((q) => toRaw(q)),
                );
            } catch (e) {
                console.error('Error encountered while saving test', e);
                throw e;
            }
        },
    },
});
