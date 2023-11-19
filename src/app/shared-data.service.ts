import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, combineLatest, debounceTime, distinctUntilChanged, map, of, switchMap, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Product } from './interfaces/product';
import { Campaign } from './interfaces/campaign';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CampaignFormComponent } from './components/campaign-form/campaign-form.component';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  private dataUrl = 'assets/data.json';
  dataStorageKey = 'data';

  private displayTypeSource = new BehaviorSubject<string>('products');
  currentDisplayType$ = this.displayTypeSource.asObservable();

  private selectedProductSource = new BehaviorSubject<Product | undefined>(undefined);
  selectedProduct$ = this.selectedProductSource.asObservable();

  private selectedCampaignSource = new BehaviorSubject<Campaign | undefined>(undefined);
  selectedCampaign$ = this.selectedCampaignSource.asObservable();

  searchKeywords$ = new BehaviorSubject<string>('');
  
  // Keywords from other campaigns 
  keywords$: Observable<string[]> = this.searchKeywords$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((word) => {
      const selectedProduct = this.selectedProductSource.value;
      if (selectedProduct) {
        const campaigns = selectedProduct.campaigns;
        const matchingKeywords = campaigns.map((campaign) => campaign.keywords)
          .flat()
          .filter((keyword, index, self) => self.indexOf(keyword) === index)
          .filter((keyword) => keyword.toLowerCase().includes(word.toLowerCase()));
        return of(matchingKeywords);
      } else {
        return of([]);
      }
    })
  );

  dialogRef: MatDialogRef<CampaignFormComponent> | undefined;

  constructor(private http: HttpClient) { }
  
  // read data from json
  getDataFromFile(): Observable<any> {
    return this.http.get(this.dataUrl).pipe(
      catchError((error: any) => {
        console.error(error);
        return of([]);
      })
    );
  }

  // read data from localStorage 
  getDataFromStorage() {
    const storedDataString = localStorage.getItem(this.dataStorageKey);
    if (storedDataString) {
      const storedData = JSON.parse(storedDataString);
      return storedData.products;
    }
  }


  setDisplayType(newDisplayType: string) {
    this.displayTypeSource.next(newDisplayType);
  }

  // handle product selection 

  selectProduct(product: Product) {
    console.log("selecting product " + product.id);
    this.selectedProductSource.next(product);
  }

  deselectProduct() {
    this.selectedProductSource.next(undefined);
  }

  getSelectedProduct(): Observable<Product | undefined> {
    return this.selectedProduct$;
  }

  // handle campaign selection

  selectCampaign(campaign: Campaign) {
    console.log("selecting campaign " + campaign.id);
    this.selectedCampaignSource.next(campaign);
  }

  deselectCampaign() {
    this.selectedCampaignSource.next(undefined);
  }

  getSelectedCampaign(): Observable<Campaign | undefined> {
    return this.selectedCampaign$;
  }

  // handle CRUD operations on localStorage data 

  deleteSelectedCampaign() {
    const storedDataString = localStorage.getItem(this.dataStorageKey);
    const selectedProduct = this.selectedProductSource.value;
    const selectedCampaign = this.selectedCampaignSource.value;
  
    if (storedDataString && selectedProduct && selectedCampaign) {
      const storedData = JSON.parse(storedDataString);
      const productId = selectedProduct.id;
      const campaignId = selectedCampaign.id;
      console.log("deleting campaign " + campaignId + " from product " + productId);
  
      // Skip the campaign with the given id in the given product
      storedData.products = storedData.products.map((product: any) => {
        if (product.id === productId) {
          product.campaigns = product.campaigns.filter((campaign: any) => campaign.id !== campaignId);
          // Change product source to update campaigns list
          this.selectedProductSource.next(product);
        }
        return product;
      });
  
      // Update data
      localStorage.setItem(this.dataStorageKey, JSON.stringify(storedData));
      this.deselectCampaign();
    }
  }


  addNewCampaign(campaignForm: FormGroup) {
    const selectedProduct = this.selectedProductSource.value;

    if (selectedProduct) {
      const newCampaign: Campaign = {
        id: selectedProduct.campaigns.length + 1,
        name: campaignForm.value.campaignName,
        keywords: campaignForm.value.keywords.split(' ').map((keyword: string) => keyword.trim()),
        bidAmount: campaignForm.value.bidAmount,
        campaignFund: campaignForm.value.campaignFund,
        status: campaignForm.value.status,
        town: campaignForm.value.town,
        radius: campaignForm.value.radius,
      };
      // Add new campaign
      selectedProduct.campaigns.push(newCampaign);

      const storedDataString = localStorage.getItem(this.dataStorageKey);
      if (storedDataString) {
        const storedData = JSON.parse(storedDataString);
        storedData.products = storedData.products.map((product: Product) => {
          // Change selected product 
          if (product.id === selectedProduct.id) {
            return selectedProduct;
          }
          return product;
        });

        // Update data
        localStorage.setItem(this.dataStorageKey, JSON.stringify(storedData));
        this.deselectCampaign();

        if (this.dialogRef) 
          this.dialogRef.close();
      }
    }
  }

  updateSelectedCampaign(campaignForm: FormGroup): void {
    const storedDataString = localStorage.getItem(this.dataStorageKey);
    const selectedProduct = this.selectedProductSource.value;
    const selectedCampaign = this.selectedCampaignSource.value;
  
    if (storedDataString && selectedProduct && selectedCampaign) {
      const storedData = JSON.parse(storedDataString);
      const productId = selectedProduct.id;
      const campaignId = selectedCampaign.id;
      console.log("updating campaign " + campaignId + " in product " + productId);
  
      storedData.products = storedData.products.map((product: any) => {
        if (product.id === productId) {
          // Update campaign with the given id in the given product
          product.campaigns = product.campaigns.map((campaign: any) => {
            if (campaign.id === campaignId) {
              return {
                id: campaign.id,
                name: campaignForm.value.campaignName,
                keywords: campaignForm.value.keywords,
                bidAmount: campaignForm.value.bidAmount,
                campaignFund: campaignForm.value.campaignFund,
                status: campaignForm.value.status,
                town: campaignForm.value.town,
                radius: campaignForm.value.radius,
              };
            }
            return campaign;
          });
          // Change product source to update campaigns list
          this.selectedProductSource.next(product);
        }
        return product;
      });
  
      // Update data
      localStorage.setItem(this.dataStorageKey, JSON.stringify(storedData));
      this.deselectCampaign();

      if (this.dialogRef) {
        this.dialogRef.close();
      }
    }
  }
}
