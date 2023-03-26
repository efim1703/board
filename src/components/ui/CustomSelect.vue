<template>
    <div
        :class="['select', { 'full-width': fullWidth }]"
        @click="toggleDropdown"
        ref="element"
    >
        <p :class="{ 'title-active': activeOption }"> {{ activeOption?.title ?? defaultOption }}</p>
        <svg :class="['arrow',{ rotate:isOpen }]" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.37183 9.87183C7.68425 9.55941 8.19078 9.55941 8.5032 9.87183L12 13.3686L15.4968 9.87183C15.8092 9.55941 16.3158 9.55941 16.6282 9.87183C16.9406 10.1842 16.9406 10.6908 16.6282 11.0032L12.5657 15.0657C12.2533 15.3781 11.7467 15.3781 11.4343 15.0657L7.37183 11.0032C7.05941 10.6908 7.05941 10.1842 7.37183 9.87183Z" fill="currentColor"/></svg>
        <transition name="fade">
            <div class="select__sub-menu" v-if="isOpen">
                <div class="select__sub-menu-close-area"></div>
                <div class="select__sub-menu-item" @click="$emit('option-changed', null)">
                    {{defaultOption}}
                </div>
                <div
                    v-for="option in options"
                    :key="option.id"
                    @click="$emit('option-changed', option.id)"
                    :class="['select__sub-menu-item', { 'active': option.id === activeOption?.id }]"
                >
                    {{ option.title }}
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, PropType, ref } from "vue";
import OptionInterface from '@/interfaces/OptionInterface';

const element  = ref(null)

const props = defineProps({
    defaultOption: {
        type: String,
        required: true
    },
    options: {
        type: Array as PropType<OptionInterface[]>,
        required: true
    },
    activeOption: {
        type: Object as PropType<OptionInterface | null>,
        default: null
    },
    fullWidth: {
        type: Boolean,
        default: false
    }
})

const isOpen = ref(false);

onMounted(() => {
    document.addEventListener('click', close)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', close)
})

const toggleDropdown = () => {
    isOpen.value = !isOpen.value
}

const close = (event: Event) => {
    if (isOpen.value && element.value && !element.value.contains(event.target)) {
        isOpen.value = false
    }
}

</script>

<style lang="scss" scoped>
    @import '@/assets/scss/variables.scss';

    .select {
        position: relative;
        padding: 8px;
        display: flex;
        align-items: center;
        cursor: pointer;
        background: $grey;  
        border-radius: 4px;
        font-size: 13px;
        color: $secondary;

        p {
            margin-left: 8px;
        }

        &__sub-menu {
            position: absolute;
            width: 100%;
            top: 32px;
            right: 0;
            padding: 4px;
            border-radius: 4px;
            background: $grey;
            text-align: center;
            white-space: nowrap;
            z-index: 10;

            &-item {
                padding: 4px 8px;
                cursor: pointer;
                border-radius: 4px;
                transition: background 0.15s ease ;

                &:hover {
                    background-color: $grey-light;
                }

                &.active {
                    background: $grey-light;
                }
            }
        }

        .arrow {
            margin-left: 8px;
            transition: .3s ease;
            color: $secondary;

            &.rotate {
                transform: rotate(180deg);
            }
        }

        .active {
            background: $grey;
        }

        .title-active {
            color: $action;
        }

        &.full-width {
            width: 100%;

            .arrow {
                margin-left: auto;
            }
        }
    }
    
</style>
