<template>
    <div class="stage">
        <div class="stage__header">
            <div class="point"></div>
            <div class="stage__title">
                {{ props.stage.name }}
            </div>
            <div class="stage__filters">
                <div :class="['icon', { active: stage.sortingType === 'down' }]" @click="changeSorting('down')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.08875C12.4418 2.08875 12.8 2.44692 12.8 2.88875V19.1744L16.4745 15.4849C16.7863 15.1719 17.2929 15.1708 17.6059 15.4826C17.919 15.7944 17.92 16.3009 17.6082 16.614L12.5668 21.6758C12.4167 21.8265 12.2127 21.9113 12 21.9113C11.7873 21.9113 11.5833 21.8265 11.4332 21.6758L6.3918 16.614C6.08002 16.3009 6.08104 15.7944 6.39409 15.4826C6.70714 15.1708 7.21367 15.1719 7.52546 15.4849L11.2 19.1744V2.88875C11.2 2.44692 11.5582 2.08875 12 2.08875Z" fill="currentColor"/></svg>
                </div>
                <div :class="['icon', { active: stage.sortingType === 'up' }]" @click="changeSorting('up')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.9113C11.5582 21.9113 11.2 21.5531 11.2 21.1113L11.2 4.82565L7.52546 8.5151C7.21367 8.82815 6.70714 8.82917 6.39409 8.51738C6.08104 8.2056 6.08001 7.69907 6.3918 7.38601L11.4332 2.32421C11.5833 2.17348 11.7873 2.08875 12 2.08875C12.2127 2.08875 12.4167 2.17348 12.5668 2.32421L17.6082 7.38602C17.92 7.69907 17.919 8.2056 17.6059 8.51738C17.2929 8.82917 16.7863 8.82815 16.4745 8.5151L12.8 4.82565L12.8 21.1113C12.8 21.5531 12.4418 21.9113 12 21.9113Z" fill="currentColor"/></svg>
                </div>
            </div>
        </div>
        <draggable
            class="stage__card-list"
            group="cards"
            @end="moveCard"
            :modelValue="getSortedCards"
            item-key="id"
            :stage-code="stage.code"
        >
            <template #item="{ element: card }">
                <card-item
                    :card="card"
                    class="stage__card-list__item"
                    @edit-card="$emit('edit-card', card.id)"
                    @delete-card="$emit('delete-card', card.id)"
                />
            </template>
            <template #footer>
                <div v-if="getSortedCards.length === 0" class="stage__empty-list" >
                    Список пуст
                </div>
            </template>
        </draggable>
        <div class="stage__add-card" @click="$emit('add-card')">Добавить</div>
    </div>
</template>

<script lang="ts" setup>
import { computed, PropType } from "vue";
import StageInterface, {StageSortingType} from '@/interfaces/stage/StageInterface';
import CardItem from "@/blocks/board/CardItem.vue";
import CardInterface from "@/interfaces/Card/CardInterface";
import draggable from 'vuedraggable'
import IDraggableEvent from "@/interfaces/IDraggableEvent";


const props = defineProps({
    stage: {
        type: Object as PropType<StageInterface>,
        required: true
    }
})

const emits = defineEmits(['change-sorting-type', 'move-card'])

const getSortedCards = computed((): CardInterface[] => {
    const cards = Object.values(props.stage.cards)
    switch(props.stage?.sortingType) {
        case 'down': 
            return cards.sort((first, second) => first.score - second.score)
        case 'up': 
            return cards.sort((first, second) => second.score - first.score)
        default:
            return cards
    }
})

const changeSorting = (sort: StageSortingType) => {
    if (props.stage.sortingType === sort) {
        emits('change-sorting-type', 'default')
    } else {
        emits('change-sorting-type', sort)
    }
}

const moveCard = (event: any) => {
    const draggableEvent: IDraggableEvent = {
        oldIndex: event.oldIndex,
        newIndex: event.newIndex,
        oldArrId: event.from.__draggable_component__.$attrs?.['stage-code'],
        newArrId: event.to.__draggable_component__.$attrs?.['stage-code'],
        elementId: event.item.__draggable_context.element?.id,
    }
    if (draggableEvent.oldArrId !== draggableEvent.newArrId) {
        emits('move-card', draggableEvent)
    }
}

</script>

<style lang="scss" scoped>
    @import '@/assets/scss/variables.scss';

    .stage {
        display: flex;
        flex-direction: column;
        padding: 12px;
        border-radius: 4px;
        background-color: $grey;
        height: fit-content;

        &__header {
            display: flex;
            align-items: center;
            width: 100%;
            margin-bottom: 12px;
        }

        &__title {
            font-size: 15px;
            font-weight: 600;
            margin-right: auto;
        }

        .point {
            width: 4px;
            height: 4px;
            border-radius: 100%;
            background-color: $secondary;
            margin-right: 8px;
        }

        &__filters {
            display: flex;
            align-items: center;
            height: 18px;

            .icon {
                width: 18px;
                height: 18px;
                color: $secondary;
                cursor: pointer;

                &.active {
                    color: $action;
                }
            }
        }

        &__card-list {
            max-height: 564px;
            overflow-y: auto;
            -ms-overflow-style: none;
            overflow: -moz-scrollbars-none;
            &::-webkit-scrollbar {
                width: 0;
            }

            &__item {
                margin-bottom: 8px;

                &:last-child {
                    margin-bottom: 0;
                }
            }
        }

        &__empty-list {
            padding: 52px 12px;
            text-align: center;
            color: $secondary;
            font-size: 13px;
            border: 1px dashed $grey-border;
            border-radius: 4px;
        }

        &__add-card {
            margin-top: 12px;
            padding: 8px 20px;
            text-align: center;
            color: $secondary;
            font-size: 13px;
            cursor: pointer;
        }
    }
</style>
