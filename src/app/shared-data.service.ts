import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, combineLatest, map, of, switchMap, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Product } from './interfaces/product';
import { Campaign } from './interfaces/campaign';

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

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getDataFromFile().subscribe((data) => {
      localStorage.setItem(this.dataStorageKey, JSON.stringify(data));
    },
    (error) => {
      console.error(error);
    });
  }

  // read data from json
  getDataFromFile(): Observable<any> {
    return this.http.get(this.dataUrl).pipe(
      catchError((error: any) => {
        console.error(error);
        return of([]);
      })
    );
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

  deleteSelectedCampaign(): Observable<any> {
    return of(localStorage.getItem(this.dataStorageKey)).pipe(
      switchMap((storedDataString: string | null) => {
        const product = this.selectedProductSource.value;
        const campaign = this.selectedCampaignSource.value;
        if (storedDataString && product && campaign) {
          const storedData = JSON.parse(storedDataString);
          const productId = product.id;
          const campaignId = campaign.id;
          console.log("deleting campaign " + campaignId + " from product " + productId);
          
          // skip the campaign with given id in given product 
          const updatedProducts = storedData.products.map((product: any) => {
            if (product.id === productId) {
              product.campaigns = product.campaigns.filter((campaign: any) => campaign.id !== campaignId);
            }
            return product;
          });

          console.log(updatedProducts);

          // update data 
          localStorage.setItem(this.dataStorageKey, JSON.stringify({ products: updatedProducts }));

          return of(updatedProducts);
        } else {
          return of(null);
        }
      }),
      catchError((error: any) => {
        console.error(error);
        return of([]);
      })
    );
  }

}
