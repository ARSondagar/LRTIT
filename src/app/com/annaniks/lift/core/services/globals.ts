import { Injectable } from '@angular/core';
import { TariffBasePrices } from '../models/tariff';

@Injectable({
    providedIn: 'root'
})
export class Globals {
    tariffBasePrices: TariffBasePrices = {
        activity: 350,
        autoposting: 490,
        autosubscribe: 350,
        direct: 240,
        fortuna: 90,
        watchStories: 190,
        likes: 249,
        unsubscribe: 100,
        manageComments: 100
    }
}