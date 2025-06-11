export function env(key: string, fallback?: string | null): string | null {
	const value = process.env[key];
	if (value === undefined) return fallback ?? null;
	if (value.trim().toLowerCase() === 'null') return fallback ?? null;
	return value;
}
