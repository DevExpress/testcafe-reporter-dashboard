import { Logger } from './types/internal';
import { UploadInfo } from './types/internal/resolve';
import { createGetUploadInfoError } from './texts';
import Transport from './transport';

export class UploaderCore {
    private _transport: Transport;
    private _logger: Logger;

    constructor (transport: Transport, logger: Logger) {
        this._transport = transport;
        this._logger    = logger;
    }

    async getUploadInfo (uploadEntityId: string): Promise<UploadInfo | null> {
        const response = await this._transport.fetchFromDashboard('api/getUploadUrl');

        if (response.ok)
            return await response.json();

        this._logger.error(createGetUploadInfoError(uploadEntityId, response.toString()));

        return null;
    }

    async upload (uploadUrl: string, uploadEntity: Buffer) {
        return this._transport.fetch(uploadUrl, {
            method:  'PUT',
            headers: {
                'Content-Length': uploadEntity.length
            },
            body: uploadEntity
        });
    }
}
