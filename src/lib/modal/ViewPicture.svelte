<script lang="ts">
	import { addToast, removeToast } from "$lib/stores/toast";

	export let modalOpen;
	export let closeModal;
	export let downloadImage;
	export let selectedImage;

	async function deleteImage(public_id: string) {
		const toastId = addToast("Deleting image...", "loading");
		const res = await fetch('/api/delete-image', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ public_id })
		});
		if (!res.ok) {
			removeToast(toastId);
			addToast("Failed to delete image", "error");
			console.error('Failed to delete image');
			return false;
		}

		removeToast(toastId);
		addToast("Successfully deleted image.", "error");
		const result = await res.json();
		return result.success;
	}
</script>

{#if modalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
		<div
			class="relative w-full max-w-lg rounded-lg border border-gray-300 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
		>
			<button
				class="absolute top-3 right-3 rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
				on:click={closeModal}
			>
				✖
			</button>

			<div class="relative">
				<img class="w-full rounded-t-lg object-cover max-h-100" src={selectedImage.src} alt="Zoomed" />
				<div
					class="absolute bottom-0 left-0 w-full bg-gray-300/50 p-2 text-center text-sm text-white dark:bg-gray-900/50"
				>
					{selectedImage.id} | Captured at: {selectedImage.timestamp}
				</div>
			</div>

			<div class="space-y-2 p-4">
				<p class="text-sm text-gray-600 dark:text-gray-400">
					<strong>Plant:</strong>
					{selectedImage.plantName}
				</p>
				<p class="text-sm text-gray-600 dark:text-gray-400">
					<strong>Disease:</strong>
					{selectedImage.diseaseName}
				</p>
				<p class="text-sm text-gray-600 dark:text-gray-400">
					<strong>Location:</strong>
					{selectedImage.location.address}
					({selectedImage.location.latitude}, {selectedImage.location.longitude})
				</p>
				<p class="text-sm text-gray-600 dark:text-gray-400">
					<strong>Image Size:</strong>
					{selectedImage.imageSize}
				</p>
				<p class="text-sm text-gray-600 dark:text-gray-400">
					<strong>AI Analysis:</strong>
					{selectedImage.generatedDescription}
				</p>

				<button
					class="mt-2 w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
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

				<button
					class="w-full rounded-lg bg-gray-400 px-4 py-2 text-gray-900 hover:bg-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-800"
					on:click={closeModal}
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}
