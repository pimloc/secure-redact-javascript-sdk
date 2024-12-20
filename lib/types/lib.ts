// general
type SecureRedactUsername = string;
type SecureRedactBearerToken = string;
type SecureRedactMediaId = string;

// fetch token
interface SecureRedactFetchTokenParams {
  username?: SecureRedactUsername;
}

interface SecureRedactFetchTokenResponse {
  token: SecureRedactBearerToken;
  error: string | null;
}

// fetch media status
interface SecureRedactFetchMediaStatusParams {
  mediaId: SecureRedactMediaId;
  username?: SecureRedactUsername;
}

interface SecureRedactMediaInfo {
  mediaId: SecureRedactMediaId;
  username: SecureRedactUsername;
  error: string | null;
  status: string;
}

// create user
interface SecureRedactCreateUserParams {
  username: SecureRedactUsername;
}

interface SecureRedactUserInfo {
  username: SecureRedactUsername;
  error: string | null;
  msg?: string;
}

interface SecureRedactFileInfo {
  path: string;
  name: string;
  type: string;
  size: number;
}

// upload media
interface SecureRedactUploadMediaParams {
  mediaPath: string;
  videoTag?: string;
  increasedDetectionAccuracy?: boolean;
  stateCallback?: string;
  exportCallback?: string;
  exportToken?: string;
  detectLicensePlates?: boolean;
  detectFaces?: boolean;
  file?: File | SecureRedactFileInfo;
  projectId?: string;
}

interface SecureRedactUploadResponse {
  fileInfo: {
    name: string;
    mimetype: string;
    size: number;
  };
  mediaId: SecureRedactMediaId;
  message?: string;
  error: string | null;
}

// redact media
interface SecureRedactRedactMediaParams {
  mediaId: SecureRedactMediaId;
  enlargeBoxes?: number;
  redactAudio?: boolean;
  blur?: 'pixelated' | 'smooth';
  username?: SecureRedactUsername;
}

interface SecureRedactRedactResponse {
  error: string | null;
}

// delete media
interface SecureRedactDeleteMediaParams {
  mediaId: SecureRedactMediaId;
}

interface SecureRedactDeleteMediaResponse {
  error: string | null;
  message: string;
  mediaId: SecureRedactMediaId;
}

// login user
interface SecureRedactLoginUserParams {
  username: SecureRedactUsername;
  mediaId: SecureRedactMediaId;
}

interface SecureRedactLoginResponse {
  redirectUrl: string;
  success: boolean;
}

// download media
interface SecureRedactDownloadMediaParams {
  username?: SecureRedactUsername;
  mediaId: SecureRedactMediaId;
}

interface SecureRedactDownloadMediaResponse {
  blob: Blob;
}

interface SecureRedactFetchProjectsParams {
  page?: number;
  pageSize?: number;
}

interface SecureRedactProjectInfo {
  projectId: string;
  name: string;
}

interface SecureRedactFetchProjectsResponse {
  projects: SecureRedactProjectInfo[];
}

export {
  SecureRedactMediaId,
  SecureRedactUsername,
  SecureRedactBearerToken,
  SecureRedactFetchTokenParams,
  SecureRedactFetchTokenResponse,
  SecureRedactFetchMediaStatusParams,
  SecureRedactMediaInfo,
  SecureRedactCreateUserParams,
  SecureRedactUserInfo,
  SecureRedactUploadMediaParams,
  SecureRedactUploadResponse,
  SecureRedactRedactMediaParams,
  SecureRedactRedactResponse,
  SecureRedactDeleteMediaParams,
  SecureRedactDeleteMediaResponse,
  SecureRedactLoginUserParams,
  SecureRedactLoginResponse,
  SecureRedactDownloadMediaParams,
  SecureRedactDownloadMediaResponse,
  SecureRedactFetchProjectsParams,
  SecureRedactFetchProjectsResponse,
  SecureRedactProjectInfo,
  SecureRedactFileInfo
};
