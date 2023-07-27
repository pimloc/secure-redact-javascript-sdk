import { buildBasicToken } from './utils/buildBasicToken.ts';
import { SecureRedactRequest } from './SecureRedactRequest.ts';

class SecureRedactSDK {
  readonly #BASE_URL: string = 'https://app.secureredact.co.uk';
  readonly #VERSION: string = 'v2';
  #basicToken;

  constructor({
    clientId,
    clientSecret
  }: {
    clientId: string;
    clientSecret: string;
  }) {
    this.#basicToken = buildBasicToken(clientId, clientSecret);
  }

  #buildUrlPath = (endpoint: string) =>
    `${this.#BASE_URL}/api/${this.#VERSION}/${endpoint}`;

  #makeGetRequest = async (
    endpoint: string,
    params: Record<string, string>,
    auth: string
  ) => {
    try {
      return await SecureRedactRequest.makeRequest(
        `${this.#buildUrlPath(endpoint)}?${SecureRedactRequest.buildQueryParams(
          params
        )}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: auth
          }
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  fetchToken = async ({ userId = null }: { userId: string | null }) => {
    const res = await this.#makeGetRequest(
      'token',
      userId ? { userId } : {},
      `Basic ${this.#basicToken}`
    );
    console.log(res);
  };
}

export default SecureRedactSDK;
