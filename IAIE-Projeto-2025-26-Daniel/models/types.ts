export interface MoloniTokenResponse {
  access_token: string;
  expires_in: number | Date;    //Access token expiry time in seconds or Date
  refresh_expires_in: number | Date; //Refresh token expiry time in seconds or Date
  token_type: string;
  refresh_token: string;
}
