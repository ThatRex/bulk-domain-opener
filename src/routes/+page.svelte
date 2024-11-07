<script lang="ts">
	import { browser } from '$app/environment'
	import { persisted } from 'svelte-persisted-store'
	import { removeRandomItems } from '$lib'

	const regex = /(https?:\/\/)?((([\w\-]+\.)+[\w\-]{2,})([\w\/]+)?)/i
	// G2 = domain & path
	// G3 = domain
	// G5 = path

	const field = persisted('field', '')
	const list = persisted<string[]>('list', [])
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

		$list = [...new Set(parsed)]

		const update = $qty >= $list.length
		if (update) $qty = $list.length
	})

	const open = async () => {
		let body = ''

		for (const i of removeRandomItems($list, $list.length - $qty)) {
			body += `window.open('http://${i}', '_blank', 'noopener,noreferrer');`
		}

		new Function(body)()
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
				onsubmit={(e) => {
					e.preventDefault()
					open()
				}}
			>
				<textarea spellcheck="false" bind:value={$field}></textarea>
				<label>
					<div>Amount</div>
					{#if browser}
						<input type="range" bind:value={$qty} min="1" max={$list.length} step="1" />
					{:else}
						<input type="range" disabled />
					{/if}
				</label>
				<button class="bg-blue-500 mt-1.5" disabled={!$list.length}>
					Open {$qty}
					{$qty !== $list.length ? 'Random' : ''} Domains
				</button>
			</form>
		</div>
		<div class="flex flex-col min-h-0">
			<h1>Parsed</h1>
			<p>Parsed Domain list.</p>
			<div class="border-2 flex grow rounded-md py-1 px-1.5 h-0 overflow-auto">
				<div class="grid grid-cols-1 content-start">
					{#each $list as domain}
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
