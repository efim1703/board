import StageInterface from "@/interfaces/stage/StageInterface";
// главный объект который имеет структуру {stageCode: {
//      все поля stage и
//      cards: {
//          cardId: {
//              все поля card и
//              projectWithFullInfo: {} - project
//          } - card
//      }
//
// } - stage }
// по сути map в map'e для моментального обращения к конкретному полю, без перебора массивов
export default interface StagesMapInterface {
	[key: string]: StageInterface
}