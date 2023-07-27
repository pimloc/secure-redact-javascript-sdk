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

  fetchToken = async ({ userId = null }: { userId: string | null }) => {
    const res = await SecureRedactRequest.makeGetRequest(
      this.#buildUrlPath('token'),
      userId ? { userId } : {},
      `Basic ${this.#basicToken}`
    );
    console.log(res);
  };
}

export default SecureRedactSDK;
