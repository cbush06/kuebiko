import { Author } from '@renderer/db/models/author';
import { Resource } from '@renderer/db/models/resource';
import { Test } from '@renderer/db/models/test';
import { defineStore } from 'pinia';

export interface TestEditorStoreState {
    // Props
    test: Test;
    resources: Map<string, Resource>;
    resourceNamesToUuids: Map<string, string>;

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
}

export const useTestEditorStore = defineStore('test-editor', {
    state: () =>
        ({
            test: {
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
            } as Test,
            resources: new Map<string, Resource>(),
            resourceNamesToUuids: new Map<string, string>(),
        }) as unknown as TestEditorStoreState,
    getters: {},
    actions: {
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
    },
});
