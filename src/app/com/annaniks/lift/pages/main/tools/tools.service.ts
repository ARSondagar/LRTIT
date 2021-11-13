import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';

@Injectable()

export class ToolsService {
    constructor(private _httpClient: HttpClient) { }
}