import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TariffTransaction, Tariff, TariffPayload, Promocode } from '../../../core/models/tariff';
import { ServerResponse } from '../../../core/models/server-response';


@Injectable()

export class TariffService {

    constructor(private _httpClient: HttpClient) { }


    public getTariff(): Observable<ServerResponse<Tariff[]>> {
        return this._httpClient.get<ServerResponse<Tariff[]>>('')
    }

    public getTariffTransaction(offset: number, limit: number): Observable<ServerResponse<TariffTransaction[]>> {
        let params = new HttpParams()
        params = params.set('offset', offset.toString())
        params = params.set('limit', limit.toString())
        return this._httpClient.get<ServerResponse<TariffTransaction[]>>('tariff/transaction', { params })
    }

    public postTariff(tariff: TariffPayload): Observable<ServerResponse<{}>> {
        return this._httpClient.post<ServerResponse<{}>>('tariff', tariff)
    }

    public getPromocodes(promocode: string): Observable<ServerResponse<Promocode>> {
        return this._httpClient.get<ServerResponse<Promocode>>('promo-code/' + promocode)
    }

}