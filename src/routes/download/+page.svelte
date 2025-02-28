<script lang="ts">
	import { queries } from '$data/api';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	import { createQuery } from '@tanstack/svelte-query';

	import manager_screenshot from '$images/manager.png?format=avif;webp;png&picture';

	import Meta from '$lib/components/Meta.svelte';
	import { JsonLd } from 'svelte-meta-tags';
	import Query from '$lib/components/Query.svelte';
	import Button from '$lib/components/Button.svelte';
	import Footer from '$layout/Footer/FooterHost.svelte';
	import Picture from '$lib/components/Picture.svelte';
	import Dialogue from '$lib/components/Dialogue.svelte';
	import { onMount } from 'svelte';

	const query = createQuery(['manager'], queries.manager);

	let warning: string;
	let warningDialogue = false;

	let userAgent: string;
	let isAndroid: boolean;
	let androidVersionMatch: RegExpExecArray | null;
	let androidVersion: number;

	onMount(() => {
		userAgent = navigator.userAgent;
		androidVersionMatch = /Android\s([\d.]+)/i.exec(userAgent);
		androidVersion = androidVersionMatch ? parseInt(androidVersionMatch[1]) : 0;
		isAndroid = !!androidVersion;
	});

	function handleClick() {
		if (!isAndroid) {
			warning = 'Your device is not running Android.';
			warningDialogue = true;
		} else if (androidVersion < 8) {
			warning = `Your device is running ${androidVersion}. ReVanced only supports Android versions 8 and above.`;
			warningDialogue = true;
		}
	}
</script>

<Meta title="Download" />
<JsonLd
	schema={{
		'@type': 'MobileApplication',
		name: 'ReVanced Manager',
		description:
			'ReVanced Manager is an Android application that uses ReVanced Patcher to add, remove, and modify existing functionalities in Android applications',
		abstract: 'Continuing the legacy of Vanced',
		applicationCategory: 'UtilitiesApplication',
		applicationSuite: 'ReVanced',
		downloadUrl: 'https://revanced.app/download',
		maintainer: 'ReVanced',
		operatingSystem: 'Android 8',
		offers: {
			'@type': 'Offer',
			price: '0'
		},
		publisher: {
			'@type': 'Organization',
			name: 'ReVanced',
			url: 'https://revanced.app/',
			logo: {
				'@type': 'ImageObject',
				url: 'https://revanced.app/embed.png'
			},
			sameAs: [
				'https://github.com/revanced',
				'https://twitter.com/revancedapp',
				'https://revanced.app/discord',
				'https://www.reddit.com/r/revancedapp',
				'https://t.me/app_revanced',
				'https://www.youtube.com/@ReVanced'
			]
		}
	}}
/>

<Dialogue bind:modalOpen={warningDialogue}>
	<svelte:fragment slot="title">Warning</svelte:fragment>
	<svelte:fragment slot="description">{warning} Do you still want to download?</svelte:fragment>
	<svelte:fragment slot="buttons">
		<Query {query} let:data>
			<Button
				type="text"
				href={data.assets[0].browser_download_url}
				download
				on:click={() => (warningDialogue = false)}>Okay</Button
			>
		</Query>
		<Button type="text" on:click={() => (warningDialogue = false)}>Cancel</Button>
	</svelte:fragment>
</Dialogue>

<div class="wrapper center" in:fly={{ y: 10, easing: quintOut, duration: 750 }}>
	<h2>ReVanced <span>Manager</span></h2>
	<p>Patch your favourite apps, right on your device.</p>
	<div class="buttons">
		<Query {query} let:data>
			{#if !isAndroid || androidVersion < 8}
				<Button on:click={handleClick} type="filled" icon="download">
					{data.metadata.tag_name}
				</Button>
			{:else}
				<Button
					on:click={handleClick}
					type="filled"
					icon="download"
					href={data.assets[0].browser_download_url}
					download
				>
					{data.metadata.tag_name}
				</Button>
			{/if}
		</Query>
		<Button type="tonal" href="https://github.com/revanced/revanced-manager" target="_blank">
			View Source
		</Button>
	</div>
	<div class="screenshot">
		<Picture data={manager_screenshot} alt="Manager Screenshot" />
	</div>
</div>

<Footer />

<style>
	.center {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	h2 {
		text-align: center;
		color: var(--white);
	}

	p {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.screenshot :global(img) {
		margin-top: 2.5rem;
		margin-bottom: 2.5rem;
		height: 50rem;
		width: auto;
		padding: 0.5rem 0.5rem;
		border-radius: 2rem;
		background-color: var(--grey-six);
		user-select: none;
	}

	.buttons {
		display: flex;
		gap: 1rem;
	}

	span {
		color: var(--accent-color);
	}
</style>
