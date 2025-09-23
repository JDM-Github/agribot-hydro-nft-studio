import { currentLink, robotName } from '$lib/stores/connection';
import { get } from 'svelte/store';

export default class RequestHandler {
	static development = import.meta.env.VITE_MODE === 'development';
	static baseURL = RequestHandler.development
        ? 'http://localhost:8888'
        : 'https://agribot-hydro-nft-admin.netlify.app';
	static apiLink = '.netlify/functions/api';

	static async customFetch(
		link: string,
		method: string = 'GET',
		body: any = {},
		baseLink: string | null = get(currentLink),
		token: string | null = null,
		newFetch: any = null
	) {
		if (!baseLink) return [false, { error: 'No base link provided' }];
		if (!link) return [false, { error: 'No endpoint provided' }];

		const headers: Record<string, string> = {};
		if (!(body instanceof FormData)) {
			headers['Content-Type'] = 'application/json';
		}
		if (token) headers.Authorization = `Bearer ${token}`;

		const options: RequestInit = { method, headers };
		if (method !== 'GET' && body) {
			options.body = body instanceof FormData ? body : JSON.stringify(body);
		}
		try {
			let response;
			if (newFetch) {
				response = await newFetch(`${baseLink}/${link}`, options);
			} else {
				response = await fetch(`${baseLink}/${link}`, options);
			}
			const data = await response.json().catch(() => ({}));
			return [response.ok, data];
		} catch (error) {
			return [false, { error: String(error) }];
		}
	}


	static async authFetch(
		link: string,
		method: string = 'GET',
		body: Record<string, any> = {},
		baseLink: string | null = get(currentLink),
		newFetch: any = null
	) {
		const robotN = get(robotName);
		if (!robotN) {
			return [false, { error: 'Invalid token provided.' }];
		}
		return this.customFetch(link, method, body, baseLink, robotN, newFetch);
	}

	static async normalFetch(
		link: string,
		method: string = 'GET',
		body: Record<string, any> = {},
		baseLink: string | null = get(currentLink)
	) {
		return this.customFetch(link, method, body, baseLink, null);
	}

	static async fetchData(
		method: string,
		link: string,
		requestData: Record<string, any> | FormData = {},
		headers: Record<string, string> = {},
		callback: ((error: string | null, data?: any) => void) | null = null
	) {
		let url = `${RequestHandler.baseURL}/${RequestHandler.apiLink}/${link}`;

		const options: RequestInit = {
			method: method.toUpperCase()
		};

		const isClient = typeof window !== 'undefined';
		const token = isClient ? localStorage.getItem('authToken') : null;

		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const isFormData = requestData instanceof FormData;

		if (!isFormData) {
			options.headers = {
				'Content-Type': 'application/json',
				...headers
			};
			if (method.toLowerCase() !== 'get' && method.toLowerCase() !== 'head') {
				options.body = JSON.stringify(requestData);
			}
		} else {
			options.body = requestData;
		}

		try {
			const response = await fetch(url, options);
			const responseData = await response.json();

			if (!response.ok) {
				throw new Error(responseData.message || `HTTP error! Status: ${response.status}`);
			}

			if (callback) callback(null, responseData);
			return responseData;
		} catch (error: any) {
			console.error('Fetch error:', error);
			if (callback)
				callback(error.message || 'Something went wrong. Please try again later.', undefined);
			return {
				success: false,
				message: error.message || 'An error occurred',
				baseURL: RequestHandler.baseURL,
				url
			};
		}
	}
}
function $store(arg0: string) {
	throw new Error('Function not implemented.');
}

