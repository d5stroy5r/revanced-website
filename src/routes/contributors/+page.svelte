<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	import ContributorHost from './ContributorSection.svelte';
	import Footer from '$layout/Footer/FooterHost.svelte';
	import Meta from '$lib/components/Meta.svelte';
	import { JsonLd } from 'svelte-meta-tags';
	import Query from '$lib/components/Query.svelte';

	import { queries } from '$data/api';
	import { createQuery } from '@tanstack/svelte-query';

	const query = createQuery(['repositories'], queries.repositories);
</script>

<Meta title="Contributors" />
<JsonLd
	schema={{
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: 'ReVanced Contributors',
		abstract: 'A list of everyone that has contributed to ReVanced',
		breadcrumb: 'Home > Contributors',
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

<main>
	<div class="wrapper">
		<div class="text-container" in:fly={{ y: 10, easing: quintOut, duration: 750 }}>
			<h2>Made possible by the community.</h2>
			<p>
				Want to show up here? <span
					><a href="https://github.com/revanced" target="_blank" rel="noreferrer"
						>Become a contributor</a
					></span
				>
			</p>
		</div>
		<div class="repos">
			<Query {query} let:data>
				{#each data.repositories as { contributors, name: repo }}
					<div in:fly={{ y: 10, easing: quintOut, duration: 750 }}>
						<ContributorHost {contributors} {repo} />
					</div>
				{/each}
			</Query>
		</div>
	</div>
</main>

<Footer />

<style>
	.repos {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		margin-bottom: 4rem;
	}

	h2 {
		text-align: center;
		color: var(--grey-four);
		margin-bottom: 0.3rem;
	}

	p {
		text-align: center;
		color: var(--grey-four);
	}

	.text-container {
		display: flex;
		align-items: center;
		flex-direction: column;
		margin-bottom: 2rem;
		background-color: var(--accent-color);
		padding: 2.5rem 1.75rem;
		border-radius: 20px;
	}

	a {
		text-decoration: none;
		color: var(--grey-four);
	}

	a::after {
		padding-left: 5px;
		content: '→';
		position: absolute;
		transition: all 0.3s var(--bezier-one);
	}

	a:hover {
		text-decoration: underline var(--grey-four);
	}

	a:hover::after {
		transform: translateX(5px);
	}
	@media screen and (max-width: 767px) {
		.text-container {
			padding: 2rem 1.75rem;
			margin-bottom: 2rem;
		}
	}
</style>
