<script lang="ts">
	export let showTutorial;
	export let toggleTutorial;

	let currentStep = 0;

	const tutorialSteps = [
		{
			gif: '/gif/spray.gif',
			title: 'How to Use the Setup Spray',
			desc: 'The Setup Spray allows you to configure which sprays are applied in each of the four available slots. You can choose from recommended sprays or define your own custom ones. Each slot can also be individually enabled or disabled as needed.',
			steps: [
				'Click the "Setup Spray" button on the main interface.',
				'Assign a spray name to each of the four slots (either by selecting a recommended spray or entering a custom name).',
				'Use the toggle switch to enable or disable individual spray slots.',
				'Click "Save" to apply your spray configuration.'
			]
		},
		{
			gif: '/gif/models.gif',
			title: 'Selecting a Model',
			desc: 'Below the "Setup Spray" button, you’ll find three dropdowns that allow you to select different versions of machine learning models used for plant analysis. Each dropdown corresponds to a specific model type:',
			steps: [
				'Use the first dropdown labeled "PlantOD" to select a version of the Plant Object Detection model.',
				'Use the second dropdown labeled "StageCLS" to choose a Stage Classification model.',
				'Use the third dropdown labeled "DiseaseSeg" to pick a Disease Segmentation model.',
				'Click on any dropdown to view and select the model version you prefer.',
				'⚠️ If you change a model version, a confirmation dialog will appear. Confirming will reset your configured plant setup.'
			]
		},
		{
			gif: '/gif/compare.gif',
			title: 'Compare Models',
			desc: 'The "Compare Model" button allows you to compare different models and their respective versions to assess their performance. The comparison includes key metrics such as mAP50, mAP50_95, accuracy, recall, and precision. This helps you understand the differences between models and versions.',
			steps: [
				'Click the "Compare Model" button to initiate the comparison.',
				'The system will display the comparison between the three models and their respective versions.',
				'You’ll be able to view performance metrics like mAP50, mAP50_95, accuracy, recall, and precision for each model.'
			]
		},
		{
			gif: '/gif/schedule.gif',
			title: 'How to Use Set Schedule',
			desc: 'The "Set Schedule" feature allows you to automate when the robot should operate based on your selected days, time, and interval. You can toggle specific days of the week, choose how frequently it runs, and set the exact time for the task to begin.',
			steps: [
				'Click the "Set Schedule" button.',
				'Toggle the days of the week you want the robot to run (e.g., Monday, Wednesday, Sunday).',
				'Select an interval: options include every week, every 2 weeks, or every 3 weeks.',
				'Set the exact time you want the schedule to start (e.g., 6:30 AM).',
				'Once configured, the robot will automatically operate on the selected days, at the chosen interval and time.'
			]
		},
		{
			gif: '/gif/scan.gif',
			title: 'How to Use the Scanner',
			desc: 'The Scanner lets you detect plants in real-time using camera. After scanning, you can modify each detected plant and assign treatments using the sprays you’ve configured in the Setup Spray section.',
			steps: [
				'Click the "Start Scan" button to activate the camera.',
				'Once the camera opens, you will see resolution and FPS details displayed on screen.',
				'The scanner will automatically detect plants and add them to your "Scanned Plants" list.',
				'Click the "Stop Scan" button to turn off the camera.',
				'Now, go to the scanned plant entry (e.g., Lettuce) and begin modifying its properties.',
				'If a disease is detected or known (e.g., Bacterial), bind it to one or more sprays you set earlier (e.g., Spray 1, Spray 2).'
			]
		},
		{
			gif: '/gif/config.gif',
			title: 'Saving Your Configuration',
			desc: 'This button finalizes and stores all the settings you’ve configured — including sprays, schedules, model selections, and plant bindings — so the robot knows exactly how to operate based on your setup.',
			steps: [
				'Click the "Save Configuration" button.',
				'All configured data (sprays, schedules, model versions, and scanned plant bindings) will be saved.',
				'You’re done! The robot will now follow your saved setup during operation.'
			]
		}
	];

	function goToStep(index: number) {
		currentStep = index;
	}
</script>

{#if showTutorial}
	<div
		class="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm"
		style="z-index: 9999;"
	>
		<div
			class="relative w-full max-w-10/12 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-5 pt-8 shadow-2xl dark:from-gray-900 dark:to-gray-800"
		>
			<div
				class="absolute -top-10 left-0 z-50 w-max rounded-t-xl bg-green-600 px-6 py-2 font-bold text-white shadow-lg dark:bg-green-500"
			>
				AGRIBOT Setup Page Guide
			</div>

			<button
				class="absolute top-4 right-4 text-2xl text-gray-400 transition hover:text-red-500 focus:outline-none"
				on:click={toggleTutorial}
			>
				&times;
			</button>

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
				<div
					class="flex items-center justify-center rounded-lg bg-green-100 p-4 shadow-inner dark:bg-gray-800"
				>
					<img
						src={tutorialSteps[currentStep].gif}
						alt={`Tutorial Step ${currentStep + 1}`}
						class="w-full rounded-xl object-contain shadow-lg ring-2 ring-green-500"
					/>
				</div>

				<div
					class="flex flex-col items-start justify-start text-left text-[15px] text-gray-800 dark:text-gray-200"
				>
					<h3 class="mb-4 text-2xl font-bold text-green-700 dark:text-green-300">
						{tutorialSteps[currentStep].title}
					</h3>

					<p class="mb-5 text-base leading-relaxed font-medium">
						{tutorialSteps[currentStep].desc}
					</p>

					<h4 class="mb-2 text-lg font-semibold text-green-600 dark:text-green-400">
						Step-by-Step Instructions
					</h4>

					<ol
						class="list-inside list-decimal space-y-2 rounded-2xl bg-gray-900 p-5 pl-4 text-base leading-relaxed"
					>
						{#each tutorialSteps[currentStep].steps as step}
							<li>{step}</li>
						{/each}
					</ol>
				</div>
			</div>

			<!-- Step Numbers -->
			<div class="mt-8 flex justify-center gap-4">
				{#each tutorialSteps as _, index}
					<button
						class={`rounded-full px-4 py-2 text-sm font-semibold shadow transition-all duration-300
							${
								currentStep === index
									? 'bg-green-600 text-white ring-green-400 ring-offset-2'
									: 'bg-white text-green-700 hover:bg-green-500 hover:text-white dark:bg-gray-700 dark:text-white dark:hover:bg-green-600'
							}`}
						on:click={() => goToStep(index)}
					>
						{index + 1}
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}
