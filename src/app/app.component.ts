import { Component } from '@angular/core';
import { SharedDataService } from './shared-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';

  constructor(private service: SharedDataService) { }

  ngOnInit() {
    this.service.getDataFromFile().subscribe((data) => {
      localStorage.setItem(this.service.dataStorageKey, JSON.stringify(data));
    },
    (error) => {
      console.error(error);
    });
  }
}

