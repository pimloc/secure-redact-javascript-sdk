import { buildBasicToken } from './utils/buildBasicToken.ts';
import { SecureRedactRequest } from './SecureRedactRequest.ts';
import {
  FetchMediaStatusParams,
  FetchTokenParams,
  SecureRedactBearerToken,
  SecureRedactEndpoints,
  SecureRedactMediaInfo,
  SecureRedactResponseData
} from './types.ts';
import SecureRedactError from './SecureRedactError.ts';

class SecureRedactSDK {
  readonly #BASE_URL: string = 'https://app.secureredact.co.uk';
  readonly #VERSION: string = 'v2';
  readonly #MAX_RETRIES: number = 1;
  #basicToken: string;
  #bearerToken: string;

  constructor({
    clientId,
    clientSecret
  }: {
    clientId: string;
    clientSecret: string;
  }) {
    this.#basicToken = buildBasicToken(clientId, clientSecret);
  }

  #setBearerToken = (token: string) => (this.#bearerToken = `Bearer ${token}`);

  #buildUrlPath = (endpoint: string) =>
    `${this.#BASE_URL}/api/${this.#VERSION}/${endpoint}`;

  #makeAuthenticatedGetRequest = async (
    url: string,
    params: Record<string, string>,
    username: string,
    retries = 0
  ): Promise<SecureRedactResponseData> => {
    if (username || !this.#bearerToken) {
      await this.fetchToken(username);
    }
    try {
      return await SecureRedactRequest.makeGetRequest(
        url,
        params,
        this.#bearerToken
      );
    } catch (err) {
      if (
        err instanceof SecureRedactError &&
        err.statusCode === 403 &&
        retries < this.#MAX_RETRIES
      ) {
        return await this.#makeAuthenticatedGetRequest(
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

  fetchToken = async (
    username: FetchTokenParams = null
  ): Promise<SecureRedactBearerToken> => {
    const data = await SecureRedactRequest.makeGetRequest(
      this.#buildUrlPath(SecureRedactEndpoints.FETCH_TOKEN),
      username ? { username } : {},
      this.#basicToken
    );
    // store token for future use
    this.#setBearerToken(data.token);
    return data.token as SecureRedactBearerToken;
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
    return {
      mediaId: data.media_id,
      username: data.username,
      error: data.error,
      status: data.status
    } as SecureRedactMediaInfo;
  };
}

export { SecureRedactSDK };
export default SecureRedactSDK;
