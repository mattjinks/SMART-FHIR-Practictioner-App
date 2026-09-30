import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { PatientBanner } from '../patient-banner/patient-banner';
import { Observations } from '../observations/observations';
import { Medications } from '../medications/medications';
import { Router } from '@angular/router';
import { SmartSessionService } from '../../services/smart-session-service';

@Component({
  selector: 'app-practictioner-launch',
  imports: [],
  templateUrl: './practictioner-launch.html',
  styleUrl: './practictioner-launch.css',
})
export class PractictionerLaunch {

  private http = inject(HttpClient);
  private router = inject(Router);
  private smartSessionService = inject(SmartSessionService);
  
  readonly LOCAL_STORAGE_TOKEN_ENDPOINT = 'token_endpoint';
  readonly LOCAL_STORAGE_ACCESS_TOKEN = 'token';
  readonly LOCAL_STORAGE_SMART_SESSION = 'smart_session';
  readonly LOCAL_STORAGE_ISS = 'iss';

  readonly iss = signal('');
  readonly launch = signal('');
  readonly authorizationEndpoint = signal('');
  readonly tokenEndpoint = signal('');
  
  readonly clientId = 'c7073e49-7c51-423d-8b0e-118c1f09c1ec';
  readonly redirectUri = 'http://localhost:4200';
  // readonly smartSession = signal<TokenResponse | null>(this.loadSmartSession());
  readonly smartSession = signal<TokenResponse | null>(null);
  readonly baseUrl = signal<string | null>(localStorage.getItem(this.LOCAL_STORAGE_ISS));
  
  async ngOnInit() {
    const launchUrl = new URL(window.location.href);

    const issParam = launchUrl.searchParams.get('iss');
    const launchParam = launchUrl.searchParams.get('launch');
    const code = launchUrl.searchParams.get('code');
    
    // if (this.smartSession()) {
    //   console.log('SMART session already exists:', this.smartSession());
    //   console.log('patient needs banner: ', this.smartSession()?.need_patient_banner);
    //   return;
    // }

    console.log('SMART session:', this.smartSession());
    console.log('gonna make a request to get the token');

    if (code) {
      this.makeTokenRequest(code);
      return;
    }

    if (!issParam || !launchParam) {
      console.error('Missing required query parameters: iss and launch');
      return;
    }

    this.iss.set(issParam);
    this.launch.set(launchParam);

    this.smartSessionService.setBaseUrl(issParam);

    const smartConfigurationUrl = `${this.iss()}/.well-known/smart-configuration`;

    console.log('SMART configuration URL:', smartConfigurationUrl);

    this.http.get<SmartConfiguration>(smartConfigurationUrl).subscribe({
      next: (configuration) => {
        console.log('SMART configuration:', configuration);
        this.authorizationEndpoint.set(configuration.authorization_endpoint);
        this.tokenEndpoint.set(configuration.token_endpoint);
        localStorage.setItem(this.LOCAL_STORAGE_TOKEN_ENDPOINT, configuration.token_endpoint);
        const redirectUrl = this.constructAuthorizationUrl();
        window.location.href = redirectUrl;
      },
      error: (error) => {
        console.error('Failed to retrieve SMART configuration:', error);
      }
    });
  }

  loadSmartSession(): TokenResponse | null {
    const storedSession = localStorage.getItem(this.LOCAL_STORAGE_SMART_SESSION);
    return storedSession ? JSON.parse(storedSession) as TokenResponse : null;
  }

  constructAuthorizationUrl(): string {
    const url = new URL(this.authorizationEndpoint());
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', this.redirectUri);
    url.searchParams.set('scope', 'openid fhirUser launch user/Observation.read user/Observation.write user/Patient.read user/MedicationRequest.read');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('aud', this.iss());
    url.searchParams.set('launch', this.launch());
    return url.href;
  }

  makeTokenRequest(code: string): void {
    const tokenEndpoint = localStorage.getItem(
      this.LOCAL_STORAGE_TOKEN_ENDPOINT
    );

    if (!tokenEndpoint) {
      console.error('Token endpoint not found in local storage');
      return;
    }

    const form = new URLSearchParams();

    form.set('grant_type', 'authorization_code');
    form.set('code', code);
    form.set('redirect_uri', this.redirectUri);
    form.set('client_id', this.clientId);

    this.http.post<any>(
      tokenEndpoint,
      form.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }
    ).subscribe({
      next: (tokenResponse) => {
        console.log('Token response:', tokenResponse);

        const session: TokenResponse = {
          access_token: tokenResponse.access_token,
          token_type: tokenResponse.token_type,
          expires_in: tokenResponse.expires_in,
          scope: tokenResponse.scope,
          patient: tokenResponse.patient,
          need_patient_banner: tokenResponse.need_patient_banner,
          encounter: tokenResponse.encounter,
          user: tokenResponse.user,
          username: tokenResponse.username,
          tenant: tokenResponse.tenant,
          smart_style_url: tokenResponse.smart_style_url
        };

        if (tokenResponse.patient) {
          console.log('Patient:', tokenResponse.patient);
        }

        localStorage.removeItem(
          this.LOCAL_STORAGE_TOKEN_ENDPOINT
        );

        this.smartSessionService.setSession(session);

        this.router.navigate(['/']);

      },

      error: (error) => {
        console.error('Token request failed:', error);
      }
    });
  }

}
