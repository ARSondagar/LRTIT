import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class UtilsService {

    constructor(private _httpClient: HttpClient) { }


    public createFormData<T>(body: T): FormData {
        const formData: FormData = new FormData();
        if (body) {
            const keys: string[] = Object.keys(body);
            keys.map((element, index) => {
                if (body[element]) {
                    if (body[element] instanceof File) {
                        const file = body[element];
                        formData.append(element, file, file.name);
                    } else {
                        let parsedElement = body[element];
                        if (typeof parsedElement != 'string') {
                            if (!(parsedElement instanceof Date)) {
                                parsedElement = JSON.stringify(parsedElement);
                            }
                        }
                        formData.append(element, parsedElement);
                    }
                }
            })
        }
        return formData;
    }

    public createHttpParams<T>(body: T): HttpParams {
        let params = new HttpParams();
        if (body) {
            const keys = Object.keys(body);
            if (keys && keys.length > 0) {
                keys.map((element: string, index: number) => {
                    if (body[element]) {
                        params = params.append(element, body[element].toString())
                    }
                })
            }
        }
        return params;
    }

    public getCountriesAndCities(): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('skip', 'true');
        return this._httpClient.get<any>('../../../../assets/countries.min.json', { headers });
    }
}