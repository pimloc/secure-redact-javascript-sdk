import { buildBasicToken } from './utils/buildBasicToken.ts';
import { SecureRedactRequest } from './SecureRedactRequest.ts';
import {
  FetchMediaStatusParams,
  FetchTokenParams,
  SecureRedactBearerToken,
  SecureRedactEndpoints,
  SecureRedactMediaInfo,
  SecureRedactResponseData,
  SecureRedactUserInfo,
  CreateUserParams,
  SecureRedactUploadResponse,
  UploadMediaParams,
  SecureRedactParamsData
} from './types.ts';
import SecureRedactError from './SecureRedactError.ts';

class SecureRedactSDK {
  readonly #BASE_URL: string = 'https://app.secureredact.co.uk';
  readonly #VERSION: string = 'v2';
  readonly #MAX_RETRIES: number = 1;
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
      params: SecureRedactParamsData,
      auth: string
    ) => Promise<SecureRedactResponseData>,
    url: string,
    params: SecureRedactParamsData,
    username: string | undefined = undefined,
    retries = 0
  ): Promise<SecureRedactResponseData> => {
    try {
      if (username || !this.#bearerToken) {
        this.#bearerToken = await this.fetchToken(username);
      }
      return await requester(url, params, this.#bearerToken);
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
          retries + 1
        );
      } else {
        throw err;
      }
    }
  };

  #makeAuthenticatedPostRequest = async (
    url: string,
    data: SecureRedactParamsData,
    username?: string
  ) => {
    return await this.#makeAuthenticatedRequest(
      SecureRedactRequest.makePostRequest,
      url,
      data,
      username
    );
  };

  #makeAuthenticatedGetRequest = async (
    url: string,
    params: SecureRedactParamsData,
    username?: string
  ) => {
    return await this.#makeAuthenticatedRequest(
      SecureRedactRequest.makeGetRequest,
      url,
      params,
      username
    );
  };

  fetchToken = async (
    username: FetchTokenParams = null
  ): Promise<SecureRedactBearerToken> => {
    const data = await SecureRedactRequest.makeGetRequest(
      this.#buildUrlPath(SecureRedactEndpoints.FETCH_TOKEN),
      username ? { username } : {},
      this.#basicToken
    );
    if (typeof data.token !== 'string') {
      throw new SecureRedactError('Invalid token type', 500);
    }
    // store token for future use
    this.#setBearerToken(data.token);
    return data.token;
  };

  fetchMediaStatus = async ({
    mediaId,
    username
  }: FetchMediaStatusParams): Promise<SecureRedactMediaInfo> => {
    const data = await this.#makeAuthenticatedGetRequest(
      this.#buildUrlPath(SecureRedactEndpoints.FETCH_MEDIA_STATUS),
      { mediaId },
      username
    );

    if (typeof data.media_id !== 'string') {
      throw new SecureRedactError('Invalid mediaId type returned', 500);
    }
    if (typeof data.username !== 'string') {
      throw new SecureRedactError('Invalid username type returned', 500);
    }
    if (typeof data.status !== 'string') {
      throw new SecureRedactError('Invalid status type returned', 500);
    }

    return {
      mediaId: data.media_id,
      username: data.username,
      error: data.error ? data.error.toString() : null,
      status: data.status
    };
  };

  createUser = async ({
    username
  }: CreateUserParams): Promise<SecureRedactUserInfo> => {
    const data = await this.#makeAuthenticatedPostRequest(
      this.#buildUrlPath(SecureRedactEndpoints.CREATE_USER),
      { username }
    );

    if (typeof data.username !== 'string') {
      throw new SecureRedactError('Invalid username type returned', 500);
    }

    return {
      username: data.username,
      msg: data.msg ? data.msg.toString() : null,
      error: data.error ? data.error.toString() : null
    };
  };

  uploadMedia = async ({
    mediaPath,
    videoTag,
    increasedDetectionAccuracy,
    stateCallback,
    exportCallback,
    exportToken
  }: UploadMediaParams): Promise<SecureRedactUploadResponse> => {
    const data = await this.#makeAuthenticatedPostRequest(
      this.#buildUrlPath(SecureRedactEndpoints.UPLOAD_MEDIA),
      {
        media_path: mediaPath,
        video_tag: videoTag,
        increased_detection_accuracy: increasedDetectionAccuracy,
        state_callback: stateCallback,
        export_callback: exportCallback,
        export_token: exportToken
      }
    );

    if (typeof data.media_id !== 'string') {
      throw new SecureRedactError('Invalid media_id type returned', 500);
    }
    if (typeof data.file_info !== 'object') {
      throw new SecureRedactError('Invalid file_info type returned', 500);
    }

    return {
      fileInfo: {
        name: data.file_info?.name?.toString() || '',
        mimetype: data.file_info?.mimetype?.toString() || '',
        size: parseInt(data.file_info?.size || '0')
      },
      mediaId: data.media_id,
      message: data.message ? data.message.toString() : undefined,
      error: data.error ? data.error.toString() : null
    };
  };
}

export { SecureRedactSDK };
export default SecureRedactSDK;
