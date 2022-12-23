import App from './App.svelte';
import { preloadCID } from './utils/ipfs';

// Setup app:
const app = new App({
	target: document.body,
	props: { }
});

// Preload CIDs from IPFS:
["QmTuGMphQyvHYYNjN2A4V6FfekLRaDqZjPjAvE72hTUoL3"].map(preloadCID);

export default app;