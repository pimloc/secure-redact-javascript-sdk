type SecureRedactUsername = string;
type SecureRedactBearerToken = string;
type SecureRedactMediaId = string;

enum SecureRedactEndpoints {
  FETCH_TOKEN = 'token',
  FETCH_MEDIA_STATUS = 'info'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SecureRedactResponseData = Record<string, any>;

type FetchTokenParams = SecureRedactUsername | null;

interface FetchMediaStatusParams {
  mediaId: SecureRedactMediaId;
  username?: SecureRedactUsername;
}

interface SecureRedactMediaInfo {
  mediaId: SecureRedactMediaId;
  username: SecureRedactUsername;
  error: string;
  status: string;
}

export {
  SecureRedactResponseData,
  SecureRedactBearerToken,
  SecureRedactEndpoints,
  SecureRedactMediaInfo,
  FetchTokenParams,
  FetchMediaStatusParams
};
