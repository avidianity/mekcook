import { access } from 'fs/promises';
import { constants } from 'fs';

export async function fileExists(path: string): Promise<boolean> {
	try {
		await access(path, constants.F_OK);
		return true;
	} catch {
		return false;
	}
}
