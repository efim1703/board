import CardInterface from "@/interfaces/Card/CardInterface";

export type StageSortingType = 'default' | 'up' | 'down';
export default interface StageInterface {
    id: number,
    sort: number,
    name: string,
    code: string,
    cards: {[key: number]: CardInterface},
    sortingType: StageSortingType
}