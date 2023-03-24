<template>
	<input
		:type="typeof value === 'string' ? 'text' : 'number'"
		:value="value"
		@input="updateValue"
		class="input"
	>
</template>

<script lang="ts" setup>

const props = defineProps({
	value: {
		type: [String, Number],
		required: true
	},
})

const emits = defineEmits(['update:value'])

const updateValue = (e: Event) => {
  emits('update:value', (e.target as HTMLInputElement).value)
};

</script>

<style scoped lang="scss">

.input {
	padding: 8px 12px;
	background: transparent;
	border: 1px solid #211221;
	border-radius: 8px;
	color: #211221;
	cursor: pointer;
}
</style>
