import { buildBasicToken } from './utils/buildBasicToken.js';
import { SecureRedactRequest } from './SecureRedactRequest.js';
import SecureRedactError from './SecureRedactError.js';
import {
  SecureRedactFetchMediaStatusParams,
  SecureRedactFetchTokenParams,
  SecureRedactBearerToken,
  SecureRedactMediaInfo,
  SecureRedactUserInfo,
  SecureRedactCreateUserParams,
  SecureRedactUploadResponse,
  SecureRedactUploadMediaParams,
  SecureRedactRedactMediaParams,
  SecureRedactRedactResponse,
  SecureRedactDeleteMediaParams,
  SecureRedactDeleteMediaResponse,
  SecureRedactLoginUserParams,
  SecureRedactLoginResponse,
  SecureRedactDownloadMediaParams,
  SecureRedactDownloadMediaResponse
} from './types/lib.js';
import {
  SecureRedactEndpoints,
  SecureRedactParams,
  SecureRedactResponse
} from './types/internal.js';

class SecureRedactSDK {
  readonly #BASE_URL: string = 'https://app.secureredact.co.uk';
  readonly #VERSION: string = 'v2';
  readonly #MAX_RETRIES: number = 1;
  readonly #CHUNK_SIZE: number = 10;
  #basicToken: string;
  #bearerToken: string | null;

  constructor({
    clientId,
    clientSecret
  }: {
    clientId: string;
    clientSecret: string;
  }) {
    this.#basicToken = buildBasicToken(clientId, clientSecret);
    this.#bearerToken = null;
  }

  #setBearerToken = (token: string) => (this.#bearerToken = `Bearer ${token}`);

  #buildUrlPath = (endpoint: string) =>
    `${this.#BASE_URL}/api/${this.#VERSION}/${endpoint}`;

  #makeAuthenticatedRequest = async (
    requester: (
      url: string,
      params: SecureRedactParams,
      auth: string,
      headers?: Record<string, string>,
      blob?: Blob
    ) => Promise<SecureRedactResponse>,
    url: string,
    params: SecureRedactParams,
    username?: string,
    headers?: Record<string, string>,
    blob?: Blob,
    retries = 0
  ): Promise<SecureRedactResponse> => {
    try {
      if (username || !this.#bearerToken) {
        this.#bearerToken = await this.fetchToken({ username });
      }
      return await requester(url, params, this.#bearerToken, headers, blob);
    } catch (err) {
      if (
        err instanceof SecureRedactError &&
        err.statusCode === 403 &&
        retries < this.#MAX_RETRIES
      ) {
        return await this.#makeAuthenticatedRequest(
          requester,
          url,
          params,
          username,
          headers,
          blob,
          retries + 1
        );
      } else {
        throw err;
      }
    }
  };

  #makeAuthenticatedPostRequest = async (
    url: string,
    data: SecureRedactParams,
    username?: string,
    headers?: Record<string, string>,
    blob?: Blob
  ) => {
    return await this.#makeAuthenticatedRequest(
      SecureRedactRequest.makePostRequest,
      url,
      data,
      username,
      headers,
      blob
    );
  };

  #makeAuthenticatedGetRequest = async (
    url: string,
    params: SecureRedactParams,
    username?: string,
    headers?: Record<string, string>
  ) => {
    return await this.#makeAuthenticatedRequest(
      SecureRedactRequest.makeGetRequest,
      url,
      params,
      username,
      headers
    );
  };

  #loadChunk = (
    chunkIndex: number,
    totalChunks: number,
    fileSize: number,
    reader: FileReader,
    file: File
  ) => {
    return new Promise((resolve, reject) => {
      const numBytes =
        totalChunks === 1 ? fileSize : this.#CHUNK_SIZE * 1000 * 1000;
      const start = numBytes * chunkIndex;

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = (<FileReader>e.currentTarget).result;
        if (result !== null) {
          resolve({
            data: new Blob([result], {
              type: 'application/octet-stream'
            }),
            id: chunkIndex
          });
        } else {
          reject(new Error('FileReader result is null.'));
        }
      };

      reader.onerror = err => {
        reject(err);
      };

      reader.readAsArrayBuffer(file.slice(start, start + numBytes));
    });
  };

  #sendChunk = async (
    params: SecureRedactUploadMediaParams,
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
    fileId: string
  ) => {
    return await this.#makeAuthenticatedPostRequest(
      this.#buildUrlPath(SecureRedactEndpoints.UPLOAD_MEDIA),
      {
        mediapath: params.mediaPath,
        videoTag: params.videoTag,
        increasedDetectionAccuracy: params.increasedDetectionAccuracy,
        stateCallback: params.stateCallback,
        exportCallback: params.exportCallback,
        exportToken: params.exportToken,
        licensePlates: params.licensePlates,
        faces: params.faces
      },
      '',
      {
        'total-chunks': totalChunks.toString(),
        'chunk-id': chunkIndex.toString(),
        'file-id': fileId
      },
      chunk
    );
  };

  #sendChunks = async (params: SecureRedactUploadMediaParams) => {
    const file = params.file;
    if (!file) {
      throw new SecureRedactError('No file provided', 400);
    }

    const reader = new FileReader();
    // @typescript-eslint/no-explicit-any
    let fileId: any = '';
    const totalChunks = Math.ceil(file.size / (this.#CHUNK_SIZE * 1000 * 1000));

    let data: SecureRedactResponse = {};

    for (let i = 0; i < totalChunks; i++) {
      // @typescript-eslint/no-explicit-any
      const chunk: any = await this.#loadChunk(
        i,
        totalChunks,
        file.size,
        reader,
        file
      );
      const fileData: Blob = chunk.data;
      data = await this.#sendChunk(params, fileData, i, totalChunks, fileId);
      if (!fileId) {
        fileId = data.fileId || '';
      }
    }

    return data;
  };

  fetchToken = async ({
    username
  }: SecureRedactFetchTokenParams = {}): Promise<SecureRedactBearerToken> => {
    const data = await SecureRedactRequest.makeGetRequest(
      this.#buildUrlPath(SecureRedactEndpoints.FETCH_TOKEN),
      username ? { username } : {},
      this.#basicToken
    );
    if (typeof data.token !== 'string') {
      throw new SecureRedactError('Invalid token type', 500);
    }
    // store token for future use
    const bearerToken = `Bearer ${data.token}`;
    this.#setBearerToken(bearerToken);
    return bearerToken;
  };

  fetchMediaStatus = async ({
    mediaId,
    username
  }: SecureRedactFetchMediaStatusParams): Promise<SecureRedactMediaInfo> => {
    const data = await this.#makeAuthenticatedGetRequest(
      this.#buildUrlPath(SecureRedactEndpoints.FETCH_MEDIA_STATUS),
      { mediaId },
      username
    );

    if (typeof data.mediaId !== 'string') {
      throw new SecureRedactError('Invalid mediaId type returned', 500);
    }
    if (typeof data.username !== 'string') {
      throw new SecureRedactError('Invalid username type returned', 500);
    }
    if (typeof data.status !== 'string') {
      throw new SecureRedactError('Invalid status type returned', 500);
    }

    return {
      mediaId: data.mediaId,
      username: data.username,
      error: data.error?.toString() || null,
      status: data.status
    };
  };

  createUser = async ({
    username
  }: SecureRedactCreateUserParams): Promise<SecureRedactUserInfo> => {
    const data = await this.#makeAuthenticatedPostRequest(
      this.#buildUrlPath(SecureRedactEndpoints.CREATE_USER),
      { username }
    );

    if (typeof data.username !== 'string') {
      throw new SecureRedactError('Invalid username type returned', 500);
    }

    return {
      username: data.username,
      msg: data.msg?.toString(),
      error: data.error?.toString() || null
    };
  };

  loginUser = async ({
    username,
    mediaId
  }: SecureRedactLoginUserParams): Promise<SecureRedactLoginResponse> => {
    const data = await this.#makeAuthenticatedPostRequest(
      this.#buildUrlPath(SecureRedactEndpoints.LOGIN_USER),
      {
        mediaId
      },
      username
    );

    if (typeof data.redirectUrl !== 'string') {
      throw new SecureRedactError('Invalid redirect_url type returned', 500);
    }
    if (typeof data.success !== 'boolean') {
      throw new SecureRedactError('Invalid success type returned', 500);
    }

    return {
      redirectUrl: data.redirectUrl,
      success: data.success
    };
  };

  uploadMedia = async ({
    mediaPath,
    videoTag,
    increasedDetectionAccuracy,
    stateCallback,
    exportCallback,
    exportToken,
    licensePlates = false,
    faces = true,
    file = undefined
  }: SecureRedactUploadMediaParams): Promise<SecureRedactUploadResponse> => {
    let data: SecureRedactResponse;
    if (mediaPath) {
      // send file as chunks of data
      data = await this.#sendChunks({
        mediaPath,
        videoTag,
        increasedDetectionAccuracy,
        stateCallback,
        exportCallback,
        exportToken,
        licensePlates,
        faces,
        file
      });
    } else {
      data = await this.#makeAuthenticatedPostRequest(
        this.#buildUrlPath(SecureRedactEndpoints.UPLOAD_MEDIA),
        {
          mediaPath,
          videoTag,
          increasedDetectionAccuracy,
          stateCallback,
          exportCallback,
          exportToken,
          licensePlates,
          faces
        }
      );
    }

    if (typeof data.mediaId !== 'string') {
      throw new SecureRedactError('Invalid media_id type returned', 500);
    }
    if (typeof data.fileInfo !== 'object') {
      throw new SecureRedactError('Invalid file_info type returned', 500);
    }

    return {
      fileInfo: {
        name: data.fileInfo?.name?.toString() || '',
        mimetype: data.fileInfo?.mimetype?.toString() || '',
        size: parseInt(data.fileInfo?.size?.toString() || '0')
      },
      mediaId: data.mediaId,
      message: data.message?.toString(),
      error: data.error?.toString() || null
    };
  };

  redactMedia = async ({
    mediaId,
    enlargeBoxes,
    redactAudio,
    blur,
    username
  }: SecureRedactRedactMediaParams): Promise<SecureRedactRedactResponse> => {
    const data = await this.#makeAuthenticatedPostRequest(
      this.#buildUrlPath(SecureRedactEndpoints.REDACT_MEDIA),
      {
        mediaId,
        enlargeBoxes,
        redactAudio,
        blur
      },
      username
    );

    return {
      error: data.error?.toString() || null
    };
  };

  deleteMedia = async ({
    mediaId
  }: SecureRedactDeleteMediaParams): Promise<SecureRedactDeleteMediaResponse> => {
    const data = await this.#makeAuthenticatedPostRequest(
      this.#buildUrlPath(SecureRedactEndpoints.DELETE_MEDIA),
      {
        mediaId
      }
    );

    if (typeof data.mediaId !== 'string') {
      throw new SecureRedactError('Invalid mediaId type returned', 500);
    }
    if (typeof data.message !== 'string') {
      throw new SecureRedactError('Invalid message type returned', 500);
    }

    return {
      mediaId: data.mediaId,
      message: data.message,
      error: data.error?.toString() || null
    };
  };

  downloadMedia = async ({
    mediaId,
    username
  }: SecureRedactDownloadMediaParams): Promise<SecureRedactDownloadMediaResponse> => {
    // check we can write to this path
    const data = await this.#makeAuthenticatedRequest(
      SecureRedactRequest.downloadFile,
      this.#buildUrlPath(SecureRedactEndpoints.DOWNLOAD_MEDIA),
      { mediaId },
      username
    );
    if (!data.blob) {
      throw new SecureRedactError('Invalid blob type returned', 500);
    }
    return {
      blob: data.blob
    };
  };
}

export { SecureRedactSDK };
