<script lang="ts">
	import { browser, dev } from '$app/environment'
	import { persisted } from 'svelte-persisted-store'
	import { removeRandomItems } from '$lib'

	const regex = /(https?:\/\/)?((([\w\-]+\.)+[\w\-]{2,})([\w\/]+)?)/i
	// G2 = domain & path
	// G3 = domain
	// G5 = path

	const field = persisted('field', '')
	const list = persisted<{ open: boolean; site: string }[]>('list', [])
	const qty = persisted('qty', 0)

	const parser = (i: string) => {
		const res = regex.exec(i)
		return res ? res[2] : ''
	}

	field.subscribe((v) => {
		const parsed = v
			.split(/\r?\n/)
			.map(parser)
			.filter((i) => i)

		$list = [...new Set(parsed)].map((site) => ({ open: true, site }))

		const update = $qty >= $list.length
		if (update) $qty = $list.length
	})

	const open = () => {
		const toOpenCandidates = $list.filter(({ open }) => open).map((v) => v.site)
		const toOpen = removeRandomItems(toOpenCandidates, toOpenCandidates.length - $qty)

		$list = $list.map((v) => {
			const found = !!toOpen.find((s) => s === v.site)
			v.open = found ? false : v.open
			return v
		})

		let body = ''
		for (const s of toOpen) {
			body += `window.open('http://${s}', '_blank', 'noopener,noreferrer');`
		}

		console.debug(body.replaceAll(';', '\n'))
		dev || new Function(body)()
	}

	const reset = () => {
		$list = $list.map((v) => {
			v.open = true
			return v
		})
	}
</script>

<svelte:head>
	<title>Bulk Domain Opener</title>
</svelte:head>

<div class="mx-auto max-w-5xl p-6 h-svh">
	<div class="grid grid-cols-2 gap-2 h-full">
		<div class="flex flex-col min-h-0">
			<h1>Domains</h1>
			<p>One domain per line.</p>
			<div class="flex flex-col gap-0.5 grow">
				<textarea
					class="h-full resize-none border-2 rounded-md py-1 px-1.5"
					spellcheck="false"
					bind:value={$field}
				></textarea>
				<label class="flex flex-col grow font-bold min-w-0">
					<div>Amount</div>
					{#if browser}
						<input type="range" bind:value={$qty} min="1" max={$list.length} step="1" />
					{:else}
						<input type="range" disabled />
					{/if}
				</label>
				<button
					class="bg-blue-500 mt-1.5"
					disabled={!$list.length || !$list.filter(({ open }) => open).length}
					onclick={open}
				>
					Open {$qty}
					{$qty !== $list.length ? 'Random' : ''} Domains
				</button>
				<button class="bg-blue-500 mt-1.5" onclick={reset}>Reset</button>
			</div>
		</div>
		<div class="flex flex-col min-h-0">
			<h1>Parsed</h1>
			<p>Parsed Domain list.</p>
			<div class="border-2 flex flex-col grow rounded-md py-1 px-1.5 h-0 overflow-auto">
				{#each $list as { open, site }}
					<label class="flex gap-2 items-center">
						<input type="checkbox" bind:checked={open} />
						<div>{site}</div>
					</label>
				{/each}
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	h1 {
		@apply text-3xl font-bold;
	}

	p {
		@apply mb-2 mt-1;
	}

	button {
		@apply flex grow justify-center p-2 rounded-md text-white font-bold items-center;
		&:disabled {
			@apply !bg-neutral-500;
		}
	}
</style>
