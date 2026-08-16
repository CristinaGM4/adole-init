import {Component,inject,OnInit} from '@angular/core';import{RouterOutlet}from'@angular/router';import{AuthService}from'./core/auth/auth.service';
@Component({selector:'app-root',imports:[RouterOutlet],templateUrl:'./app.html'}) export class App implements OnInit{private auth=inject(AuthService);ngOnInit(){this.auth.restoreSession();}}
