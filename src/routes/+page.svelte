<script lang="ts">
	import { persisted } from 'svelte-persisted-store'
	import { onMount } from 'svelte'
	import { writable } from 'svelte/store'

	const domainList = persisted<string[]>('domains', [])
	const domainsField = writable('')

	onMount(() => {
		$domainsField = $domainList.join('\n').replaceAll('https://', '').replaceAll('http://', '')
		domainsField.subscribe(() => {
			$domainList = $domainsField
				.split(/\r?\n/)
				.map((line) => {
					line = line.trim()
					const domainRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]{2,}$/i
					if (!domainRegex.test(line)) return ''
					line = line.replaceAll('https://', '').replaceAll('http://', '')
					return 'http://' + line
				})
				.filter((d) => d)
		})
	})

	let opening = false
	const delay = persisted('delay', 100)

	const open = async () => {
		opening = true
		for (const domain of $domainList) {
			window.open(domain, '_blank', 'noopener,noreferrer')
			await new Promise((res) => setTimeout(res, $delay))
			if (!opening) break
		}
		opening = false
	}
</script>

<svelte:head>
	<title>Bulk Domain Opener</title>
</svelte:head>

<div class="wrapper">
	<div class="grid grid-cols-2 gap-2">
		<div class="flex flex-col min-h-0">
			<h1>Domains</h1>
			<p>One domain per line.</p>
			<form
				class="flex flex-col gap-2"
				on:submit={(e) => {
					e.preventDefault()
					if (!opening) open()
				}}
			>
				<textarea spellcheck="false" bind:value={$domainsField} />
				<input type="range" bind:value={$delay} min="0" max="2000" step="100" />
				<div class="flex gap-2">
					<button class="bg-green-500" disabled={!opening && !$domainList.length}>
						Open {$domainList.length} Domains ({$delay}ms delay)
					</button>
				</div>
			</form>
		</div>
		<div class="flex flex-col min-h-0">
			<h1>Parsed</h1>
			<p>Parsed Domain list.</p>
			<div class="border-2 flex grow rounded-md py-1 px-1.5 h-0 overflow-auto">
				<div class="grid grid-cols-1 content-start">
					{#each $domainList as domain}
						<div>{domain}</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	.wrapper {
		@apply mx-auto max-w-5xl m-6 px-2;
	}

	h1 {
		@apply text-3xl font-bold;
	}

	button {
		@apply flex grow justify-center p-2 rounded-md text-white font-bold items-center;
		&:disabled {
			@apply bg-neutral-500;
		}
	}

	textarea {
		@apply border-2 rounded-md py-1 px-1.5 h-96;
	}
</style>
