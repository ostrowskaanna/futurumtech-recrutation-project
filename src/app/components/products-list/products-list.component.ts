import { Component } from '@angular/core';
import { Product } from 'src/app/interfaces/product';
import { SharedDataService } from 'src/app/shared-data.service';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent {

  data: Product[] = [];
  selectedProduct = this.service.getSelectedProduct();

  constructor(protected service: SharedDataService) {}

  ngOnInit() {
    this.data = this.service.getDataFromStorage();
    this.service.setDisplayType('products');
  }

  showCampaigns() {
    this.service.setDisplayType('campaigns');
    this.service.deselectCampaign();
  }

}
