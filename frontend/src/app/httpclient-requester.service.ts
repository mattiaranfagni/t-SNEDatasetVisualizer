import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HTTPClientRequesterService {
  readonly baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  request(dataset: string, perplexity : string): Promise<any> {
    const body = new HttpParams()
    .set('dataset', dataset)
    .set('perplexity', perplexity);
  
    return this.http.post( this.baseUrl + '/tsne',
      body.toString(),
      {
        headers: new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded')
      }
    ).toPromise();
  }

  reqimage(): Promise<any> {
    const body = new HttpParams();
  
    return this.http.post( this.baseUrl + '/mnistimg',
      body.toString(),
      {
        headers: new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded')
      }
    ).toPromise();
  }
}


