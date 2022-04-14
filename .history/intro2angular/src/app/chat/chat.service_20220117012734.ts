import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../auth.service';

@Injectable()
export class ChatService {
  private socket: any;

  constructor(private _router:Router, private _authenticationService: AuthService) {
    if (this._authenticationService.isLoggedIn) {
      //this.socket = io();
      this.socket = io('http://localhost:3000/',{
        withCredentials: true,
        extraHeaders: {
          "my-custom-header": "abcd"
        }
      });
      //this.socket = io.connect('/db');
    } else {
      this._router.navigate(['Home']);
    }
  }

  on(eventName: string, callback: { (msg: any): void; (arg0: any): void; }) {
    if (this.socket) {
      this.socket.on(eventName, function(data: any) {
        callback(data);
      });
    }
  };

  emit(eventName: string, data: { text: string; }) {
    if (this.socket) {
      this.socket.emit(eventName, data);
    }
  };

  removeListener(eventName: string) {
    if (this.socket) {
      this.socket.removeListener(eventName);
    }
  };
}


