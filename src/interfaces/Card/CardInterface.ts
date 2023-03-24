import ProjectInterface from "@/interfaces/Project/ProjectInterface";

export default interface CardInterface {
    id: number,
    title: string,
    stage: string,
    project: boolean | string,
    projectWithFullInfo: ProjectInterface | null,
    score: number,
}