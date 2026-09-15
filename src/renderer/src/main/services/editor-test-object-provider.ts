import { TestObjectProvider } from '@renderer/services/test-object-provider';
import { EditorDbFacade } from '@renderer/services/editor-db-facade';

export const EditorTestObjectProvider = new TestObjectProvider(EditorDbFacade);
