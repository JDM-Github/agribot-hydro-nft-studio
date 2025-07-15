<script lang="ts">
	import { removeToast, toasts } from '$lib/stores/toast';
	import { CheckCircle, XCircle, Info, Loader } from 'lucide-svelte';
	$: hasBlocking = $toasts.some(t => t.blocking);
</script>

{#if hasBlocking}
	<div
		class="fixed inset-0 z-40 bg-black/60"
		style="pointer-events: auto;"
	></div>
{/if}
<div class="fixed right-4 bottom-4 z-50 w-full max-w-md transform space-y-4">
	{#each $toasts as toast (toast.id)}
		<div
			class="toast animate-toast-in flex flex-col rounded-lg border-2 bg-gray-100 text-gray-900 shadow-2xl dark:bg-gray-800 dark:text-white"
			class:border-green-500={toast.type === 'success'}
			class:border-red-500={toast.type === 'error' || toast.type === 'confirm'}
			class:border-blue-500={toast.type === 'info'}
			class:border-yellow-500={toast.type === 'loading'}
		>
			<div class="flex items-center">
				<div
					class="mr-3 rounded-lg p-4 text-2xl"
					class:bg-green-600={toast.type === 'success'}
					class:bg-red-600={toast.type === 'error' || toast.type === 'confirm'}
					class:bg-blue-600={toast.type === 'info'}
					class:bg-yellow-600={toast.type === 'loading'}
				>
					{#if toast.type === 'success'}
						<CheckCircle class="text-white" />
					{:else if toast.type === 'error'}
						<XCircle class="text-white" />
					{:else if toast.type === 'info'}
						<Info class="text-white" />
					{:else if toast.type === 'loading'}
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
					>
						×
					</button>
				{/if}
			</div>

			{#if toast.actions}
				<div class="flex justify-end gap-2 p-2">
					{#each toast.actions as action}
						<button
							on:click={action.handler}
							class="rounded-md bg-gray-300 px-3 py-1.5 text-sm font-bold text-gray-800 hover:bg-gray-400"
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
