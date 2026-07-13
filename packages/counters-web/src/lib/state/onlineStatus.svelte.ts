/**
 * Wraps navigator.onLine + the online/offline window events in a rune so
 * OfflineBanner (or anything else) can react to connectivity changes.
 * Guarded for SSR/prerendering, where neither navigator nor window exist.
 */
function createOnlineStatus() {
	let online = $state(typeof navigator === 'undefined' ? true : navigator.onLine);

	if (typeof window !== 'undefined') {
		window.addEventListener('online', () => {
			online = true;
		});
		window.addEventListener('offline', () => {
			online = false;
		});
	}

	return {
		get online() {
			return online;
		}
	};
}

export const onlineStatus = createOnlineStatus();
