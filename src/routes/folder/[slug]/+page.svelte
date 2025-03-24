<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import FolderInfo from '$lib/modal/FolderInfo.svelte';
	import ViewPicture from '$lib/modal/ViewPicture.svelte';
	import { derived, writable } from 'svelte/store';

	let folderInfo = false;
	let modalOpen = writable(false);
	let selectedImage = writable<null | { id: number; src: string }>(null);

	function openModal(image: { id: number; src: string }) {
		selectedImage.set({ ...image });
		modalOpen.set(true);
	}

	function closeModal() {
		modalOpen.set(false);
	}

	function downloadImage(imageSrc: string, imageId: string) {
		const link = document.createElement('a');
		link.href = imageSrc;
		link.target = '_blank';
		link.download = `captured_image_${imageId}.jpg`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	let folder = writable({
		id: 'folder-123',
		name: 'Project Files',
		createdAt: 'March 22, 2025, 10:30 AM',
		lastModified: 'March 25, 2025, 3:15 PM',
		size: '250MB',
		fileCount: 12,
		owner: 'John Doe',
		access: 'Private',
		thumbnail: 'https://placehold.co/600x400/000000/FFF',
		tags: ['Design', 'Development'],
		permissions: {
			canEdit: true,
			canShare: true,
			canDelete: true
		}
	});

	let images = writable([
		{
			id: 1,
			src: 'https://placehold.co/600x400/000000/FFF',
			timestamp: new Date().toLocaleString(),
			plantName: 'Tomato Plant',
			diseaseName: 'Late Blight',
			location: {
				address: 'Greenhouse #3, Farmville',
				latitude: 37.7749,
				longitude: -122.4194
			},
			imageSize: '600x400',
			generatedDescription:
				'A tomato plant showing symptoms of Late Blight, characterized by dark lesions on leaves.'
		},
		{
			id: 2,
			src: 'https://placehold.co/600x400/000000/FFF',
			timestamp: new Date().toLocaleString(),
			plantName: 'Cucumber Plant',
			diseaseName: 'Powdery Mildew',
			location: {
				address: 'Field #7, Rural Area',
				latitude: 34.0522,
				longitude: -118.2437
			},
			imageSize: '600x400',
			generatedDescription:
				'Cucumber plant affected by Powdery Mildew, displaying white powder-like spots on leaves.'
		},
		{
			id: 3,
			src: 'https://placehold.co/600x400/000000/FFF',
			timestamp: new Date().toLocaleString(),
			plantName: 'Strawberry Plant',
			diseaseName: 'Bacterial Spot',
			location: {
				address: 'Backyard Garden, Springville',
				latitude: 40.7128,
				longitude: -74.006
			},
			imageSize: '600x400',
			generatedDescription:
				'Strawberry plant infected with Bacterial Spot, showing small black spots on fruit and leaves.'
		},
		{
			id: 4,
			src: 'https://placehold.co/600x400/000000/FFF',
			timestamp: new Date().toLocaleString(),
			plantName: 'Lettuce Plant',
			diseaseName: 'Downy Mildew',
			location: {
				address: 'Organic Farm, Riverside',
				latitude: 51.5074,
				longitude: -0.1278
			},
			imageSize: '600x400',
			generatedDescription:
				'Lettuce plant showing signs of Downy Mildew, with yellow patches and gray fungal growth underneath leaves.'
		}
	]);

	function renameFolder() {
		const newName = prompt('Enter new folder name:', 'Project Files');
		if (newName) folder.update((f) => ({ ...f, name: newName }));
	}

	function deleteFolder() {
		if (confirm('Are you sure you want to delete this folder?')) {
			alert('Folder deleted');
		}
	}

	function changeThumbnail(event: any) {
		const file = event.target.files[0];
		if (file) {
			const url = URL.createObjectURL(file);
			folder.update((f) => ({ ...f, thumbnail: url }));
		}
	}

	let currentPage = writable(1);
	const itemsPerPage = 10;

	const paginatedImages = derived([currentPage], ([$currentPage]) => {
		const start = ($currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return $images.slice().slice(start, end);
	});

	function nextPage() {
		if ($currentPage < Math.ceil($images.length / itemsPerPage)) {
			currentPage.update((n) => n + 1);
		}
	}

	function prevPage() {
		if ($currentPage > 1) {
			currentPage.update((n) => n - 1);
		}
	}
</script>

<main
	class="relative flex min-h-[calc(100vh-95px)] flex-col bg-gray-200 p-4 lg:px-16 dark:bg-gray-700 transition-all duration-500 ease-out"
>
	<div class="relative z-10 mb-4 flex flex-col gap-4 lg:flex-row">
		<div
			class="hidden w-full transform overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-500 ease-out lg:block lg:max-w-md dark:bg-gray-900"
		>
			<div
				class="relative flex h-64 items-center justify-center bg-gray-100 shadow-inner md:h-80 dark:bg-gray-800"
			>
				<img
					class="h-full w-full rounded-t-2xl object-cover"
					src={$folder.thumbnail}
					alt="Folder Thumbnail"
				/>
				<label
					class="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-sm text-white opacity-0 transition hover:opacity-100"
				>
					<input type="file" class="hidden" accept="image/*" on:change={changeThumbnail} />
					Change Thumbnail
				</label>
			</div>

			<div class="space-y-4 divide-y divide-gray-200 p-4 dark:divide-gray-700">
				<ul class="space-y-3 pt-2 text-sm text-gray-600 dark:text-gray-400">
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Folder Name:</span>
						<span class="truncate font-semibold text-gray-700 dark:text-gray-200"
							>{$folder.name}</span
						>
					</li>
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Created At:</span>
						<span>{$folder.createdAt}</span>
					</li>
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Size:</span>
						<span>{$folder.size}</span>
					</li>
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Total Files:</span>
						<span>{$folder.fileCount} Files</span>
					</li>
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Owner:</span>
						<span>{$folder.owner}</span>
					</li>
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Last Modified:</span>
						<span>{$folder.lastModified}</span>
					</li>
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Access:</span>
						<span>{$folder.access}</span>
					</li>
				</ul>
			</div>

			<div class="flex flex-col gap-2 p-4">
				<button
					on:click={renameFolder}
					class="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800"
				>
					Rename
				</button>
				<button
					on:click={deleteFolder}
					class="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
				>
					Delete
				</button>
				<button
					class="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600"
				>
					Download
				</button>
			</div>
		</div>

		<div class="flex w-full flex-col rounded-xl bg-white p-4 shadow-lg dark:bg-gray-900">
			<div
				class="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-[#fafffc] p-2 dark:border-gray-700 dark:bg-gray-900"
			>
				<div class="flex items-center gap-2">
					<span class="text-xl sm:text-2xl">📄</span>
					<h2 class="text-base font-bold text-gray-400 sm:text-lg dark:text-gray-300">
						{$folder.name}
					</h2>
				</div>

				<button
					class="block rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 lg:hidden dark:border-gray-700 dark:text-white"
					on:click={() => (folderInfo = true)}
				>
					View Folder Details
				</button>
			</div>

			<div
				class="mt-4 grid min-h-[400px] grid-cols-4 gap-4 rounded-2xl bg-gray-300 p-4 lg:grid-cols-5 dark:bg-gray-800"
			>
				{#each $paginatedImages as image}
					<button
						class="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg shadow-md focus:ring-2 focus:ring-green-500 focus:outline-none dark:focus:ring-green-300 border border-gray-200 dark:border-gray-700"
						on:click={() => openModal(image)}
						aria-label="View image details"
					>
						<img class="h-full w-full object-cover" src={image.src} alt="Image {image.id}" />
						<div
							class="absolute top-0 left-0 rounded-br-lg bg-black/50 px-2 py-1 text-xs text-white"
						>
							{image.id}
						</div>
					</button>
				{/each}
			</div>

			<div class="mt-4 flex items-center justify-center gap-2">
				<button
					on:click={prevPage}
					disabled={$currentPage === 1}
					class="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
				>
					Prev
				</button>
				<span class="text-sm font-semibold text-gray-700 dark:text-gray-300"
					>Page {$currentPage} of {Math.ceil($images.length / itemsPerPage)}</span
				>
				<button
					on:click={nextPage}
					disabled={$currentPage === Math.ceil($images.length / itemsPerPage)}
					class="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
				>
					Next
				</button>
			</div>
		</div>
	</div>
</main>
<Footer />

<ViewPicture modalOpen={$modalOpen} {closeModal} {downloadImage} selectedImage={$selectedImage} />
<FolderInfo
	folder={$folder}
	isOpen={folderInfo}
	{changeThumbnail}
	{renameFolder}
	{deleteFolder}
	closeModal={() => (folderInfo = false)}
/>
