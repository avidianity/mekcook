export function formatStack(stack?: string) {
	if (!stack) return '';

	return stack
		.split('\n')
		.slice(1)
		.map((line) => line.trim())
		.filter((line) => line.length > 0);
}
