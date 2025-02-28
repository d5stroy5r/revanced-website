<script lang="ts">
	import { building } from '$app/environment';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { derived, readable, type Readable } from 'svelte/store';
	import { page } from '$app/stores';

	import type { Patch } from '$lib/types';

	import { createQuery } from '@tanstack/svelte-query';
	import { queries } from '$data/api';

	import { JsonLd } from 'svelte-meta-tags';
	import Meta from '$lib/components/Meta.svelte';
	import PackageMenu from './PackageMenu.svelte';
	import Package from './Package.svelte';
	import PatchItem from './PatchItem.svelte';
	import Footer from '$layout/Footer/FooterHost.svelte';
	import Search from '$lib/components/Search.svelte';
	import FilterChip from '$lib/components/FilterChip.svelte';
	import Dialogue from '$lib/components/Dialogue.svelte';
	import Query from '$lib/components/Query.svelte';

	const query = createQuery(['patches'], queries.patches);

	let searchParams: Readable<URLSearchParams>;
	if (building) {
		searchParams = readable(new URLSearchParams());
	} else {
		searchParams = derived(page, ($page) => $page.url.searchParams);
	}

	$: selectedPkg = $searchParams.get('pkg');
	let searchTerm = $searchParams.get('s');
	let searchTermFiltered = searchTerm
		?.replace(/\./g, '')
		.replace(/\s/g, '')
		.replace(/-/g, '')
		.replace(/_/g, '')
		.toLowerCase();

	let timeout: ReturnType<typeof setTimeout>;
	let mobilePackages = false;
	let showAllVersions = false;

	function checkCompatibility(patch: Patch, pkg: string) {
		if (pkg === '') {
			return false;
		}
		return !!patch.compatiblePackages.find((compat) => compat.name === pkg);
	}

	function searchString(str: string, term: string, filter: RegExp) {
		return str.toLowerCase().replace(filter, '').includes(term);
	}

	function filter(patches: Patch[], pkg: string, search?: string): Patch[] {
		if (search === undefined && pkg === '') {
			return patches;
		}

		return patches.filter((patch) => {
			// Don't show if the patch doesn't support the selected package
			if (pkg && !checkCompatibility(patch, pkg)) {
				return false;
			}

			// Filter based on the search term.
			if (search !== undefined) {
				return (
					searchString(patch.description, search, /\s/g) ||
					searchString(patch.name, search, /\s/g) ||
					patch.compatiblePackages.find((x) => searchString(x.name, search, /\./g))
				);
			}
			return true;
		});
	}

	// Make sure we don't have to filter the patches after every key press
	const debounce = () => {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			// Filter search term for better results (i.e. "  Unl O-ck" and "unlock" gives the same results)
			searchTermFiltered = searchTerm
				?.replace(/\./g, '')
				.replace(/\s/g, '')
				.replace(/-/g, '')
				.replace(/_/g, '')
				.toLowerCase();
			// Update search URL params
			// must use history.pushState instead of goto(), as goto() unselects the search bar
			const url = new URL(window.location.href);
			url.pathname = '/patches';

			const params = new URLSearchParams();
			if (selectedPkg) {
				params.set('pkg', selectedPkg);
			}
			if (searchTerm) {
				params.set('s', searchTerm);
			}

			url.search = params.toString();
			window.history.pushState(null, '', url.toString());
		}, 500);
	};
</script>

<Meta title="Patches" />
<JsonLd
	schema={{
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: 'ReVanced Patches',
		abstract: 'A list of ReVanced Patches',
		breadcrumb: 'Home > Patches',
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

<div class="search">
	<div class="search-contain">
		<!-- Must bind both variables: we get searchTerm from the text input, -->
		<!-- and searchTermFiltered gets cleared with the clear button -->
		<Search
			bind:searchTerm
			bind:searchTermFiltered
			title="Search for patches"
			on:keyup={debounce}
		/>
	</div>
</div>
<main>
	<div class="filter-chips" in:fly={{ y: 10, easing: quintOut, duration: 750 }}>
		<FilterChip
			selected={!!selectedPkg}
			dropdown
			on:click={() => (mobilePackages = !mobilePackages)}
		>
			{selectedPkg || 'Packages'}
		</FilterChip>
		<!-- <FilterChip check>Universal</FilterChip>
		<FilterChip>Patch options</FilterChip> -->
	</div>

	<Query {query} let:data>
		<div class="mobile-packages-Dialogue">
			<Dialogue bind:modalOpen={mobilePackages} fullscreen>
				<svelte:fragment slot="title">Packages</svelte:fragment>
				<div class="mobile-packages">
					<span
						on:click={() => (mobilePackages = !mobilePackages)}
						on:keypress={() => (mobilePackages = !mobilePackages)}
					>
						<Package {selectedPkg} name="All packages" bind:searchTerm />
					</span>
					{#each data.packages as pkg}
						<span
							on:click={() => (mobilePackages = !mobilePackages)}
							on:keypress={() => (mobilePackages = !mobilePackages)}
						>
							<Package {selectedPkg} name={pkg} bind:searchTerm />
						</span>
					{/each}
				</div>
			</Dialogue>
		</div>

		<aside in:fly={{ y: 10, easing: quintOut, duration: 750 }}>
			<PackageMenu>
				<span class="packages">
					<Package {selectedPkg} name="All packages" bind:searchTerm />
					{#each data.packages as pkg}
						<Package {selectedPkg} name={pkg} bind:searchTerm />
					{/each}
				</span>
			</PackageMenu>
		</aside>

		<div class="patches-container">
			{#each filter(data.patches, selectedPkg || '', searchTermFiltered) as patch}
				<!-- Trigger new animations when package or search changes (I love Svelte) -->
				{#key selectedPkg || searchTermFiltered}
					<div in:fly={{ y: 10, easing: quintOut, duration: 750 }}>
						<PatchItem {patch} bind:showAllVersions />
					</div>
				{/key}
			{/each}
		</div>
	</Query>
</main>
<Footer />

<style>
	main {
		display: grid;
		grid-template-columns: 300px 3fr;
		width: min(90%, 80rem);
		margin-inline: auto;
		gap: 1.5rem;
	}

	.search {
		padding-top: 5rem;
		padding-bottom: 1.25rem;
		background-color: var(--grey-seven);
	}

	.search-contain {
		width: min(90%, 80rem);
		margin-inline: auto;
	}

	.patches-container {
		overflow: hidden;
		border-radius: 20px;
		margin-top: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
		position: sticky;
		z-index: 1;
		min-height: calc(100vh - 6rem);
		margin-bottom: 3rem;
	}

	.filter-chips {
		display: none;
	}

	.mobile-packages {
		margin-bottom: -1px;
		overflow: hidden;
		border-radius: 12px;
		border: 1px solid var(--grey-three);
	}

	@media (min-width: 768px) {
		.mobile-packages-Dialogue {
			display: none;
		}
	}
	@media (max-width: 767px) {
		main {
			grid-template-columns: none;
			flex-direction: column;
			gap: 0;
		}

		aside {
			display: none;
		}

		.search {
			padding-top: 4.5rem;
		}

		.patches-container {
			margin-top: 1rem;
			margin-bottom: 1.5rem;
			gap: 0.75rem;
		}

		.filter-chips {
			display: flex;
			flex-wrap: wrap;
			margin-top: 1rem;
			gap: 0.75rem;
			padding-bottom: 0rem;
		}
	}
</style>
