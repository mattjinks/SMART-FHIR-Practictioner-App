import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SmartSessionService {

  private readonly LOCAL_STORAGE_SMART_SESSION = 'smart_session';
  private readonly LOCAL_STORAGE_ISS = 'iss';
  private readonly LOCAL_STORAGE_PATIENT = 'patient';

  readonly smartSession = signal<TokenResponse | null>(
    this.loadSmartSession()
  );

  readonly baseUrl = signal<string | null>(
    localStorage.getItem(this.LOCAL_STORAGE_ISS)
  );

  setSession(session: TokenResponse): void {
    this.smartSession.set(session);

    localStorage.setItem(
      this.LOCAL_STORAGE_SMART_SESSION,
      JSON.stringify(session)
    );
  }

  setBaseUrl(baseUrl: string): void {
    this.baseUrl.set(baseUrl);

    localStorage.setItem(
      this.LOCAL_STORAGE_ISS,
      baseUrl
    );
  }

  getAccessToken(): string | null {
    return this.smartSession()?.access_token ?? null;
  }

  getPatientId(): string | null {
    return this.smartSession()?.patient ?? null;
  }

  getBaseUrl(): string | null {
    return this.baseUrl();
  }

  hasSession(): boolean {
    return this.smartSession() !== null;
  }

  needPatientBanner(): boolean | undefined {
    return this.smartSession()?.need_patient_banner;
  }

  clearSession(): void {
    this.smartSession.set(null);
    this.baseUrl.set(null);

    localStorage.removeItem(
      this.LOCAL_STORAGE_SMART_SESSION
    );

    localStorage.removeItem(
      this.LOCAL_STORAGE_ISS
    );

    localStorage.removeItem(
      this.LOCAL_STORAGE_PATIENT
    )
  }

  private loadSmartSession(): TokenResponse | null {
    const storedSession = localStorage.getItem(
      this.LOCAL_STORAGE_SMART_SESSION
    );

    if (!storedSession) {
      return null;
    }

    try {
      return JSON.parse(storedSession) as TokenResponse;
    } catch {
      localStorage.removeItem(
        this.LOCAL_STORAGE_SMART_SESSION
      );

      return null;
    }
  }
}