<script lang="ts">
	import { tooltip } from 'svooltip';
	import '../styles/ToolTip.scss';

	export let content: string | undefined;
	export let html: boolean = false;
</script>

{#if content}
	<div
		use:tooltip={{
			content: content,
			html: html
		}}
	>
		<slot />
	</div>
{:else}
	<slot />
{/if}

<style>
	:root {
		--svooltip-bg: var(--surface-three);
		--svooltip-text: var(--text-four);
		--svooltip-padding: 0.75rem 1rem;
		--svooltip-weight: bold;
		--svooltip-text-size: 16px;
		--svooltip-shadow: var(--drop-shadow-one);
		--svooltip-arrow-size: 0;
		--svooltip-roundness: 12px;
	}
</style>
