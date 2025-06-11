import { yup } from '@/utils/yup';

export const register = yup.object({
	name: yup.string().min(1).max(255).required(),
	email: yup.string().email().required(),
	password: yup.string().min(4).max(255).required(),
});

export const login = yup.object({
	email: yup.string().email().required(),
	password: yup.string().min(4).max(255).required(),
});
