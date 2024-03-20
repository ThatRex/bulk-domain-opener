<script lang="ts">
	import { persisted } from 'svelte-persisted-store'
	import { onMount } from 'svelte'
	import { writable } from 'svelte/store'

	const domainList = persisted<string[]>('domains', [])
	const domainsField = writable('')

	onMount(() => {
		$domainsField = $domainList.join('\n')
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

	const open = async () => {
		opening = true
		for (const domain of $domainList) {
			window.open(domain)
			await new Promise((res) => setTimeout(res, 250))
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
			<form class="flex flex-col gap-1">
				<textarea bind:value={$domainsField} /><br />
				<button type="submit" disabled={!opening && !$domainList.length} on:click={open}>
					Open {$domainList.length} Domains
				</button>
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

	button[type='submit'] {
		@apply flex grow justify-center p-2 bg-blue-500 rounded-md text-white font-bold;
		&:disabled {
			@apply bg-neutral-500;
		}
	}

	textarea {
		@apply border-2 rounded-md py-1 px-1.5 h-96;
	}
</style>
