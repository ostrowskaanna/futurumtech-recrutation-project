import { Component} from '@angular/core';
import { SharedDataService } from 'src/app/shared-data.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CampaignFormComponent } from '../campaign-form/campaign-form.component';
import { Campaign } from 'src/app/interfaces/campaign';

@Component({
  selector: 'app-campaigns-list',
  templateUrl: './campaigns-list.component.html',
  styleUrls: ['./campaigns-list.component.css']
})
export class CampaignsListComponent {

  selectedProduct = this.service.getSelectedProduct();
  selectedCampaign = this.service.getSelectedCampaign();

  campaigns: Campaign[] | undefined;

  constructor(protected service: SharedDataService, private dialog: MatDialog) {}

  ngOnInit() {
    this.getCampaigns();
  }

  getCampaigns() {
    this.selectedProduct.subscribe((product) => {
      this.campaigns = product?.campaigns;
    })
    console.log(this.campaigns);
  }

  showProducts() {
    this.service.setDisplayType('products');
    this.service.deselectProduct();
  }

  openDialog(mode: string){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '40vw';
    dialogConfig.height = '70vh';
    dialogConfig.data = mode
    this.service.dialogRef = this.dialog.open(CampaignFormComponent, dialogConfig);
  }

  deleteSelected() {
    this.service.deleteSelectedCampaign();
  }

}
