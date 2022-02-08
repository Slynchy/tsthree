export interface ITournament {
    getID: () => string;
    getContextID: () => string;
    getEndTime: () => number;
    getTitle: () => string;
    getPayload: () => string; // JSON-stringified
}
