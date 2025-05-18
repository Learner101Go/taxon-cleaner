import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of, tap } from 'rxjs';
import { environment } from 'apps/ui/src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authTokenKey = 'symbiota2_token';
  // private isAuthenticated$ = new BehaviorSubject<boolean>(false);
  private isAuthenticated$ = new BehaviorSubject<boolean>(
    !!localStorage.getItem(this.authTokenKey)
  );
  private base = environment.s2Url; // http://localhost:8080/api/v1

  constructor(private http: HttpClient) {
    this.isAuthenticated$.next(!!localStorage.getItem(this.authTokenKey));
  }
  login(username: string, password: string) {
    return this.http
      .post<{ accessToken: string }>(`${this.base}/auth/login`, {
        username,
        password,
      })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.authTokenKey, res.accessToken);
          this.isAuthenticated$.next(true);
        })
      );
  }

  logout() {
    localStorage.removeItem(this.authTokenKey);
    this.isAuthenticated$.next(false);
  }

  isAuthenticated() {
    return this.isAuthenticated$.value;
  }

  getToken() {
    return localStorage.getItem(this.authTokenKey);
  }
}
