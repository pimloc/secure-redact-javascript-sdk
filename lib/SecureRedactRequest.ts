import SecureRedactError from './SecureRedactError.ts';
import { SecureRedactParams, SecureRedactResponse } from './types/internal.ts';

class SecureRedactRequest {
  static makePostRequest = async (
    url: string,
    data: SecureRedactParams,
    auth: string
  ): Promise<SecureRedactResponse> => {
    try {
      return await SecureRedactRequest.makeRequest(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: auth
        },
        body: SecureRedactRequest.buildBody(data)
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
    params: SecureRedactParams,
    auth: string
  ): Promise<SecureRedactResponse> => {
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

  static makeRequest = async (
    url: string,
    options?: RequestInit
  ): Promise<SecureRedactResponse> => {
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
      return SecureRedactRequest.convertObjectToCamel(body);
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
  static buildBody = (obj: SecureRedactParams) => {
    try {
      const convertedObject = SecureRedactRequest.convertObjectToSnake(obj);
      return JSON.stringify(convertedObject);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to stringify body: ${err.message}`);
      } else {
        throw err;
      }
    }
  };

  static convertObjectToCamel = (
    obj: SecureRedactResponse
  ): SecureRedactResponse => {
    const convertedObject: SecureRedactResponse = {};

    (Object.keys(obj) as Array<keyof SecureRedactResponse>).forEach(key => {
      const camelCaseKey = SecureRedactRequest.snakeToCamel(key.toString());
      convertedObject[camelCaseKey] = obj[key];
    });

    return convertedObject;
  };

  static convertObjectToSnake = (
    obj: SecureRedactParams
  ): SecureRedactParams => {
    const convertedObject: SecureRedactParams = {};

    (Object.keys(obj) as Array<keyof SecureRedactParams>).forEach(key => {
      const snakeCaseKey = SecureRedactRequest.camelToSnake(key.toString());
      convertedObject[snakeCaseKey] = obj[key];
    });

    return convertedObject;
  };

  static camelToSnake = (key: string): string =>
    key.replace(/[A-Z]/g, match => `_${match.toLowerCase()}`);

  static snakeToCamel = (key: string): string =>
    key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

  static buildQueryParams = (obj: SecureRedactParams) => {
    const queryParams = [];
    for (const key in obj) {
      const item = obj[key];
      if (item !== undefined && item !== null) {
        queryParams.push(
          `${encodeURIComponent(
            SecureRedactRequest.camelToSnake(key)
          )}=${encodeURIComponent(item.toString())}`
        );
      }
    }

    return queryParams.join('&');
  };
}

export { SecureRedactRequest };
