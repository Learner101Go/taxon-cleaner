import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // Public login route
  {
    path: 'cleaning',
    loadChildren: () =>
      import('./modules/cleaning/cleaning.module').then(
        (m) => m.CleaningModule
      ),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  // Protected cleaning/dashboard
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./modules/cleaning/cleaning.module').then(
        (m) => m.CleaningModule
      ),
  },
  // Redirect root to login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // Wildcard for 404
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
