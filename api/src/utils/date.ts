export const normalizeTime = (time: string) => {
	if (/^\d{2}:\d{2}$/.test(time)) return `${time}:00`;
	if (/^\d{2}:\d{2}:\d{2}\.\d{3}$/.test(time)) return time.slice(0, 8);
	return time; // assume already in HH:mm:ss
};
