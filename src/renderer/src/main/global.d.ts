interface KuebikoAPI {
    sha256: (data: BinaryLike) => string;
    randomUUID: () => string;
}

declare global {
    var kuebikoAPI: KuebikoAPI;
}

export {};
