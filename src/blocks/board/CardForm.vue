<template>
    <div class="form">
        <div class="form__title">
            {{ title }}
        </div>
        <div class="form__subtitle">
            {{ subtitle }}
        </div>
        <div class="form__body">
            <custom-input
                v-model:value="localCard.title"
                label="Заголовок"
                required
                :error="inputErrors.cardTitle ?? ''"
                class="form__input"
            />
            <div class="form__select">
                <div class="form__select__label">Проект:</div>
                <custom-select
                    :options="projectOptions"
                    :activeOption="selectedProject"
                    defaultOption="Не выбрано"
                    full-width
                    @option-changed="setOptionProject"
                />
            </div>
            <div v-if="stageOptions" :class="['form__select', { 'error': !!inputErrors.cardStage }]">
                <div class="form__select__label">
                    Стадия *:
                    <span v-if="!!inputErrors.cardStage">{{ inputErrors.cardStage }}</span>
                </div>
                <custom-select
                    :options="stageOptions"
                    :activeOption="selectedStage"
                    defaultOption="Не выбрано"
                    full-width
                    @option-changed="setOptionStage"
                />
            </div>
            <custom-input
                v-model:value="localCard.score"
                type="number"
                label="Бал"
                required
                :error="inputErrors.cardScore ?? ''"
                class="form__input form__input--score"
            />
        </div>
        <div class="form__action">
            <div class="form__btn">
                <custom-button :title="localCard.id ? 'Сохранить' : 'Добавить'" @click="saveCard"/>
            </div>
            <router-link to="/" class="form__btn--prev">Назад</router-link>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {onMounted, PropType, ref} from "vue";
import CustomInput from "@/components/ui/CustomInput.vue";
import CustomSelect from "@/components/ui/CustomSelect.vue";
import CustomButton from "@/components/ui/CustomButton.vue";
import CardInterface from "@/interfaces/Card/CardInterface";
import OptionInterface from "@/interfaces/OptionInterface";
import ProjectDTO from "@/interfaces/Project/ProjectDTO";

const props = defineProps({
    card: {
        type: Object as PropType<CardInterface>,
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    subtitle: {
        type: String,
        default: ''
    },
    projectOptions: {
        type: Array as PropType<OptionInterface[]>,
        required: true
    },
    projectsByCode: {
        type: Object as PropType<{[key: string]: ProjectDTO}>,
        required: true
    },
    stageOptions: {
        type: [Array, null] as PropType<null | OptionInterface[]>,
        default: null
    },
})

const emits = defineEmits(['save-card'])

const localCard = ref(Object.assign(props.card, {}) as CardInterface)
const selectedProject = ref(null as null | OptionInterface)
const selectedStage = ref(null as null | OptionInterface)
// Правильнее написать либу кастомного валидатора, но это можно вынести в отдельное тестовое задание по масштабу
const inputErrors = ref({} as {[key: string]: string})

onMounted(() => {
    selectedProject.value = getSelectedProject()
})

const getSelectedProject = (): null | OptionInterface => {
    if (localCard.value.projectWithFullInfo) {
        return {
            id: localCard.value.projectWithFullInfo.sort ?? null,
            title: localCard.value.projectWithFullInfo.name ?? null
        } as OptionInterface
    }
    return null
}

const setOptionProject = (optionId: number | null) => {
    if (selectedProject.value?.id === optionId) {
        selectedProject.value = null
    } else {
        selectedProject.value = props.projectOptions.find(({id}) => id === optionId) ?? null
    }
}

const setOptionStage = (optionId: number | null) => {
    if (selectedStage.value?.id === optionId) {
        selectedStage.value = null
    } else {
        selectedStage.value = props.stageOptions?.find(({id}) => id === optionId) ?? null
    }
}

const saveCard = () => {
    const errors = validationInputs()
    if (errors.length === 0) {
        if (selectedProject.value) {
            localCard.value.project = typeof selectedProject.value.id === 'string' ? selectedProject.value.id : false
            localCard.value.projectWithFullInfo = props.projectsByCode[selectedProject.value.id]
        } else {
            localCard.value.project = false
            localCard.value.projectWithFullInfo = null
        }
        if (props.stageOptions) {
            const stage = typeof selectedStage.value?.id === 'string' ? selectedStage.value?.id : ''
            localCard.value.stage = stage ?? ''
        }
        emits('save-card', localCard.value)
    }
}

const validationInputs = () => {
    if (localCard.value.title) {
        delete inputErrors.value.cardTitle
    } else {
        inputErrors.value.cardTitle = 'is required'
    }
    if (localCard.value.score) {
        delete inputErrors.value.cardScore
    } else {
        inputErrors.value.cardScore = 'is required'
    }
    if (props.stageOptions) {
        if (selectedStage.value) {
            delete inputErrors.value.cardStage
        } else {
            inputErrors.value.cardStage = 'is required'
        }
    }
    return Object.keys(inputErrors.value)
}

</script>

<style lang="scss" scoped>
    @import '@/assets/scss/card/card-form.scss';
</style>
