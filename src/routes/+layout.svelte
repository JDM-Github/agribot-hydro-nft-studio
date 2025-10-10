<script	lang="ts">
/**
 * @file +layout.svelte
 * @description	Root layout	component for the AGRIBOT application.
 *  			Handles	global navigation, toast notifications,	and	robot connection
 *  			status monitoring. Provides	context	for	child routes.
 * 
 * @props
 *   - data: Layout	data object	(title,	description, user info,	dark mode, etc.).
 *   - children: Render	function for nested	routes.
 * 
 * @imports
 *   - app.css:	Global stylesheet for the application.
 *   - Navigation: Top navigation component.
 *   - Toast: Global toast notification	container.
 *   - addToast: Store action for displaying toast messages.
 *   - isConnected,	isRobotRunning,	isLivestreaming, isScanning, resetVariable:
 *  	 Connection	state stores and reset function.
 *   - RequestHandler: Utility for authenticated API requests.
 *   - onMount,	onDestroy: Svelte lifecycle	functions.
 * 
 * @localState
 *   - statusInterval: Interval	handler	for	polling	robot status.
 * 
 * @functions
 *   - fetchRobotStatus: Periodically checks robot status via API and updates stores.
 * 
 * @lifecycle
 *   - onMount:	Starts polling for robot status	every 3s.
 *   - onDestroy: Clears polling interval on component teardown.
 * 
 * @author		AGRIBOT	Team
 * @created		2025-09-22
 * @lastUpdated	2025-09-22
 */

// ----------------------------
// Imports
// ----------------------------
import '$root/app.css';

// Svelte lifecycle
import { onMount, onDestroy	} from 'svelte';
import { v4 as uuidv4 }	from 'uuid';

// Components
import Navigation from '$components/Navigation.svelte';
import Toast from '$components/ToastContainer.svelte';

// Stores
import { addToast, removeToast } from '$stores/toast';
import {
	// isConnected,
	deviceID,
	userData,
	needSync,
	syncNeededItems
} from '$stores/connection';

// Utils
import RequestHandler from '$utils/request';
import { saveToDB }	from '$root/lib/utils/indexdb.js';
import { afterNavigate, beforeNavigate } from '$app/navigation';
import { SocketService } from '$root/lib/socket.js';
import { all_pages } from '$root/lib/all_page.js';

// ----------------------------
// Props
// ----------------------------
export let data;

// $: plantHistory = Connection.getLatestPlantHistories();
// $: if ($plantHistory.length) {
// 	let newPlantHistories: PlantHistories = [];
// 	$plantHistory.forEach((plant: PlantHistory) => {
// 		const newPlant = {
// 			id: Date.now(),
// 			src: plant.src,
// 			timestamp: plant.timestamp,
// 			plantName: plant.plantName,
// 			plantHealth: plant.plantHealth,
// 			imageSize: plant.imageSize,
// 			locationOnCapture: plant.locationOnCapture,
// 			generatedDescription: plant.generatedDescription
// 		};
// 		newPlantHistories = [newPlant, ...newPlantHistories].slice(0, 6);
// 	});
// 	plantHistories.set(newPlantHistories);
// }

// ----------------------------
// Local State
// ----------------------------
let	syncInterval: any;
// let	statusInterval:	any;


// ----------------------------
// Methods
// ----------------------------
/**
 * Fetch the latest	robot status from backend and update stores.
 */
// +
// const checkSyncFlags	= async	() => {
//	   try {
//		   const response =	await RequestHandler.fetchData('POST', 'user/check-update-flags', {
//			   id: $userData?.user.id,
//			   deviceID: $deviceID
//		   });

//		   if (response.success	&& response.needsSync) {
//			   needSync.set(true);
//			   syncNeededItems.set(response.updateNeeded || []);
//		   } else {
//			   needSync.set(false);
//			   syncNeededItems.set([]);
//		   }
//	   } catch (err) {
//		   console.error('Failed to check sync flags:',	err);
//	   }
// };

function openDB() {
	return new Promise((resolve, reject) => {
		const request =	indexedDB.open('myAppDB', 1);

		request.onupgradeneeded	= (event: any) => {
			const db = event.target.result;
			if (!db.objectStoreNames.contains('settings')) {
			db.createObjectStore('settings', { keyPath:	'key' });
			}
		};
		request.onsuccess =	(event:	any) => resolve(event.target.result);
		request.onerror	= (event: any) => reject(event.target.error);
	});
}

async function getDeviceID() {
	const db: any =	await openDB();
	const transaction =	db.transaction('settings', 'readwrite');
	const store	= transaction.objectStore('settings');

	return new Promise((resolve, reject) => {
		const getRequest = store.get('deviceID');
		getRequest.onsuccess = () => {
			if (getRequest.result) {
				resolve(getRequest.result.value);
			} else {
				const newID	= uuidv4();
				store.put({	key: 'deviceID', value:	newID });
				resolve(newID);
			}
		};
		getRequest.onerror = (e: any) => reject(e);
	});
}

async function getUserData() {
	const db: any =	await openDB();
	const transaction =	db.transaction('settings', 'readwrite');
	const store	= transaction.objectStore('settings');

	return new Promise((resolve, reject) => {
		const getRequest = store.get('userData');
		getRequest.onsuccess = () => {
			if (getRequest.result) {
				resolve(getRequest.result.value);
			} else {
				resolve({});
			}
		};
		getRequest.onerror = (e: any) => reject(e);
	});
}

const syncData = async (force =	false) => {
	const toastId =	addToast(force ? 'Force	syncing	data...' : 'Syncing	data...', 'loading');
	try	{
		const res =	await fetch('/api/sync', {
			method:	'POST',
			headers: {
				'Content-Type':	'application/json'
			},
			body: JSON.stringify({
				force: force,
				deviceID: $deviceID,
				userData: $userData
			}),
			credentials: 'same-origin'
		});
		const response = await res.json();
		removeToast(toastId);
		if (res.ok && response.success)	{
			await saveToDB('userData', response.data);
			addToast('Sync successful!', 'success',	3000);
		} else {
			addToast('Syncing error.', 'error',	3000);
		}
	} catch	(error)	{
		removeToast(toastId);
		console.error('Sync	error:', error);
		addToast(`An unexpected	error occurred.	${error}`, 'error',	3000);
	}
	try	{
		const response = await RequestHandler.fetchData('POST',	'user/check-update-flags', {
			id:	$userData?.user.id,
			deviceID: $deviceID
		});
		if (response.success && response.needsSync)	{
			needSync.set(true);
			syncNeededItems.set(response.updateNeeded || []);
		} else {
			needSync.set(false);
			syncNeededItems.set([]);
		}
	} catch	(err) {
		console.error('Failed to check sync	flags:', err);
	}
};

beforeNavigate(() => {
	if (SocketService.isConnected()) {
		SocketService.emit("page_leave", {id: SocketService.id()});
	}
});

afterNavigate(({ to }) => {
	if (SocketService.isConnected()) {
		const pageKey = all_pages[to!.url.pathname];
		if (pageKey) {
			SocketService.emit("page_enter", {id: SocketService.id(), page: pageKey});
		}
	}
});

// ----------------------------
// Lifecycle
// ----------------------------
onMount(async () => {
	try	{
		deviceID.set((await	getDeviceID()) as string);
		userData.set(await getUserData());
		// alert(JSON.stringify($userData));
		console.log($userData);	
	} catch	(err) {
		console.error('Failed to get device	ID:', err);
	}
	// checkSyncFlags();
	// syncInterval	= setInterval(checkSyncFlags, 5	* 60 * 1000);
});

onDestroy(() => {
	// clearInterval(syncInterval);
});
</script>


<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description}	/>
</svelte:head>

<svelte:body class:dark={data.isDarkMode} />

<Toast />

<main class="bg-white pt-16	dark:bg-gray-800">
	<Navigation	user={data.user} />
	<!-- {@render children()} -->
	<slot/>
</main>
