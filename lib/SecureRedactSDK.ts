import { buildBasicToken } from './utils/buildBasicToken.ts';
import { buildQueryParams } from './utils/buildQueryParams.ts';
import { makeRequest } from './utils/makeRequest.ts';

const DEFAULT_VERSION: string = 'v2';
const DEFAULT_BASE_URL: string = 'https://app.secureredact.co.uk';

class SecureRedactSDK {
  #baseUrl = DEFAULT_BASE_URL;
  #version = DEFAULT_VERSION;
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
    `${this.#baseUrl}/api/${this.#version}/${endpoint}`;

  #makeGetRequest = async (
    endpoint: string,
    params: Record<string, string>,
    auth: string
  ) => {
    try {
      return await makeRequest(
        `${this.#buildUrlPath(endpoint)}?${buildQueryParams(params)}`,
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
