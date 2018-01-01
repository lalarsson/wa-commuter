import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Wa Commuter';
  constructor(
    private http: HttpClient) {
      this.http.get<any>("http://www.kotoden.co.jp/publichtm/kotoden/time/jikoku_new/01k_down.htm").toPromise().then(this.log);
    }

    private log(message: string) {
      console.log(message);
  }
}
