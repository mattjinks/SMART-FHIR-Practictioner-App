import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

const PILL =
  `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M345-120q-94 0-159.5-65.5T120-345q0-45 17-86t49-73l270-270q32-32 73-49t86-17q94 0 159.5 65.5T840-615q0 45-17 86t-49 73L504-186q-32 32-73 49t-86 17Zm266-286 107-106q20-20 31-47t11-56q0-60-42.5-102.5T615-760q-29 0-56 11t-47 31L406-611l205 205ZM345-200q29 0 56-11t47-31l106-107-205-205-107 106q-20 20-31 47t-11 56q0 60 42.5 102.5T345-200Z"/></svg>`

const VITAL_SIGN =
  `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M326-171q-15-11-22-28l-92-241H40v-80h228l92 244 184-485q7-17 22-28t34-11q19 0 34 11t22 28l92 241h172v80H692l-92-244-184 485q-7 17-22 28t-34 11q-19 0-34-11Z"/></svg>`
@Component({
  selector: 'app-landing',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  private matIconRegistry = inject(MatIconRegistry);

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
    
    this.matIconRegistry.setDefaultFontSetClass(
      'material-symbols-outlined'
    );
    // `iconRegistry.addSvgIcon('thumbs-up', sanitizer.bypassSecurityTrustResourceUrl('thumb_up.svg'));`

    iconRegistry.addSvgIconLiteral('pill', sanitizer.bypassSecurityTrustHtml(PILL));
    iconRegistry.addSvgIconLiteral('vital_sign', sanitizer.bypassSecurityTrustHtml(VITAL_SIGN));
  }
}

// <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="none"><path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z"/></svg>