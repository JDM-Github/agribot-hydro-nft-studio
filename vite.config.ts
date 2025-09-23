import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		hmr: false,
		watch: {
			usePolling: false 
		}
	},
	resolve: {
		alias: {
			$root: path.resolve('./src/'),
			$lib: path.resolve('./src/lib'),
			$stores: path.resolve('./src/lib/stores'),
			$helpers: path.resolve('./src/lib/helpers'),
			$utils: path.resolve('./src/lib/utils'),
			$modal: path.resolve('./src/lib/modal'),
			$components: path.resolve('./src/lib/components'),
			$routes: path.resolve('./src/routes'),
			$class: path.resolve('./src/lib/class'),
			$constant: path.resolve('./src/lib/constant'),
			$services: path.resolve('./src/lib/services'),
			$types: path.resolve('./src/lib/types')
		}
	}
});
