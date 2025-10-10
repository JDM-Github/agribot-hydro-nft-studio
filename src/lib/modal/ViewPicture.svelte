<script lang="ts">
	import { addToast, removeToast } from '$lib/stores/toast';
	import { capitalize } from '$utils/string';
	import type { PlantHistories } from '../type';

	export let modalOpen;
	export let closeModal: () => void;
	export let downloadImage;
	export let selectedImage;
	export let images: any | null;
	export let noDownloadDelete = false;

	async function deleteImage(public_id: string) {
		if (images === null) return;

		const toastId = addToast('Deleting image...', 'loading');
		const res = await fetch('/api/delete-image', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ public_id })
		});
		if (!res.ok) {
			removeToast(toastId);
			addToast('Failed to delete image', 'error');
			console.error('Failed to delete image');
			return false;
		}

		removeToast(toastId);
		const result = await res.json();
		if (result.success) {
			addToast('Successfully deleted image.', 'success');
			images.update((imgs: any) => imgs.filter((img: any) => img.id !== public_id));
			closeModal();
		}

		return result.success;
	}
</script>

{#if modalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
		<div
			class={`relative w-full 
                ${selectedImage.plantName === 'SCANBOX' ? 'max-w-5xl' : 'max-w-6xl'} 
                flex rounded-xl border border-gray-300 bg-white 
                shadow-xl dark:border-gray-700 dark:bg-gray-900`}
		>
			<button
				class="absolute top-3 right-3 rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
				on:click={closeModal}
			>
				✖
			</button>

			<div
				class="relative flex w-1/2 items-center justify-center rounded-xl bg-gray-300 p-2 dark:bg-gray-800"
			>
				<img
					class="max-h-[600px] w-full rounded-xl object-contain"
					src={selectedImage.src}
					alt="Zoomed"
				/>
				<div
					class="absolute bottom-0 left-0 w-full bg-gray-900/50 p-4 text-center text-sm text-white dark:bg-gray-900/50"
				>
					{selectedImage.id} | Captured at: {selectedImage.timestamp}
				</div>
			</div>

			<div class="max-h-[600px] w-1/2 space-y-3 overflow-y-auto p-6">
				<h2
					class="mb-4 border-b border-green-500/40 pb-2 text-xl font-semibold text-gray-800 dark:text-green-200"
				>
					{selectedImage.plantName === 'SCANBOX' ? 'SCANBOX' : 'ROI PLANT'}
				</h2>
				{#if selectedImage.plantName !== 'SCANBOX'}
					<p class="text-sm text-gray-600 dark:text-gray-400">
						<strong>Plant:</strong>
						{capitalize(selectedImage.plantName)}
					</p>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						<strong>Plant Health:</strong>
						{capitalize(selectedImage.plantHealth ?? selectedImage.diseaseName)}
					</p>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						<strong>Image Size:</strong>
						{selectedImage.imageSize}
					</p>
					<p
						class="max-h-100 overflow-y-auto text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-400"
					>
						<strong>AI Analysis:</strong><br />{selectedImage.generatedDescription}
					</p>
				{:else}
					<p class="text-sm text-gray-600 dark:text-gray-400">
						<strong>Image Size:</strong>
						{selectedImage.imageSize}
					</p>
				{/if}

				<div class="space-y-2">
					{#if !noDownloadDelete}
						<button
							class="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
							on:click={() => downloadImage(selectedImage.src)}
						>
							Download Image
						</button>

						<button
							class="w-full rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 dark:bg-red-800 dark:hover:bg-red-900"
							on:click={() => deleteImage(selectedImage.id)}
						>
							Delete Image
						</button>
					{/if}

					<button
						class="w-full rounded-lg bg-gray-400 px-4 py-2 text-gray-900 hover:bg-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-800"
						on:click={closeModal}
					>
						Close
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
