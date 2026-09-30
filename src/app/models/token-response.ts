export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;

  patient?: string;
  need_patient_banner?: boolean;

  encounter?: string;
  user?: string;
  username?: string;
  tenant?: string;
  smart_style_url?: string;
}