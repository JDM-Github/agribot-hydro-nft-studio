<script lang="ts">
	import { removeToast, toasts } from '$lib/stores/toast';
	import { onDestroy } from 'svelte';

	import { CheckCircle, XCircle, Info } from 'lucide-svelte';

	let currentToasts;

	const unsubscribe = toasts.subscribe(($) => {
		currentToasts = $;
	});

	onDestroy(() => unsubscribe());
</script>

<div class="fixed right-4 bottom-4 z-50 w-full max-w-md transform space-y-4">
	{#each $toasts as toast (toast.id)}
		<div
			class="toast animate-toast-in flex items-center justify-between rounded-lg border-2 bg-gray-100 text-gray-900 shadow-2xl dark:bg-gray-800 dark:text-white"
			class:border-green-500={toast.type === 'success'}
			class:border-red-500={toast.type === 'error'}
			class:border-blue-500={toast.type === 'info'}
		>
			<div
				class="mr-3 rounded-lg p-4 text-2xl"
				class:bg-green-600={toast.type === 'success'}
				class:bg-red-600={toast.type === 'error'}
				class:bg-blue-600={toast.type === 'info'}
			>
				{#if toast.type === 'success'}
					<CheckCircle class="text-white" />
				{:else if toast.type === 'error'}
					<XCircle class="text-white" />
				{:else if toast.type === 'info'}
					<Info class="text-white" />
				{/if}
			</div>

			<span class="flex-1 p-4">{toast.message}</span>

			<button
				class="ml-4 p-4 text-xl font-bold text-gray-900 transition-colors hover:text-gray-300 dark:text-white"
				on:click={() => removeToast(toast.id)}
			>
				×
			</button>
		</div>
	{/each}
</div>

<style>
	@keyframes toast-in {
		0% {
			opacity: 0;
			transform: translateY(20px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.toast {
		animation: toast-in 0.3s ease-out forwards;
	}
</style>
