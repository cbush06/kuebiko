import { electronAPI } from '@electron-toolkit/preload';
import { BinaryLike } from 'crypto';
import { contextBridge, ipcRenderer } from 'electron';

// Custom APIs for renderer
const api = {};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI);
        contextBridge.exposeInMainWorld('api', api);
        contextBridge.exposeInMainWorld('kuebikoAPI', {
            sha256: (data: BinaryLike) => ipcRenderer.sendSync('sha256', data),
            randomUUID: () => ipcRenderer.sendSync('randomUUID'),
        });
    } catch (error) {
        console.error(error);
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI;
    // @ts-ignore (define in dts)
    window.api = api;
}
