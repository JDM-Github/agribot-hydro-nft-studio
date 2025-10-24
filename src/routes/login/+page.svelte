<script lang="ts">
	import { goto } from '$app/navigation';
	import Footer from '$lib/components/Footer.svelte';
	import EmailVerification from '$lib/modal/EmailVerification.svelte';
	import TermsAndCondition from '$lib/modal/TermsAndCondition.svelte';
	import { addToast, removeToast } from '$lib/stores/toast';
	import { Eye, EyeOff } from 'lucide-svelte';
	import Loginform from './loginform.svelte';
	import RequestHandler from '$root/lib/utils/request';
	import { deviceID, userData } from '$root/lib/stores/connection';
	import { writable } from 'svelte/store';
	import { saveToDB } from '$root/lib/utils/indexdb';

	let openTerms = false;
	let isRegister = false;
	function toggleForm() {
		isRegister = !isRegister;
	}
	let fullName = '';
	let prototypeIP = '';
	let email = '';
	let password = '';
	let confirmPassword = '';

	let showVerification = false;
	let showPassword = false;
	let showConfirmPassword = false;

	let isEmailSend = writable(false);

	const registerSubmit = async (e: Event) => {
		e.preventDefault();
		if (!fullName || !prototypeIP || !email || !password || !confirmPassword) {
			addToast('Please fill out all fields.', 'error', 3000);
			return;
		}

		if (!acceptedTerms) {
			addToast('You must accept the Terms & Conditions.', 'error', 3000);
			return;
		}

		if (password !== confirmPassword) {
			addToast('Passwords do not match.', 'error', 3000);
			return;
		}
		const strongPasswordRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
		if (!strongPasswordRegex.test(password)) {
			addToast(
				'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
				'error',
				5000
			);
			return;
		}
		const toastId = addToast('Sending verification code...', 'loading');
		try {
			const response = await RequestHandler.fetchData('POST', `user/send-code`, {
				email,
				fullName: fullName,
				prototypeID: prototypeIP,
				deviceID: $deviceID
			});
			removeToast(toastId);
			if (response.success) {
				showVerification = true;
				$isEmailSend = true;
				addToast(`Verification code sent to ${email}`, 'success', 2000);
			} else {
				addToast(response.message || 'Failed to send verification code.', 'error', 3000);
			}
		} catch (err) {
			removeToast(toastId);
			console.error('An unexpected error occurred:', err);
			addToast(`An unexpected error occurred: ${err}`, 'error', 3000);
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
					password,
					deviceID: $deviceID,
					userData: $userData
				}),
				credentials: 'same-origin'
			});
			const response = await res.json();
			if (res.ok && response.success) {
				removeToast(toastId);
				await saveToDB('userData', response.data);
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
	let acceptedTerms = false;
</script>

<svelte:head>
	<script src="https://js.hcaptcha.com/1/api.js" async defer></script>
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
					{!isRegister ? `Welcome Back!` : 'Join Our Research Project'}
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
							<div class="relative">
								<input
									id="rpass"
									type={showPassword ? 'text' : 'password'}
									placeholder="Create Password"
									bind:value={password}
									class="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
								/>
								<button
									type="button"
									class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-green-600 dark:hover:text-green-400"
									on:click={() => (showPassword = !showPassword)}
								>
									{#if showPassword}
										<EyeOff class="h-5 w-5" />
									{:else}
										<Eye class="h-5 w-5" />
									{/if}
								</button>
							</div>
						</div>

						<div>
							<label
								class="block text-sm font-medium text-gray-700 dark:text-gray-300"
								for="crpass"
							>
								Confirm Password
							</label>
							<div class="relative">
								<input
									id="crpass"
									type={showConfirmPassword ? 'text' : 'password'}
									placeholder="Confirm Password"
									bind:value={confirmPassword}
									class="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
								/>
								<button
									type="button"
									class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-green-600 dark:hover:text-green-400"
									on:click={() => (showConfirmPassword = !showConfirmPassword)}
								>
									{#if showConfirmPassword}
										<EyeOff class="h-5 w-5" />
									{:else}
										<Eye class="h-5 w-5" />
									{/if}
								</button>
							</div>
						</div>
					</div>

					<div class="flex items-start gap-2">
						<input
							id="terms"
							type="checkbox"
							bind:checked={acceptedTerms}
							class="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
						/>
						<label for="terms" class="text-sm text-gray-600 dark:text-gray-300">
							I agree to the
							<button
								type="button"
								on:click={() => (openTerms = true)}
								class="text-green-600 hover:underline dark:text-green-400"
							>
								Terms & Conditions
							</button>
						</label>
					</div>

					{#if $isEmailSend}
						<button
							type="button"
							class="w-full rounded-md bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
							on:click={() => (showVerification = true)}
						>
							Verify Email
						</button>
					{/if}

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

	<div class="block w-full max-w-lg rounded-lg bg-white p-6 shadow-xl md:hidden dark:bg-gray-800">
		<h3 class="text-center text-2xl font-bold text-green-700 dark:text-green-400">
			{isRegister ? 'Create Your Account' : 'Login to Your Account'}
		</h3>

		<form
			class="mt-6 space-y-4"
			on:submit={isRegister ? registerSubmit : loginSubmit}
			method="POST"
		>
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
			{#if $isEmailSend}
				<button
					type="button"
					class="w-full rounded-md bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
					on:click={() => (showVerification = true)}
				>
					Verify Email
				</button>
			{/if}
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

{#if openTerms}
	<TermsAndCondition closeTerms={() => (openTerms = false)} />
{/if}

{#if showVerification}
	<EmailVerification
		{email}
		onClose={() => (showVerification = false)}
		onVerified={async () => {
			showVerification = false;
			$isEmailSend = false;
			const toastId = addToast('Trying to register...', 'loading');
			try {
				const response = await RequestHandler.fetchData('POST', `user/create`, {
					prototypeID: prototypeIP,
					fullName: fullName,
					email: email,
					password: password,
					deviceID: $deviceID
				});
				removeToast(toastId);
				if (response.success) {
					toggleForm();
					addToast('Registration successful! Please log in.', 'success', 2000);
				} else {
					addToast(response.message || 'Registration failed. Please try again.', 'error', 3000);
				}
			} catch (err) {
				removeToast(toastId);
				console.error('Registration error:', err);
				addToast(`An unexpected error occurred: ${err}`, 'error', 3000);
			}
		}}
	/>
{/if}
