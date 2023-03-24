import CardInterface from "@/interfaces/Card/CardInterface";

export default interface StageInterface {
    id: number,
    sort: number,
    name: string,
    code: string,
    cards: CardInterface[]
}