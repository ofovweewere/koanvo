import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

interface registerResponse
{
  success: boolean
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //private loggedInStatus = JSON.parse(localStorage.getItem('loggedIn')|| 'false');
  private loggedInStatus = false;
  private username = "Guest";
  constructor(private http: HttpClient) { }

  setLoggedIn(value: boolean)
  {
    this.loggedInStatus = value;
    //window.localStorage.setItem('loggedIn', 'true');
  }
  setUsername(value: string)
  {
    this.username = value;
    //localStorage.setItem("loggedIn", 'true');
  }
  get usernameInfo()
  {
    return this.username;
  }
  get isLoggedIn()
  {
    //return JSON.parse(localStorage.getItem('loggedIn')|| this.loggedInStatus.toString());
    return this.loggedInStatus;
  }
  getUserDetails(username:any, password:any)
  {
    return this.http.post('api/index/login', {
      username,
      password
    });
  }

  registerUser(username:any, password:any)
  {
    return this.http.post<registerResponse>('/api/index/register/', {
      username,
      password
    });
  }
}
