import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { CleaningDashboardComponent } from './pages/cleaning-dashboard/cleaning-dashboard.component';
import { ResultsReviewComponent } from './components/results-review/results-review.component';

const routes: Routes = [
  {
    path: '',
    component: CleaningDashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'results',
    component: ResultsReviewComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CleaningRoutingModule {}
