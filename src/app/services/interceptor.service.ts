import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AccountService } from './account.service';
import { ConfigService } from './config.service';
import { Stock } from './stocks.model';
import 'rxjs/add/operator/do';

@Injectable()
export class InterceptorService implements HttpInterceptor{

  constructor(private accessService: AccountService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) : Observable<HttpEvent<any>> {
    const request = req.clone();
    request.headers.append('Accept','application/json');
    return next.handle(request).do( event => {
      if (event instanceof HttpResponse && event.url === ConfigService.get('api')){
        const stocks = event.body as Array<Stock>;
        let symbols = this.accessService.stocks.map(stock => stock.symbol);
        stocks.forEach(stock => {
          this.accessService.stocks.map(item => {
            if(stock.symbol === item.symbol) {
              item.price = stock.price;
              item.change = ((stock.price * 100) - (item.cost * 100)) / 100;
            }
          });
        });
        this.accessService.calculateValue();
        return stocks;
      }
    });
  }
}
