<template>
    <div class="container">
        <div class="add-card">
            <h1 class="h1-title">Добавление карточки</h1>
            <card-form
                :card="card"
                :projectOptions="projectOptionsByCode"
                :projectsByCode="projectsByCode"
                :stageOptions="stageOptionsByCode"
                subtitle="Чтобы добавить карточку, нужно заполнить данные"
                title="Основные данные"
                class="add-card__form"
                @save-card="saveCard"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import {ref, watch, PropType} from 'vue';
import CardForm from "@/blocks/board/CardForm.vue";
import ProjectDTO from "@/interfaces/Project/ProjectDTO";
import OptionInterface from "@/interfaces/OptionInterface";
import StageDTO from "@/interfaces/stage/StageDTO";
import CardInterface from "@/interfaces/Card/CardInterface";

const props = defineProps({
    stages: {
        type: Array as PropType<StageDTO[]>,
        required: true
    },
    projects: {
        type: Array as PropType<ProjectDTO[]>,
        required: true
    },
})

const emits = defineEmits(['add-card'])

const stageOptionsByCode = ref([] as OptionInterface[])
const projectOptionsByCode = ref([] as OptionInterface[])
const projectsByCode = ref({} as {[key: string]: ProjectDTO})
const card = ref({
    id: 0,
    title: '',
    stage: '',
    project: false,
    projectWithFullInfo: null,
    score: 0,
} as CardInterface)

watch(() => props.stages, (arr) => {
    stageOptionsByCode.value = arr.map((stage: StageDTO) => {
        return { id: stage.code, title: stage.name }
    })
}, { deep: true, immediate: true })

watch(() => props.projects, (arr) => {
    const projectsMap: {[key: string]: ProjectDTO} = {}
    const optionsByCode: OptionInterface[] = []

    arr.forEach((project: ProjectDTO) => {
        optionsByCode.push({ id: project.code, title: project.name })
        projectsMap[project.code] = project
    })
    projectsByCode.value = projectsMap
    projectOptionsByCode.value = optionsByCode
}, { deep: true, immediate: true })

const saveCard = (newCard: CardInterface) => {
    card.value = {
        id: 0,
        title: '',
        stage: '',
        project: false,
        projectWithFullInfo: null,
        score: 0,
    }

    emits('add-card', newCard)
}

</script>

<style lang="scss" scoped>
    @import '@/assets/scss/variables.scss';

    .add-card {
        max-width: 380px;
        margin: 0 auto;

        .h1-title {
            text-align: center;
        }

        &__form {
            padding: 20px;
            margin: 20px auto 0;
            border-radius: 4px;
            background: #fff;

        }
    }
</style>
