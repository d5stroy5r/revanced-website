import { readable, writable } from 'svelte/store';
import { is_logged_in, get_access_token } from './auth';
import { browser } from '$app/environment';

type AdminLoginInfo =
	| {
			logged_in: true;
			expires: number;
			logged_in_previously: boolean;
	  }
	| {
			logged_in: false;
			expires: undefined;
			logged_in_previously: boolean;
	  };

const admin_login_info = (): AdminLoginInfo => {
	if (is_logged_in())
		return {
			logged_in: true,
			expires: get_access_token()!.expires,
			logged_in_previously: !!get_access_token()?.token
		};
	else
		return {
			logged_in: false,
			expires: undefined,
			logged_in_previously: !!get_access_token()?.token
		};
};

export const admin_login = readable<AdminLoginInfo>(admin_login_info(), (set) => {
	const checkLoginStatus = () => set(admin_login_info());

	checkLoginStatus();

	const interval = setInterval(checkLoginStatus, 100);
	return () => clearInterval(interval);
});

export const read_announcements = writable<Set<number>>(new Set(), (set) => {
	if (!browser) return;

	const key = 'read_announcements';
	const data = localStorage.getItem(key);
	const parsedArray = data ? JSON.parse(data) : [];
	const currentState = new Set(parsedArray);

	const updateStoreState = () => {
		set(currentState);
	};

	const handleLocalStorageUpdate = (e: StorageEvent) => {
		if (e.key === key) updateStoreState();
	};

	window.addEventListener('storage', handleLocalStorageUpdate);
	updateStoreState();

	return () => {
		window.removeEventListener('storage', handleLocalStorageUpdate);
		localStorage.setItem(key, JSON.stringify(Array.from(currentState)));
	};
});

read_announcements.subscribe((value) => {
	if (!browser) return;

	localStorage.setItem('read_announcements', JSON.stringify(Array.from(value)));
});

export const passed_login_with_creds = writable(false); // will only change when the user INPUTS the credentials, not if the session is just valid

export const allowAnalytics = writable(false);
