<template>
    <div class="container">
        <div class="board">
            <div class="board__header">
                <h1 class="h1-title">Карточки</h1>
                <div class="board__tools">
                    <div class="board__tools__select">
                        <span>Проект: </span>
                        <custom-select 
                            :options="optionsProjects" 
                            :activeOption="selectedProject"
                            defaultOption="Не выбрано"
                            @option-chenged="setOptionProject"
                        />
                    </div>
                    <custom-button 
                        title="Добавить карточку"
                        class="board__tools__btn"
                    />
                    <custom-button 
                        title="Сохранить изменения"
                        class="board__tools__btn"
                    />
                </div>
            </div>
            <div class="board__stage-list">
                <stage-item 
                    v-for="stage in stagesWithFullInfo"
                    :key="stage.id"
                    :stage="stage"
                    class="board__stage-list__item"
                />
            </div>
            <custom-modal v-model="cardModal.show">
                <card-form 
                    :card="cardModal.card"
                />
            </custom-modal>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import StageItem from '@/blocks/board/StageItem.vue';
import CustomSelect from '@/components/ui/CustomSelect.vue'
import CustomButton from '@/components/ui/CustomButton.vue';
import CustomModal from '@/components/ui/CustomModal.vue';
import CardForm from '@/blocks/board/CardForm.vue';
import StageInterface from '@/interfaces/stage/StageInterface';
import StageDTO from '@/interfaces/stage/StageDTO';
import CardDTO from '@/interfaces/Card/CardDTO';
import ProjectDTO from '@/interfaces/Project/ProjectDTO';
import CardInterface from '@/interfaces/Card/CardInterface';
import OptionInterface from '@/interfaces/OptionInterface';
import CardForm from '@/blocks/board/CardForm.vue';

const stages = ref([] as StageDTO[])
const cards = ref([] as CardDTO[])
const projects = ref([] as ProjectDTO[])
const stagesWithFullInfo = ref([] as StageInterface[])
const selectedProject = ref(null as null | OptionInterface)
const optionsProjects = ref([] as OptionInterface[])
const cardModal = ref({
    show: false,
    card: null as null | {} as CardDTO
})

watch(projects, () => {
    optionsProjects.value = projects.value.map((project: ProjectDTO): OptionInterface => {
        return { id: project.sort, title: project.name }
    })
})

watch(selectedProject, () => {
    setStagesWithFullInfo()
})

onMounted(() => {
    const stagesFetch = getParseFetchResponse('/stages.json')
    const cardsFetch = getParseFetchResponse('/cards.json')
    const projectsFetch = getParseFetchResponse('/projects.json')
    
    Promise.all([
        stagesFetch,
        cardsFetch,
        projectsFetch
    ]).then(arrResps => {
        stages.value = arrResps[0]
        cards.value = arrResps[1]
        projects.value = arrResps[2]
        setStagesWithFullInfo()
    })
    
})

const setStagesWithFullInfo = () => {
    const projectsByCode: {[key: string]: ProjectDTO} = {}
    projects.value.forEach((project: ProjectDTO) => projectsByCode[project.code] = project)

    const cardsByStage: {[key: string]: CardInterface[] } = {}
    cards.value.forEach((card: CardDTO) => {
        const cardWithProject: CardInterface = {
            ...card, 
            projectWithFullInfo: typeof card.project !== 'boolean' ? projectsByCode[card.project] : null
        }
        if (!cardsByStage[card.stage]) cardsByStage[card.stage] = [];

        const isSelected: boolean = cardWithProject.projectWithFullInfo?.sort === selectedProject.value?.id

        if (!selectedProject.value || selectedProject.value && isSelected) {
            cardsByStage[card.stage].push(cardWithProject)
        } 
    })
    console.log(stages.value
        .map((stage: StageDTO): StageInterface => Object.assign(stage, { cards: cardsByStage[stage.code] })));
    
    stagesWithFullInfo.value = stages.value
        .map((stage: StageDTO): StageInterface => Object.assign(stage, { cards: cardsByStage[stage.code] }))
}

const getParseFetchResponse = (url: string) => {
    return fetch(url).then(response => {
        return response.json()
    }).catch(err => {
        console.log('There has been a problem with your fetch operation ' + err.message)
    })
}

const setOptionProject = (optionId: number | null) => {
    if (selectedProject.value?.id === optionId) {
        selectedProject.value = null
    } else {
        selectedProject.value = optionsProjects.value.find(({id}) => id === optionId) ?? null
    }
}

</script>

<style lang="scss" scoped>
    @import '@/assets/scss/variables.scss';

    .board {
        padding-top: 170px;
        margin-bottom: 170px;

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
    }
</style>
