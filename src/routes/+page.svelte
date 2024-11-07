<script lang="ts">
	import { persisted } from 'svelte-persisted-store'
	import { removeRandomItems } from '$lib'

	const regex = /(https?:\/\/)?((([\w\-]+\.)+[\w\-]{2,})([\w\/]+)?)/i
	// G2 = domain & path
	// G3 = domain
	// G5 = path

	let disabled = $state(false)
	let list = $state<string[]>([])

	const field = persisted('field', '')
	const qty = persisted('qty', 1)

	const parser = (i: string) => {
		const res = regex.exec(i)
		return res ? 'http://' + res[2] : ''
	}

	field.subscribe((v) => {
		const update = $qty === list.length
		const parsed = v
			.split(/\r?\n/)
			.map(parser)
			.filter((i) => i)

		list = [...new Set(parsed)]
		if (update) $qty = list.length
	})

	const open = async () => {
		let body = ''

		for (const i of removeRandomItems(list, list.length - $qty)) {
			body += `window.open('${i}', '_blank', 'noopener,noreferrer');`
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
				onsubmit={(e) => {
					e.preventDefault()
					open()
					disabled = true
					setTimeout(() => (disabled = false), 1000)
				}}
			>
				<textarea spellcheck="false" bind:value={$field}></textarea>
				<label>
					<div>Amount</div>
					<input type="range" bind:value={$qty} min="1" max={list.length} step="1" />
				</label>
				<button class="bg-blue-500 mt-1.5" disabled={disabled || !list.length}>
					Open {$qty}
					{$qty !== list.length ? 'Random' : ''} Domains
				</button>
			</form>
		</div>
		<div class="flex flex-col min-h-0">
			<h1>Parsed</h1>
			<p>Parsed Domain list.</p>
			<div class="border-2 flex grow rounded-md py-1 px-1.5 h-0 overflow-auto">
				<div class="grid grid-cols-1 content-start">
					{#each list as domain}
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
