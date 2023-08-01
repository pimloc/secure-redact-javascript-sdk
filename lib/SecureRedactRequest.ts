import SecureRedactError from './SecureRedactError.ts';
import { SecureRedactParamsData } from './types.ts';

class SecureRedactRequest {
  static makePostRequest = async (
    url: string,
    data: SecureRedactParamsData,
    auth: string
  ) => {
    try {
      return await SecureRedactRequest.makeRequest(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: auth
        },
        body: JSON.stringify(data)
      });
    } catch (err) {
      if (err instanceof SecureRedactError) {
        throw err;
      } else if (err instanceof Error) {
        throw new SecureRedactError(err, 500);
      } else {
        throw err;
      }
    }
  };

  static makeGetRequest = async (
    url: string,
    params: SecureRedactParamsData,
    auth: string
  ) => {
    try {
      return await SecureRedactRequest.makeRequest(
        `${url}?${SecureRedactRequest.buildQueryParams(params)}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: auth
          }
        }
      );
    } catch (err) {
      if (err instanceof SecureRedactError) {
        throw err;
      } else if (err instanceof Error) {
        throw new SecureRedactError(err, 500);
      } else {
        throw err;
      }
    }
  };

  static makeRequest = async (url: string, options?: RequestInit) => {
    try {
      const response = await fetch(url, options);
      const body = await response.json();
      if (!response.ok || body.error) {
        const text = body.error || 'Error';
        throw new SecureRedactError(
          `Received invalid response: ${text}`,
          response.status
        );
      }
      return body;
    } catch (err) {
      if (err instanceof SecureRedactError) {
        throw err;
      } else if (err instanceof Error) {
        throw new SecureRedactError(err, 500);
      } else {
        throw err;
      }
    }
  };

  static buildBody = (obj: SecureRedactParamsData) => {
    try {
      return JSON.stringify(obj);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to stringify body: ${err.message}`);
      } else {
        throw err;
      }
    }
  };

  static buildQueryParams = (obj: SecureRedactParamsData) => {
    const queryParams = [];
    for (const key in obj) {
      let item = obj[key];
      if (item !== undefined) {
        item = item.toString();
        queryParams.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(item)}`
        );
      }
    }

    return queryParams.join('&');
  };
}

export { SecureRedactRequest };
