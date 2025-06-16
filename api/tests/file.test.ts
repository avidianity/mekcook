import { describe, it, expect, beforeAll } from 'vitest';
import supertest from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import app from '@/app';
import config from '@/config';
import type TestAgent from 'supertest/lib/agent';
import { ulid } from 'ulid';

const STORAGE_PATH = config.storage.path;

describe('File Routes', () => {
	let request: TestAgent;

	beforeAll(async () => {
		request = supertest(app.server);
	});

	it('should upload a file and return an id', async () => {
		const testFilePath = path.join(__dirname, 'test-upload.txt');
		await fs.writeFile(testFilePath, 'Hello, Mekcook!');

		const res = await request.post('/file/upload').attach('file', testFilePath);

		expect(res.status).toBe(201);
		expect(res.body.data).toHaveProperty('id');
		expect(typeof res.body.data.id).toBe('string');

		// Clean up test file
		await fs.unlink(testFilePath);

		// Clean up uploaded file
		const uploadedFilePath = path.join(STORAGE_PATH, res.body.data.id);
		if (await fs.stat(uploadedFilePath).catch(() => false)) {
			await fs.unlink(uploadedFilePath);
		}
	});

	it('should return 400 if no file is uploaded', async () => {
		const res = await request.post('/file/upload');
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('code');
	});

	it('should download an uploaded file', async () => {
		const testFilePath = path.join(__dirname, 'test-download.txt');
		const fileContent = 'Download me!';
		await fs.writeFile(testFilePath, fileContent);

		// Upload file
		const uploadRes = await request
			.post('/file/upload')
			.attach('file', testFilePath);

		expect(uploadRes.status).toBe(201);
		const fileId = uploadRes.body.data.id;

		// Download file
		const downloadRes = await request.get(`/file/${fileId}`);
		expect(downloadRes.status).toBe(200);
		expect(downloadRes.body.toString()).toBe(fileContent);

		// Clean up
		await fs.unlink(testFilePath);
		const uploadedFilePath = path.join(STORAGE_PATH, fileId);
		if (await fs.stat(uploadedFilePath).catch(() => false)) {
			await fs.unlink(uploadedFilePath);
		}
	});

	it('should return 404 for non-existent file', async () => {
		const fakeId = ulid().toLowerCase();
		const res = await request.get(`/file/${fakeId}`);
		expect(res.status).toBe(404);
		expect(res.body).toHaveProperty('code');
	});
});
