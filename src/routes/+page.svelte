<script lang="ts">
	import { persisted } from 'svelte-persisted-store'
	import { onMount } from 'svelte'
	import { writable } from 'svelte/store'
	import { removeRandomItems } from '$lib'

	let disabled = false
	const qty = persisted('qty', 1)
	const domainList = persisted<string[]>('domains', [])
	const domainsField = writable('')

	onMount(() => {
		$domainsField = $domainList.join('\n').replaceAll('https://', '').replaceAll('http://', '')
		domainsField.subscribe((v) => {
			const parsed = v
				.split(/\r?\n/)
				.map((line) => {
					line = line.trim()
					const domainRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]{2,}$/i
					if (!domainRegex.test(line)) return ''
					line = line.replaceAll('https://', '').replaceAll('http://', '')
					return 'http://' + line
				})
				.filter((d) => d)

			const updateQty = $qty === $domainList.length
			$domainList = parsed
			if (updateQty) $qty = $domainList.length
		})
	})

	$: $domainList = [...new Set($domainList)]

	const open = async () => {
		let body = ''

		for (const domain of removeRandomItems($domainList, $domainList.length - $qty)) {
			body = body + `window.open('${domain}', '_blank', 'noopener,noreferrer');`
		}

		const op = new Function(body)

		op()
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
				class="flex flex-col gap-0.5"
				on:submit={(e) => {
					e.preventDefault()
					open()
					disabled = true
					setTimeout(() => (disabled = false), 1000)
				}}
			>
				<textarea spellcheck="false" bind:value={$domainsField} />
				<label>
					<div>Amount</div>
					<input type="range" bind:value={$qty} min="1" max={$domainList.length} step="1" />
				</label>
				<button class="bg-blue-500 mt-1.5" disabled={disabled || !$domainList.length}>
					Open {$qty}
					{$qty !== $domainList.length ? 'Random' : ''} Domains
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

	p {
		@apply mb-2 mt-1;
	}

	label {
		@apply flex flex-col grow font-bold min-w-0;
	}

	button {
		@apply flex grow justify-center p-2 rounded-md text-white font-bold items-center;
		&:disabled {
			@apply !bg-neutral-500;
		}
	}

	textarea {
		@apply border-2 rounded-md py-1 px-1.5 h-96;
	}
</style>
