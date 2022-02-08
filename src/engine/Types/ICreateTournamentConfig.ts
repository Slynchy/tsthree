export enum TOURNAMENT_SORT_ORDER {
    HIGHER_IS_BETTER = "HIGHER_IS_BETTER",
    LOWER_IS_BETTER = "LOWER_IS_BETTER"
}

export interface ICreateTournamentConfig {
    title?: string;
    image?: string;
    sortOrder?: TOURNAMENT_SORT_ORDER;
    scoreFormat?: "NUMERIC" | "TIME";
    endTime?: number;
}
