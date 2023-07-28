type SecureRedactUsername = string;
type SecureRedactBearerToken = string;
type SecureRedactMediaId = string;

enum SecureRedactEndpoints {
  FETCH_TOKEN = 'token',
  FETCH_MEDIA_STATUS = 'info',
  CREATE_USER = 'signup'
}

type SecureRedactResponseValue = string | number | null;
type SecureRedactResponseData = Record<string, SecureRedactResponseValue>;

type FetchTokenParams = SecureRedactUsername | null;

interface FetchMediaStatusParams {
  mediaId: SecureRedactMediaId;
  username?: SecureRedactUsername;
}

interface SecureRedactMediaInfo {
  mediaId: SecureRedactMediaId;
  username: SecureRedactUsername;
  error: string | null;
  status: string;
}

interface CreateUserParams {
  username: SecureRedactUsername;
}

interface SecureRedactUserInfo {
  username: SecureRedactUsername;
  error: string | null;
  msg: string | null;
}

export {
  SecureRedactResponseData,
  SecureRedactBearerToken,
  SecureRedactEndpoints,
  SecureRedactMediaInfo,
  FetchTokenParams,
  FetchMediaStatusParams,
  CreateUserParams,
  SecureRedactUserInfo
};
