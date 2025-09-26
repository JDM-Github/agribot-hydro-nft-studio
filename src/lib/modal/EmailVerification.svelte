<script lang="ts">
	import { addToast } from "$lib/stores/toast";

	export let onClose: () => void;
	export let onVerified: () => void;
	export let verificationCode: string;

	let pin = ["", "", "", "", "", ""];
	let error = "";

	const handleInput = (index: number, e: Event) => {
		const input = e.target as HTMLInputElement;
		const value = input.value.replace(/\D/, "");
		pin[index] = value;

		if (value && index < pin.length - 1) {
			const next = document.getElementById(`pin-${index + 1}`);
			next?.focus();
		}
	};

	const handleSubmit = async () => {
		const code = pin.join("");
		if (code.length !== 6) {
			error = "Please enter a 6-digit code.";
			return;
		}
		if (verificationCode === code) {
			addToast("Email verified successfully!", "success", 3000);
			onVerified();
		} else {
			error = "Invalid code. Please try again.";
		}
	};
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
	<div class="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
		<h2 class="mb-4 text-center text-2xl font-bold text-green-700 dark:text-green-400">
			Verify Your Email
		</h2>
		<p class="mb-6 text-center text-gray-600 dark:text-gray-300">
			Enter the 6-digit code sent to your email.
		</p>

		<div class="mb-4 flex justify-center gap-2">
			{#each pin as digit, i}
				<input
					id="pin-{i}"
					type="text"
					maxlength="1"
					bind:value={pin[i]}
					on:input={(e) => handleInput(i, e)}
					class="h-12 w-12 rounded-md border text-center text-xl font-bold focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			{/each}
		</div>

		{#if error}
			<p class="mb-4 text-center text-sm text-red-500">{error}</p>
		{/if}

		<div class="flex justify-center gap-4">
			<button
				class="rounded-md bg-gray-400 px-4 py-2 text-white hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700"
				on:click={onClose}
			>
				Cancel
			</button>
			<button
				class="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
				on:click={handleSubmit}
			>
				Verify
			</button>
		</div>
	</div>
</div>
