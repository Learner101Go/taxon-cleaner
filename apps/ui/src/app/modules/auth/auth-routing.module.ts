import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'logout', redirectTo: 'login' },
  // Protect any further sub-routes here if you add signup, reset password, etc.
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
