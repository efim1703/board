<template>
	<transition name="fade" appear>
		<div
			v-if="props.value"
			:class="['dialog', { 'active': props.value }]"
			@click.self="$emit('input', false)"
		>
			<div class="dialog_wrapper">
				<div class="dialog_close icon" @click="$emit('input', false)">
					<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve"  style="enable-background:new 0 0 512 512" viewBox="0 0 32 32"><path d="m17.72508 16 5.23746-5.23746a1.22 1.22 0 0 0-1.72508-1.72508L16 14.27492l-5.23746-5.23746a1.22 1.22 0 0 0-1.72508 1.72508L14.27492 16l-5.23746 5.23746a1.22 1.22 0 0 0 1.72508 1.72508L16 17.72508l5.23746 5.23746a1.22 1.22 0 0 0 1.72508-1.72508z" data-original="#000000"/><path d="M28.2 31.86H3.8A3.66 3.66 0 0 1 .14 28.2V3.8A3.66 3.66 0 0 1 3.8.14h24.4a3.66 3.66 0 0 1 3.66 3.66v24.4a3.66 3.66 0 0 1-3.66 3.66zM3.8 2.58A1.22 1.22 0 0 0 2.58 3.8v24.4a1.22 1.22 0 0 0 1.22 1.22h24.4a1.22 1.22 0 0 0 1.22-1.22V3.8a1.22 1.22 0 0 0-1.22-1.22z" data-original="#000000"/></svg>
				</div>
				<slot></slot>
			</div>
		</div>
	</transition>
</template>

<script lang="ts" setup>

const props = defineProps({
	value: {
		type: Boolean,
		default: false
	}
})
</script>

<style lang="scss" scoped>
	.dialog {
		display: flex;
		position: fixed;
		width: 100%;
		height: 100%;
		top: 0;
		right: 0;
		z-index: 20;
		background: rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(4px);
		align-items: center;
		text-align: center;
		overflow-x: hidden;
		overflow-y: auto;

		&_wrapper {
			position: relative;
			padding: 30px 60px;
			margin: 0 auto;
			background: white;
			border-radius: 5px;
		}

		&_close {
			position: absolute;
			top: 10px;
			right: 10px;
			background: transparent;
			cursor: pointer;
		}
	}
</style>
