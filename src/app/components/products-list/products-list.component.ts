import { Component } from '@angular/core';
import { SharedDataService } from 'src/app/shared-data.service';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent {

  data: any[] = [];
  selectedProduct = this.service.getSelectedProduct();

  constructor(protected service: SharedDataService) {}

  ngOnInit() {
    this.getData();
    this.service.setDisplayType('products');
  }

  // read data from localStorage 
  getData() {
    const storedDataString = localStorage.getItem(this.service.dataStorageKey);
    console.log(storedDataString);
    if (storedDataString) {
      const storedData = JSON.parse(storedDataString);
      this.data = storedData.products;
      console.log(this.data);
    }
  }

  showCampaigns() {
    this.service.setDisplayType('campaigns');
    this.service.deselectCampaign();
  }

}
