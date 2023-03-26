<template>
	<button
		class="button"
		:disabled="props.disabled"
	>
		<span class="title">
			{{ props.title }}
		</span>
	</button>
</template>

<script lang="ts" setup>

const props = defineProps({
	title: {
		type: String,
		default: ''
	},
	disabled: {
		type: Boolean,
		default: false
	},
})

</script>

<style scoped lang="scss">
	@import '@/assets/scss/variables.scss';

	.button {
		background: $action;
		color: #fff;
		border-radius: 4px;
		padding: 8px 20px;
		transition: .3s;
		cursor: pointer;

		.title {
			font-size: 13px;
		}

		&:hover {
			opacity: 0.8;
		}

		&:disabled {
			opacity: 0.15;
		}
	}

</style>
