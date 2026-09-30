import { Routes } from '@angular/router';
import { Landing } from './components/landing/landing';
import { Medications } from './components/medications/medications';
import { Observations } from './components/observations/observations';

export const routes: Routes = [
    {
        path: '',
        component: Landing
    },
    {
        path: 'vitals',
        component: Observations
    },
    {
        path: 'medications',
        component: Medications
    }
];
