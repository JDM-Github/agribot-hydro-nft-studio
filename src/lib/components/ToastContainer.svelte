<script lang="ts">
	import { removeToast, toasts } from '$lib/stores/toast';
	import { CheckCircle, XCircle, Info, Loader } from 'lucide-svelte';
	import { fly, fade } from 'svelte/transition';

	$: hasBlocking = $toasts.some(
		(t) => (t.type === 'loading' && !t.blocking) || t.type === 'confirm' || t.blocking
	);

</script>

{#if hasBlocking}
	<div
		class="fixed inset-0 z-100 flex items-center justify-center bg-black/60 transition-opacity"
		style="pointer-events: auto;"
	>
		{#if $toasts.find(t => t.type === 'loading')}
			<div class="flex flex-col items-center text-white">
				<Loader class="mb-3 h-10 w-10 animate-spin text-yellow-400" />
				<span class="text-sm font-semibold text-gray-200">Processing...</span>
			</div>
		{/if}
	</div>
{/if}

<div class="fixed right-4 bottom-4 z-200 w-full max-w-md transform space-y-4">
	{#each $toasts as toast (toast.id)}
		<div
			in:fly={{ y: 20, duration: 200 }}
			out:fly={{ y: 20, opacity: 0, duration: 300 }}
			class="toast flex flex-col rounded-lg border-2 bg-gray-100 text-gray-900 shadow-2xl dark:bg-gray-800 dark:text-white"
			class:border-green-500={toast.type === 'success'}
			class:border-red-500={toast.type === 'error' || toast.type === 'confirm'}
			class:border-blue-500={toast.type === 'info'}
			class:border-yellow-500={toast.type === 'loading' || toast.type === 'loading-non-blocking'}
		>
			<div class="flex items-center">
				<div
					class="mr-3 rounded-l-lg p-4 text-2xl"
					class:bg-green-600={toast.type === 'success'}
					class:bg-red-600={toast.type === 'error' || toast.type === 'confirm'}
					class:bg-blue-600={toast.type === 'info'}
					class:bg-yellow-600={toast.type === 'loading' || toast.type === 'loading-non-blocking'}
				>
					{#if toast.type === 'success'}
						<CheckCircle class="text-white" />
					{:else if toast.type === 'error'}
						<XCircle class="text-white" />
					{:else if toast.type === 'info'}
						<Info class="text-white" />
					{:else if toast.type === 'loading' || toast.type === 'loading-non-blocking'}
						<Loader class="text-white animate-spin" />
					{:else if toast.type === 'confirm'}
						⚠️
					{/if}
				</div>

				<span class="flex-1 p-4">{toast.message}</span>

				{#if !toast.actions}
					<button
						class="ml-4 p-4 text-xl font-bold text-gray-900 transition-colors hover:text-gray-300 dark:text-white"
						on:click={() => removeToast(toast.id)}
						aria-label="Close"
					>
						×
					</button>
				{/if}
			</div>

			{#if toast.actions}
				<div class="flex justify-end gap-2 p-2 border-t border-gray-300 dark:border-gray-700">
					{#each toast.actions as action}
						<button
							on:click={action.handler}
							class="rounded-md bg-gray-300 px-3 py-1.5 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
						>
							{action.label}
						</button>
					{/each}
				</div>
			{/if}
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
