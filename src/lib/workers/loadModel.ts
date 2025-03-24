self.onmessage = async (event: MessageEvent) => {
	const { modelPath, action } = event.data;

	if (action === 'loadModel') {
		try {
			console.log('Loading model:', modelPath);

			const cachedBlobResponse: Response | undefined = await caches.match(modelPath);
			if (cachedBlobResponse) {
				console.log('Model found in cache');
				const cachedBlob = await cachedBlobResponse.blob(); 
				self.postMessage({ modelBlobUrls: URL.createObjectURL(cachedBlob) });
			} else {
				console.log('Model not found in cache, fetching from network');

				const response = await fetch(modelPath);

				if (!response.ok) {
					console.error('Failed to fetch model:', response.status, response.statusText);
					throw new Error(`Network fetch failed with status: ${response.status}`);
				}

				const blob = await response.blob();
				console.log('Model fetched, caching it now');

				const cache = await caches.open('model-cache');
				cache.put(modelPath, new Response(blob));

				self.postMessage({ modelBlobUrls: URL.createObjectURL(blob) });
			}
		} catch (error) {
			console.error('Error loading model:', error);
			self.postMessage({ error: 'Failed to load model' });
		}
	}
};
