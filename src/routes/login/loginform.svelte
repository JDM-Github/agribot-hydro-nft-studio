<script lang="ts">
	import { goto } from '$app/navigation';
	import { login } from '$lib/stores/auth';
	import { addToast } from '$lib/stores/toast';

	let email = '';
	let password = '';

	function loginSubmit(event: Event) {
		event.preventDefault();
		if (email === 'test@example.com' && password === 'password') {
			login({ email, password });

			addToast('Login successful!', 'success', 3000);
			goto('/');
		} else {
			addToast('Invalid email or password.', 'error', 3000);
		}
	}
	export let isRegister;
	export let toggleForm: () => void;
</script>

<div
	class={`flex w-1/2 flex-col justify-center space-y-6 bg-white p-12 transition-transform duration-700 ease-in-out dark:bg-gray-800 ${isRegister ? 'pointer-events-none translate-x-0 opacity-0' : 'translate-x-full opacity-100'}`}
>
	<h3 class="text-3xl font-bold text-green-700 dark:text-green-400">Login to Your Account</h3>
	<form class="space-y-4" on:submit={loginSubmit} method="POST">
		<div>
			<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="email"
				>Email</label
			>
			<input
				bind:value={email}
				id="email"
				type="email"
				name="email"
				placeholder="Your Email"
				class="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
			/>
		</div>
		<div>
			<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="passId"
				>Password</label
			>
			<input
				bind:value={password}
				id="passId"
				type="password"
				name="password"
				placeholder="Your Password"
				class="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
			/>
		</div>
		<button
			type="submit"
			class="w-full rounded-md bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
			>Log In</button
		>
	</form>
	<p class="text-center text-sm text-gray-600 dark:text-gray-300">
		Don't have an account?
		<button
			type="button"
			on:click={toggleForm}
			class="text-green-600 hover:underline dark:text-green-400">Register here</button
		>
	</p>
</div>
