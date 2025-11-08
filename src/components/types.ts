export enum FetchDataState {
    Idle = 'idle',
    GettingMetadata = 'getting_metadata',
    InProgress = 'in_progress',
    Completed = 'completed',
    Error = 'error'
}

export type FetchDataMetadaata = {
    totalRecords: number;
    fetchedRecords: number;
    date: string;
}