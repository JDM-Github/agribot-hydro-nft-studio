<script lang="ts">
	import { tick } from "svelte";
	import gsap from "gsap";
	import { addToast, removeToast } from "$lib/stores/toast";
	import { capitalize } from "$utils/string";
	import { userData } from "../stores/connection";

	export let modalOpen;
	export let closeModal: () => void;
	export let downloadImage;
	export let selectedImage;
	export let noDownloadDelete = false;
	export let fetchFolder: any = null;

	let confirmDeleteVisible = false;
	let isDeleting = false;

	$: if (modalOpen) {
		animateModalOpen();
	}
	async function animateModalOpen() {
		await tick();
		const overlay = document.querySelector(".modal-overlay");
		const modal = document.querySelector(".modal-container");

		if (!overlay || !modal) return;

		gsap.set([overlay, modal], { clearProps: "all" });

		gsap.fromTo(
			overlay,
			{ opacity: 1 },
			{ opacity: 1, duration: 0.35, ease: "power2.out" }
		);

		gsap.fromTo(
			modal,
			{ opacity: 1, y: 0, scale: 0.1 },
			{ opacity: 1, y: 0, scale: 1, duration: 0.1 }
		);
	}

	async function animateModalClose(callback: any) {
		const overlay = document.querySelector(".modal-overlay");
		const modal = document.querySelector(".modal-container");
		if (!overlay || !modal) return callback();

		const tl = gsap.timeline({ onComplete: callback });
		tl.to(modal, {
			opacity: 0,
			y: 50,
			scale: 0.1,
			duration: 0.3,
			ease: "power2.inOut"
		}).to(
			overlay,
			{ opacity: 0, duration: 0.25, ease: "power1.inOut" },
			"-=0.2"
		);
	}

	function handleClose() {
		animateModalClose(closeModal);
	}

	async function confirmDelete(public_id: string) {
		isDeleting = true;
		confirmDeleteVisible = false;
		const toastId = addToast("Deleting image...", "loading");

		const res = await fetch("/api/delete-image", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ public_id })
		});

		if (!res.ok) {
			removeToast(toastId);
			addToast("Failed to delete image", "error");
			return;
		}
		removeToast(toastId);
		const result = await res.json();
		if (result.success) {
			await fetchFolder($userData.user.email, true);
			addToast("Successfully deleted image.", "success");
		}
		isDeleting = false;
		handleClose();
	}
</script>

{#if modalOpen}
	<!-- Main Modal Overlay -->
	<div class="fixed inset-0 z-40 flex items-center justify-center bg-black/80 modal-overlay p-4">
		<div
			class={`relative w-full modal-container max-h-[500px]
				${selectedImage.plantName === "SCANBOX" ? "max-w-5xl" : "max-w-6xl"}
				flex rounded-xl border border-gray-300 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900`}
		>
			<button
				class="absolute top-3 right-3 rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
				on:click={handleClose}
			>
				✖
			</button>

			<div class="relative flex w-1/2 items-center justify-center rounded-xl bg-gray-300 p-2 dark:bg-gray-800">
				<img
					class="max-h-[500px] w-full rounded-xl object-contain"
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
				<h2 class="mb-4 border-b border-green-500/40 pb-2 text-xl font-semibold text-gray-800 dark:text-green-200">
					{selectedImage.plantName === "SCANBOX" ? "SCANBOX" : "ROI PLANT"}
				</h2>

				{#if selectedImage.plantName !== "SCANBOX"}
					<p class="text-sm text-gray-600 dark:text-gray-400">
						<strong>Plant:</strong> {capitalize(selectedImage.plantName)}
					</p>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						<strong>Plant Health:</strong>
						{capitalize(selectedImage.plantHealth ?? selectedImage.diseaseName)}
					</p>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						<strong>Image Size:</strong> {selectedImage.imageSize}
					</p>
					<p class="max-h-100 overflow-y-auto text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-400">
						<strong>AI Analysis:</strong><br />
						{selectedImage.generatedDescription.replace(/\\n/g, "\n")}
					</p>
				{:else}
					<p class="text-sm text-gray-600 dark:text-gray-400">
						<strong>Image Size:</strong> {selectedImage.imageSize}
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
							on:click={() => (confirmDeleteVisible = true)}
						>
							Delete Image
						</button>
					{/if}

					<button
						class="w-full rounded-lg bg-gray-400 px-4 py-2 text-gray-900 hover:bg-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-800"
						on:click={handleClose}
					>
						Close
					</button>
				</div>
			</div>
		</div>
	</div>
	{#if isDeleting}
		<div class="fixed inset-0 z-49 flex items-center justify-center bg-black/70 confirm-overlay"></div>
	{/if}

	{#if confirmDeleteVisible}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 confirm-overlay">
			<div class="rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 confirm-box">
				<h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-3">
					Confirm Deletion
				</h3>
				<p class="text-sm text-gray-600 dark:text-gray-300 mb-5">
					Are you sure you want to delete this image? This action cannot be undone.
				</p>
				<div class="flex justify-end gap-3">
					<button
						class="rounded-md bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
						on:click={() => (confirmDeleteVisible = false)}
					>
						Cancel
					</button>
					<button
						class="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800"
						on:click={() => confirmDelete(selectedImage.id)}
					>
						Delete
					</button>
				</div>
			</div>
		</div>

		{@html `
			<script>
				(async () => {
					await tick();
					const overlay = document.querySelector('.confirm-overlay');
					const box = document.querySelector('.confirm-box');
					if (overlay && box) {
						gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
						gsap.fromTo(box, { opacity: 0, scale: 0.8, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.5)" });
					}
				})();
			</script>
		`}
	{/if}
{/if}
