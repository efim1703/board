<template>
    <div class="container">
        <div class="board">
            <div class="board__header">
                <h1 class="h1-title">Карточки</h1>
                <div class="board__tools">
                    <div class="board__tools__select">
                        <span>Проект:</span>
                        <custom-select
                            :options="projectOptionsBySort"
                            :activeOption="filteredByProject"
                            defaultOption="Не выбрано"
                            @option-changed="setOptionProject"
                        />
                    </div>

                    <router-link to="/add-card">
                        <custom-button
                            title="Добавить карточку"
                            class="board__tools__btn"
                        />
                    </router-link>
                    <custom-button
                        title="Сохранить изменения"
                        class="board__tools__btn"
                        @click="$emit('save-changes')"
                    />
                </div>
            </div>
            <div class="board__stage-list">
                <stage-item
                    v-for="stage in Object.values(filteredStages)"
                    :key="stage.id"
                    :stage="stage"
                    class="board__stage-list__item"
                    @add-card="openCardModal(stage.code)"
                    @edit-card="$event => openCardModal(stage.code, $event)"
                    @delete-card="$event => openDeleteCardModal(stage.code, $event)"
                    @change-sorting-type="$event => changeSortingTypeInStage(stage.code, $event)"
                    @move-card="changeStageCard"
                />
            </div>
            <custom-modal v-model:value="cardModal.show">
                <card-form
                    :card="cardModal.card"
                    :projectOptions="projectOptionsByCode"
                    :projectsByCode="projectsByCode"
                    :subtitle="stagesWithFullInfoByCode[cardModal.card.stage].name"
                    :title="cardModal.card?.id ? 'Редактирование' : 'Добавление'"
                    @save-card="setCardInStage"
                />
            </custom-modal>
            <custom-modal v-model:value="cardDeleteModal.show">
                <div class="delete-modal">
                    <div class="delete-modal__title">Вы точно хотите удалить карточку?</div>
                    <custom-button
                        title="Отменить"
                        class="delete-modal__btn"
                        @click="closeDeleteCardModal"
                    />
                    <custom-button
                        title="Удалить"
                        class="delete-modal__delete-btn"
                        @click="deleteCard"
                    />
                </div>
            </custom-modal>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {ref, watch, PropType, computed, nextTick} from 'vue';
import StageItem from '@/blocks/board/StageItem.vue';
import CustomSelect from '@/components/ui/CustomSelect.vue'
import CustomButton from '@/components/ui/CustomButton.vue';
import CustomModal from '@/components/ui/CustomModal.vue';
import CardForm from '@/blocks/board/CardForm.vue';
import {StageSortingType} from '@/interfaces/stage/StageInterface';
import CardDTO from '@/interfaces/Card/CardDTO';
import ProjectDTO from '@/interfaces/Project/ProjectDTO';
import CardInterface from '@/interfaces/Card/CardInterface';
import OptionInterface from '@/interfaces/OptionInterface';
import StagesMapInterface from "@/interfaces/stage/StageMapInterface";
import IDraggableEvent from "@/interfaces/IDraggableEvent";
import { useNotification } from "@kyvg/vue3-notification";


const { notify}  = useNotification()

const props = defineProps({
    stagesWithFullInfoByCode: {
        type: Object as PropType<StagesMapInterface>,
        required: true
    },
    cards: {
        type: Array as PropType<CardDTO[]>,
        required: true
    },
    projects: {
        type: Array as PropType<ProjectDTO[]>,
        required: true
    },
    filteredByProject: {
        type: Object as PropType<OptionInterface>,
        default: null
    },
})

const emits = defineEmits([
    'update:cards',
    'update:stagesWithFullInfoByCode',
    'update:filteredByProject',
    'add-card'
])

const projectsByCode = ref({} as {[key: string]: ProjectDTO})
const projectOptionsBySort = ref([] as OptionInterface[])
const projectOptionsByCode = ref([] as OptionInterface[])
const cardModal = ref({
    show: false,
    card: {} as CardInterface,
})
const cardDeleteModal = ref({
    show: false,
    cardId: 0,
    stageCode: ''
})

const filteredStages = computed(() => {
    if (props.filteredByProject) {
        const stagesMap: StagesMapInterface = JSON.parse(JSON.stringify(props.stagesWithFullInfoByCode))
        for (const stageCode in stagesMap) {
            const cardsMap: {[key: number]: CardInterface} = {}

            for (const cardId in stagesMap[stageCode].cards) {
                if (isSelectedProject(stagesMap[stageCode].cards[cardId])) {
                    cardsMap[cardId] = stagesMap[stageCode].cards[cardId]
                }
            }
            stagesMap[stageCode].cards = cardsMap
        }

        return stagesMap
    } else {
        return props.stagesWithFullInfoByCode
    }
})

watch(() => props.projects, (arr) => {
    const projectsMap: {[key: string]: ProjectDTO} = {}
    const optionsBySort: OptionInterface[] = []
    const optionsByCode: OptionInterface[] = []

    arr.forEach((project: ProjectDTO) => {
        optionsBySort.push({ id: project.sort, title: project.name })
        optionsByCode.push({ id: project.code, title: project.name })
        projectsMap[project.code] = project
    })
    projectsByCode.value = projectsMap
    projectOptionsBySort.value = optionsBySort
    projectOptionsByCode.value = optionsByCode
}, { deep: true, immediate: true })

const setOptionProject = (optionId: number | null) => {
    if (props.filteredByProject?.id === optionId) {
        updateFilteredByProject(null)
    } else {
        updateFilteredByProject(projectOptionsBySort.value.find(({id}) => id === optionId) ?? null)
    }
}

const setCardInStage = (card: CardInterface) => {
    if (!card.id) {
        emits('add-card', card)
    } else {
        const {projectWithFullInfo: _, ...cardDTO} = card
        const cards = [...props.cards].map(el => el.id === cardDTO.id ? cardDTO : el)
        emits('update:cards', cards)
        notify({
            title: "Карточка успешно изменена!",
            type: "success"
        });
    }

    closeCardModal()
}

const deleteCard = () => {
    let cards = [...props.cards].filter(el => el.id !== cardDeleteModal.value.cardId)
    updateCards(cards)

    const stagesMap: StagesMapInterface = JSON.parse(JSON.stringify(props.stagesWithFullInfoByCode))
    delete stagesMap[cardDeleteModal.value.stageCode].cards[cardDeleteModal.value.cardId]
    updateStagesMap(stagesMap)

    notify({
        title: "Карточка удалена!",
        type: "success"
    });

    closeDeleteCardModal()
}

const changeSortingTypeInStage = (stageCode: string, sortingType: StageSortingType) => {
    const stagesMap: StagesMapInterface = JSON.parse(JSON.stringify(props.stagesWithFullInfoByCode))
    stagesMap[stageCode].sortingType = sortingType
    updateStagesMap(stagesMap)
}

const changeStageCard = (params: IDraggableEvent) => {
    // В условии не сказано про порядок карточек при миграции между столбцами если это важно можно ключи мап
    // превратить в строчные значения "_id" и тогда последовательность сохраниться и можно вставлять по индексам
    const stagesMap: StagesMapInterface = JSON.parse(JSON.stringify(props.stagesWithFullInfoByCode))
    const card = stagesMap[params.oldArrId].cards[params.elementId]
    if (card) {
        delete stagesMap[params.oldArrId].cards[params.elementId]

        card.stage = params.newArrId
        stagesMap[params.newArrId].cards[params.elementId] = card

        const {projectWithFullInfo: _, ...cardDTO} = card
        const cards = [...props.cards].map(el => el.id === cardDTO.id ? cardDTO : el)
        
        updateCards(cards)
        
        updateStagesMap(stagesMap)
    }
}

const openCardModal = (stageCode: string, cardId: number = 0) => {
    if (cardId) {
        const card = props.stagesWithFullInfoByCode[stageCode].cards[cardId]
        cardModal.value.card = {
            id: cardId,
            title: card.title,
            stage: stageCode,
            project: card.project,
            projectWithFullInfo: card.projectWithFullInfo,
            score: card.score,
        } as CardInterface
    } else {
        cardModal.value.card = {
            id: cardId,
            title: '',
            stage: stageCode,
            project: false,
            projectWithFullInfo: null,
            score: 0,
        } as CardInterface
    }
    cardModal.value.show = true
}

const closeCardModal = () => {
    cardModal.value.card = {
        id: 0,
        title: '',
        stage: '',
        project: false,
        projectWithFullInfo: null,
        score: 0,
    } as CardInterface
    cardModal.value.show = false
}

const openDeleteCardModal = (stageCode: string, cardId: number) => {
    cardDeleteModal.value.cardId = cardId
    cardDeleteModal.value.stageCode = stageCode
    cardDeleteModal.value.show = true
}

const closeDeleteCardModal = () => {
    cardDeleteModal.value.cardId = 0
    cardDeleteModal.value.stageCode = ''
    cardDeleteModal.value.show = false
}

const isSelectedProject = (card: CardInterface): boolean => {
    if (!props.filteredByProject) return true;
    return card.projectWithFullInfo?.sort === props.filteredByProject?.id
}

const updateStagesMap = (stages: StagesMapInterface) => {
    emits('update:stagesWithFullInfoByCode', stages)
}

const updateFilteredByProject = (filter: OptionInterface | null) => {
    emits('update:filteredByProject', filter)
}

const updateCards = (cards: CardDTO[]) => {
    emits('update:cards', cards)
}

</script>

<style lang="scss" scoped>
    @import '@/assets/scss/variables.scss';

    .board {

        &__header {
            display: flex;
            align-items: center;
            width: 100%;
        }

        &__tools {
            display: flex;
            align-items: center;    
            margin-left: auto;

            &__select {
                display: flex;
                align-items: center;

                span {
                    font-size: 12px;
                    color: $secondary;
                    margin-right: 4px;
                }
            }

            &__btn {
                margin-left: 8px;
            }
        }

        &__stage-list {
            display: flex;
            flex-wrap: wrap;
            margin-top: 20px;
            gap: 20px;

            &__item {
                width: calc(100%/4 - 60px/4);
            }
        }

        .delete-modal {
            text-align: center;
            font-size: 18px;
            max-width: 300px;

            &__title {
                margin-bottom: 12px;
            }

            &__btn {
                margin-right: 4px;
            }

            &__delete-btn {
                margin-left: 4px;
                background: $error !important;
            }
        }
    }
</style>
