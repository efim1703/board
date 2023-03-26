<template>
    <div class="wrapper">
        <div class="container">
            <router-view
                v-model:stagesWithFullInfoByCode="stagesWithFullInfoByCode"
                v-model:cards="cards"
                v-model:filteredByProject="filteredByProject"
                :projects="projects"
                :stages="stages"
                @save-changes="saveChanges"
                @add-card="addCard"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onBeforeMount, watch } from 'vue';
import StageDTO from '@/interfaces/stage/StageDTO';
import CardDTO from '@/interfaces/Card/CardDTO';
import ProjectDTO from '@/interfaces/Project/ProjectDTO';
import CardInterface from '@/interfaces/Card/CardInterface';
import StagesMapInterface from "@/interfaces/stage/StageMapInterface";
import OptionInterface from "@/interfaces/OptionInterface";


const stagesWithFullInfoByCode = ref({} as StagesMapInterface)

const stages = ref([] as StageDTO[])
const cards = ref([] as CardDTO[])
const projects = ref([] as ProjectDTO[])
const projectsByCode = ref({} as {[key: string]: ProjectDTO})
const filteredByProject = ref(null as null | OptionInterface)

watch(stagesWithFullInfoByCode, () => {
    localStorage.setItem("stagesWithFullInfoByCode", JSON.stringify(stagesWithFullInfoByCode.value))
},{ deep: true })

watch(filteredByProject, () => {
    localStorage.setItem("filteredByProject", JSON.stringify(filteredByProject.value))
})

onBeforeMount(() => {
    const stagesFetch = getParseFetchResponse('/stages.json')
    const cardsFetch = getParseFetchResponse('/cards.json')
    const projectsFetch = getParseFetchResponse('/projects.json')
    // не совсем понял порядок запросов к апи и локал стороджу, при обновлении страницы получается запросы не должны уходитть к апи
    if (localStorage.getItem('stagesWithFullInfoByCode')) {
        try {
            stagesWithFullInfoByCode.value = JSON.parse(localStorage.getItem('stagesWithFullInfoByCode') || '');
            stages.value = JSON.parse(localStorage.getItem('stages') || '');
            cards.value = JSON.parse(localStorage.getItem('cards') || '');
            projects.value = JSON.parse(localStorage.getItem('projects') || '');
            if (localStorage.getItem('filteredByProject')) {
                try {
                    filteredByProject.value = JSON.parse(localStorage.getItem('filteredByProject') || '');
                } catch(e) {
                    console.warn(e);
                }
            }
        } catch(e) {
            console.warn(e);
        }
    } else {
        setTimeout(() => {
            Promise.all([
                stagesFetch,
                cardsFetch,
                projectsFetch
            ]).then(arrResps => {
                stages.value = arrResps[0]
                cards.value = arrResps[1]
                projects.value = arrResps[2]
                setStagesWithFullInfoByCode()
                localStorage.setItem("stages", JSON.stringify(stages.value))
                localStorage.setItem("cards", JSON.stringify(cards.value))
                localStorage.setItem("projects", JSON.stringify(projects.value))
            })
        }, 2000)
    }
})

const getParseFetchResponse = (url: string) => {
    return fetch(url).then(response => {
        return response.json()
    }).catch(err => {
        console.warn(err)
    })
}

const setStagesWithFullInfoByCode = () => {
    projects.value.forEach((project: ProjectDTO) => projectsByCode.value[project.code] = project)

    const cardsByStage: {[key: string]: {[key: number]: CardInterface} } = {}
    cards.value.forEach((card: CardDTO) => {
        const cardWithProject: CardInterface = {
            ...card,
            projectWithFullInfo: typeof card.project !== 'boolean' ? projectsByCode.value[card.project] : null
        }
        if (!cardsByStage[card.stage]) cardsByStage[card.stage] = {};

        cardsByStage[card.stage][card.id] = cardWithProject
    })

    stages.value.forEach((stage: StageDTO) => {
        stagesWithFullInfoByCode.value[stage.code] = {
            ...stage,
            cards: cardsByStage[stage.code] ?? {},
            sortingType: 'default'
        }
    })
}

const saveChanges = () => {
    setTimeout(() => {
        const data = [stages.value, projects.value, cards.value]

        fetch('api/data/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        })
    })
}

const addCard = (card: CardInterface) => {
    card.id = new Date().getTime()
    cards.value.push(card)
    stagesWithFullInfoByCode.value[card.stage].cards[card.id] = card
}

</script>

<style lang="scss" scoped>
    @import '@/assets/scss/variables.scss';

    .wrapper {
        background-color: $grey-light;
        color: $primary;
        padding: 170px 0;
        min-height: 100vh;
    }
</style>
