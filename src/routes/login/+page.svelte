<script lang="ts">
	import { goto } from '$app/navigation';
	import Footer from '$lib/components/Footer.svelte';
	import { addToast, removeToast } from '$lib/stores/toast';
	import RequestHandler from '$lib/utils/request';
	import Loginform from './loginform.svelte';

	let isRegister = false;
	function toggleForm() {
		isRegister = !isRegister;
	}
	let fullName = '';
	let prototypeIP = '';
	let email = '';
	let password = '';
	let confirmPassword = '';

	const registerSubmit = async (e: Event) => {
		e.preventDefault();
		const toastId = addToast('Creating account...', 'loading');
		try {
			const response = await RequestHandler.fetchData('post', 'user/create', {
				fullName,
				prototypeIP,
				email,
				password,
				confirmPassword
			});
			if (response.success) {
				removeToast(toastId);
				addToast('Registered successfully!', 'success', 3000);
				fullName = '';
				prototypeIP = '';
				email = '';
			} else {
				removeToast(toastId);
				addToast(response.message || 'Registration failed.', 'error', 3000);
			}
			password = '';
			confirmPassword = '';
		} catch (error) {
			console.error('Registration error:', error);
			removeToast(toastId);
			addToast('An unexpected error occurred.', 'error', 3000);
		}
	};

	const loginSubmit = async (event: Event) => {
		event.preventDefault();

		const toastId = addToast('Trying to login...', 'loading');
		try {
			const res = await fetch('/api/user/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					type: 'login',
					email,
					password
				}),
				credentials: 'same-origin'
			});
			const response = await res.json();
			if (res.ok && response.success) {
				localStorage.setItem('userConfig', JSON.stringify(response.config));
				removeToast(toastId);
				addToast('Login successful!', 'success', 3000);
				await goto('/', { invalidateAll: true });
			} else {
				removeToast(toastId);
				addToast('Invalid email or password.', 'error', 3000);
			}
		} catch (error) {
			removeToast(toastId);
			console.error('Registration error:', error);
			addToast('An unexpected error occurred.', 'error', 3000);
		}
	};
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
			<Loginform {toggleForm} {isRegister} />

			<div
				class={`absolute inset-0 flex w-1/2 flex-col justify-center space-y-6 bg-white p-12 transition-transform duration-700 ease-in-out dark:bg-gray-800 ${isRegister ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0'}`}
			>
				<h3 class="text-3xl font-bold text-green-700 dark:text-green-400">Create Your Account</h3>
				<form class="space-y-4" on:submit={registerSubmit}>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="fname">
							Full Name
						</label>
						<input
							id="fname"
							type="text"
							placeholder="Your Full Name"
							bind:value={fullName}
							class="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="pip">
							Prototype IP
						</label>
						<input
							id="pip"
							type="text"
							placeholder="Your Prototype ID"
							bind:value={prototypeIP}
							class="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="remail">
							Email
						</label>
						<input
							id="remail"
							type="email"
							placeholder="Your Email"
							bind:value={email}
							class="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
						/>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="rpass">
								Password
							</label>
							<input
								id="rpass"
								type="password"
								placeholder="Create Password"
								bind:value={password}
								class="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
							/>
						</div>

						<div>
							<label
								class="block text-sm font-medium text-gray-700 dark:text-gray-300"
								for="crpass"
							>
								Confirm Password
							</label>
							<input
								id="crpass"
								type="password"
								placeholder="Confirm Password"
								bind:value={confirmPassword}
								class="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
							/>
						</div>
					</div>

					<button
						type="submit"
						class="w-full rounded-md bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
					>
						Register
					</button>
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

		<form class="mt-6 space-y-4" on:submit={(isRegister) ? registerSubmit : loginSubmit} method="POST">
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
					bind:value={email}
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
					bind:value={password}
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
