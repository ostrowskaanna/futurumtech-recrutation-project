import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, take } from 'rxjs';
import { SharedDataService } from 'src/app/shared-data.service';
import { Campaign } from 'src/app/interfaces/campaign';

@Component({
  selector: 'app-campaign-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.css']
})

export class CampaignFormComponent {

  campaignForm: FormGroup;

  constructor(protected service: SharedDataService, @Inject(MAT_DIALOG_DATA) private data: 'add' | 'update') {
    this.campaignForm = new FormGroup({
      campaignName: new FormControl('', Validators.required),
      keywords: new FormControl('', Validators.required),
      bidAmount: new FormControl('', [Validators.required, Validators.min(0)]),
      campaignFund: new FormControl('', Validators.required),
      status: new FormControl('', Validators.required),
      town: new FormControl('', Validators.required),
      radius: new FormControl('', Validators.required)
    });
  }

  ngOnInit() {
    // fill form with values if update
    if (this.data === 'update') {
      this.service.getSelectedCampaign().pipe(take(1)).subscribe(selectedCampaign => {
        if (selectedCampaign) {
          console.log(selectedCampaign);
          this.campaignForm.patchValue({
            campaignName: selectedCampaign.name,
            keywords: selectedCampaign.keywords,
            bidAmount: selectedCampaign.bidAmount,
            campaignFund: selectedCampaign.campaignFund,
            status: selectedCampaign.status,
            town: selectedCampaign.town,
            radius: selectedCampaign.radius,
          });
        }
      });
    }
  }

  // Handle form submission
  onSubmit() {
    if (this.campaignForm.valid) {
      if(this.data === 'add')
        this.service.addNewCampaign(this.campaignForm);
      else if(this.data === 'update') 
        this.service.updateSelectedCampaign(this.campaignForm);  
    } else {
      console.log('Form is invalid');
    }
  }
}
