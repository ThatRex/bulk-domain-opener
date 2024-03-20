export function removeRandomItems<T>(array: T[], qty: number) {
	if (qty >= array.length || qty < 0) return array
	const copy = [...array]
	const idxToRemove = new Set()

	while (idxToRemove.size < qty) {
		idxToRemove.add(Math.floor(Math.random() * copy.length))
	}

	return copy.filter((_, index) => !idxToRemove.has(index))
}
