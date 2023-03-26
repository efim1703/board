<template>
	<div :class="['wrapper', { 'error': error }]">
        <div class="input__label">
            {{ getFullLabel }}
            <span class="error-text" v-if="error">{{ error }}</span>
        </div>
        <input
            :type="type"
            :value="value"
            @input="updateValue"
            class="input"
        >
    </div>
</template>

<script lang="ts" setup>

import {computed, PropType} from "vue";

type InputType = 'text' | 'number';

const props = defineProps({
	value: {
		type: [String, Number],
		required: true
	},
    type: {
        type: String as PropType<InputType>,
        default: 'text'
    },
    label: {
        type: String,
        default: ''
    },
    required: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: ''
    },
})

const emits = defineEmits(['update:value'])

const getFullLabel = computed(() => props.label + (props.required ? ' *:': ':'))

const updateValue = (e: Event) => {
  emits('update:value', (e.target as HTMLInputElement).value)
};

</script>

<style scoped lang="scss">
    @import '@/assets/scss/variables.scss';

    .wrapper {
        .input {
            width: 100%;
            padding: 8px 16px;
            background: $grey-background;
            border: 1px solid transparent;
            border-radius: 4px;
            font-size: 13px;
            color: $dark;
            cursor: pointer;

            &[type="number"]::-webkit-outer-spin-button,
            &[type="number"]::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
        }

        .input__label {
            color: $secondary;
            font-size: 12px;
            margin-bottom: 4px;

            .error-text {
                margin-left: 4px;
                color: $error;
            }
        }

        &.error .input {
            border: 1px solid $error;
        }
    }
</style>
