import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, Subscription, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JdmService {
  private url = "http://localhost:8888";

  constructor(private http:HttpClient) { }

  public reqJdm(word :any) : Observable<any> {
    return this.http.get(this.url+"/reqJDM/"+word);
    }
}
