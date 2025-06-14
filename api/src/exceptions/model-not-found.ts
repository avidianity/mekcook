import { NotFoundException } from '@/exceptions/not-found';
import { Exceptions } from '@/types';

export class ModelNotFoundException extends NotFoundException {
	constructor(model: string, public context?: Exceptions.Context) {
		super(`${model} not found.`, 404, 'MODEL_NOT_FOUND', context);
	}
}
