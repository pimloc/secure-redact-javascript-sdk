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
  CreateUserParams
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
      params: Record<string, string>,
      auth: string
    ) => Promise<SecureRedactResponseData>,
    url: string,
    params: Record<string, string>,
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
    data: Record<string, string>,
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
    params: Record<string, string>,
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
      throw new SecureRedactError('Invalid mediaId type', 500);
    }
    if (typeof data.username !== 'string') {
      throw new SecureRedactError('Invalid username type', 500);
    }
    if (typeof data.status !== 'string') {
      throw new SecureRedactError('Invalid status type', 500);
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
      throw new SecureRedactError('Invalid username type', 500);
    }

    return {
      username: data.username,
      msg: data.msg ? data.msg.toString() : null,
      error: data.error ? data.error.toString() : null
    };
  };
}

export { SecureRedactSDK };
export default SecureRedactSDK;
