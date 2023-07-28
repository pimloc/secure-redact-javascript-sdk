import SecureRedactError from './SecureRedactError.ts';

class SecureRedactRequest {
  static makePostRequest = async (
    url: string,
    data: Record<string, string>,
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
      } else {
        throw new SecureRedactError(err.message, 500);
      }
    }
  };

  static makeGetRequest = async (
    url: string,
    params: Record<string, string>,
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
      } else {
        throw new SecureRedactError(err.message, 500);
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
      } else {
        throw new SecureRedactError(err.message, 500);
      }
    }
  };

  static buildBody = (obj: Record<string, string>) => {
    try {
      return JSON.stringify(obj);
    } catch (err) {
      throw new Error(`Failed to stringify body: ${err.message}`);
    }
  };

  static buildQueryParams = (obj: Record<string, string>) => {
    const queryParams = [];
    for (const key in obj) {
      const value = encodeURIComponent(obj[key]);
      queryParams.push(`${encodeURIComponent(key)}=${value}`);
    }

    return queryParams.join('&');
  };
}

export { SecureRedactRequest };
