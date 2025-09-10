import { Routes } from '@angular/router';
import { RegistrationComponent } from './registration/registration.component';
import { HomeComponent } from './home/home.component';
import { ManageComponent } from './manage/manage.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'manage', component: ManageComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' }
];
