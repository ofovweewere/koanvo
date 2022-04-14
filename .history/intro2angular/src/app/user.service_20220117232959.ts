import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { ACTION_LOGIN, ACTION_LOGOUT } from './store/actions/appActions';
import { AuthService } from './auth.service';

interface myData
{
  message: string,
  success: boolean
}
interface quoteStatus
{
  success: boolean,
  message: string
}
interface isLoggedIn
{
  status: boolean,
  username: string
}

interface logoutStatus
{
  success: boolean
}
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private store: Store <any>, private Auth: AuthService) { }

  getSomeData()
  {
    return this.http.get<myData>('api/index/rend',{withCredentials:true});

  }

  updateQuote(value:any)
  {
    return this.http.post<quoteStatus>('/db/quote', {
      value
    })
  }

  isLoggedIn(): Observable <isLoggedIn>
  {
    return this.http.get<isLoggedIn>('/db/isLoggedIn');
  }

  logout()
  {
    return this.http.get<logoutStatus>('/db/logout');
  }

  getAllState()
  {
    //this.store.dispatch({type:'LOGOUT'});
    return this.store.select('appReducer');
  }

  inform()
  {
    return this.store.dispatch({type:ACTION_LOGIN,payload: [this.Auth.usernameInfo] });
  }

  informLogout()
  {
    return this.store.dispatch({type:'LOGOUT'});
  }

}
