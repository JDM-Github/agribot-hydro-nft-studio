<script>
	export let folder;
	export let isOpen = false;
    export let changeThumbnail;
    export let renameFolder;
    export let closeModal;

</script>

{#if isOpen}
	<div class="lg:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 ">
		<div
			class="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 dark:bg-gray-900 border dark:border-gray-700 border-gray-300"
		>
			<div
				class="relative flex h-64 items-center justify-center bg-gray-100 shadow-inner md:h-80 dark:bg-gray-800"
			>
				<img
					class="h-full w-full rounded-t-2xl object-cover"
					src={folder.thumbnail}
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
							>{folder.name}</span
						>
					</li>
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Created At:</span>
						<span>{folder.createdAt}</span>
					</li>
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Size:</span>
						<span>{folder.size}</span>
					</li>
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Total Files:</span>
						<span>{folder.fileCount} Files</span>
					</li>
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Owner:</span>
						<span>{folder.owner}</span>
					</li>
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Last Modified:</span>
						<span>{folder.lastModified}</span>
					</li>
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Access:</span>
						<span>{folder.access}</span>
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
				<!-- <button
					on:click={deleteFolder}
					class="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
				>
					Delete
				</button> -->
				<button
					class="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600"
				>
					Download
				</button>
				<button
					on:click={closeModal}
					class="mt-2 rounded-lg bg-gray-400 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-500"
					>Close</button
				>
			</div>
		</div>
	</div>
{/if}
