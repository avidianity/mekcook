import { ulid } from 'ulid';
import fs from 'fs/promises';
import path from 'path';
import type { Instance } from '@/app';
import { fileExists } from '@/utils/file';
import { NotFoundException } from '@/exceptions/not-found';
import { BadRequestException } from '@/exceptions/bad-request';
import z from 'zod/v4';
import { fileTypeFromStream, fileTypeFromBuffer } from 'file-type';
import config from '@/config';
import { makeSchema } from '@/utils/http';
import { ReadableStream } from 'stream/web';

const STORAGE_PATH = config.storage.path;

export default (app: Instance) => {
	app.post('/upload', {
		schema: {
			summary: 'Upload a file',
			consumes: ['multipart/form-data'],
			response: makeSchema(
				{
					data: z
						.strictObject({
							id: z.ulid(),
						})
						.strip(),
				},
				201
			),
		},
		async handler(request, reply) {
			const data = await request.file().catch((error) => {
				throw new BadRequestException(
					'No file uploaded',
					400,
					'NO_FILE_UPLOADED',
					undefined,
					error
				);
			});

			if (!data) {
				throw new BadRequestException(
					'No file uploaded',
					400,
					'NO_FILE_UPLOADED'
				);
			}

			const id = ulid().toLowerCase();
			await fs.mkdir(STORAGE_PATH, { recursive: true });
			const filePath = path.join(STORAGE_PATH, id);

			const ws = await fs.open(filePath, 'w');
			const writeStream = ws.createWriteStream();
			await new Promise<void>((resolve, reject) => {
				data.file.pipe(writeStream).on('finish', resolve).on('error', reject);
			});
			await ws.close();

			return reply.status(201).send({
				data: {
					id,
				},
			});
		},
	});

	app.get('/:id', {
		schema: {
			params: z
				.strictObject({
					id: z.ulid(),
				})
				.strip(),
		},
		async handler(request, reply) {
			const { id } = request.params;
			const filePath = path.join(STORAGE_PATH, id);

			if (!(await fileExists(filePath))) {
				throw new NotFoundException('File not found.', 404, 'FILE_NOT_FOUND', {
					path,
					id,
				});
			}

			const buffer = await fs.readFile(filePath);

			// Detect MIME type from the stream
			const type = await fileTypeFromBuffer(buffer);

			return reply
				.header('Content-Disposition', `attachment; filename="${id}"`)
				.header('Content-Type', type?.mime || 'application/octet-stream')
				.send(buffer);
		},
	});
};
