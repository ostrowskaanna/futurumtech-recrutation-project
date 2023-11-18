import { Component } from '@angular/core';
import { SharedDataService } from 'src/app/shared-data.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent {

  selectedProduct = this.service.getSelectedProduct();

  constructor(protected service: SharedDataService) {}
}
