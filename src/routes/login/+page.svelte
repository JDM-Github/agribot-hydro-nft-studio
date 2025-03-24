<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import { login } from '$lib/stores/auth';
	import Loginform from './loginform.svelte';

	let isRegister = false;

	function toggleForm() {
		isRegister = !isRegister;
	}

	function loginTest(event: Event) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);

		alert(JSON.stringify(event));
		const email = formData.get('email');
		const password = formData.get('password');
		alert(`Email: ${email}, Password: ${password}`);
	}
</script>

<svelte:head>
	<title>{`REGISTRATION | AGRI-BOT Studio`}</title>
</svelte:head>

<section
	class="flex min-h-[calc(100vh-95px)] w-full items-center justify-center bg-gray-100 py-10 transition-all duration-500 ease-out sm:py-16 dark:bg-gray-700"
>
	<div
		class="relative hidden h-[70vh] w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-2xl md:flex dark:bg-gray-900"
	>
		<div
			class={`absolute inset-0 z-10 flex w-1/2 items-center justify-center bg-green-600 p-12 text-white transition-transform duration-700 ease-in-out dark:bg-gradient-to-b dark:from-green-500 dark:to-green-700 ${isRegister ? 'translate-x-full' : 'translate-x-0'}`}
		>
			<div class="space-y-4 text-center">
				<h2 class="text-4xl font-bold">
					{!isRegister ? 'Welcome Back!' : 'Join Our Research Project'}
				</h2>
				<p class="text-lg opacity-90">
					{!isRegister
						? 'Already have an account? Log in to continue.'
						: 'Create an account to explore our latest innovations.'}
				</p>
			</div>
		</div>

		<div class="relative z-20 flex flex-1">
			<Loginform toggleForm={toggleForm} isRegister={isRegister}/>

			<div
				class={`absolute inset-0 flex w-1/2 flex-col justify-center space-y-6 bg-white p-12 transition-transform duration-700 ease-in-out dark:bg-gray-800 ${isRegister ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0'}`}
			>
				<h3 class="text-3xl font-bold text-green-700 dark:text-green-400">Create Your Account</h3>
				<form class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="fname"
							>Full Name</label
						>
						<input
							id="fname"
							type="text"
							placeholder="Your Full Name"
							class="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="pip"
							>Prototype IP</label
						>
						<input
							id="pip"
							type="text"
							placeholder="Your Prototype ID"
							class="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="remail"
							>Email</label
						>
						<input
							id="remail"
							type="email"
							placeholder="Your Email"
							class="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
						/>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="rpass"
								>Password</label
							>
							<input
								id="rpass"
								type="password"
								placeholder="Create Password"
								class="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="crpass"
								>Confirm Password</label
							>
							<input
								id="crpass"
								type="password"
								placeholder="Confirm Password"
								class="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
							/>
						</div>
					</div>
					<button
						type="submit"
						class="w-full rounded-md bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
						>Register</button
					>
				</form>
				<p class="text-center text-sm text-gray-600 dark:text-gray-300">
					Already have an account?
					<button
						type="button"
						on:click={toggleForm}
						class="text-green-600 hover:underline dark:text-green-400">Login here</button
					>
				</p>
			</div>
		</div>
	</div>

	<!-- Mobile View -->
	<div class="block w-full max-w-lg rounded-lg bg-white p-6 shadow-xl md:hidden dark:bg-gray-800">
		<h3 class="text-center text-2xl font-bold text-green-700 dark:text-green-400">
			{isRegister ? 'Create Your Account' : 'Login to Your Account'}
		</h3>

		<form class="mt-6 space-y-4">
			{#if isRegister}
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="fname"
						>Full Name</label
					>
					<input
						id="fname"
						type="text"
						placeholder="Your Full Name"
						class="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="pip"
						>Prototype IP</label
					>
					<input
						id="pip"
						type="text"
						placeholder="Your Prototype ID"
						class="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
					/>
				</div>
			{/if}

			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="remail"
					>Email</label
				>
				<input
					id="remail"
					type="email"
					placeholder="Your Email"
					class="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="rpass"
					>Password</label
				>
				<input
					id="rpass"
					type="password"
					placeholder="Your Password"
					class="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
				/>
			</div>

			<button
				type="submit"
				class="w-full rounded-md bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
			>
				{isRegister ? 'Register' : 'Log In'}
			</button>
		</form>
	</div>
</section>
<Footer />
