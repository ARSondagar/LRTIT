import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    CreatePostData,
    GetPostAndStoriesData,
    PostOrStory,
    CreateStoryData
} from '../../../core/models/autoposting';
import { ServerResponse } from '../../../core/models/server-response';
import { UtilsService } from '../../../core/services/utils.service';

@Injectable()
export class AutoPostingService {

    constructor(
        private _httpClient: HttpClient,
        private _utilsService: UtilsService
    ) { }

    public createPost(data: CreatePostData): Observable<ServerResponse<any>> {
        const formData: FormData = this._utilsService.createFormData(data);
        return this._httpClient.post<ServerResponse<any>>('auto-posting/post', formData);
    }

    public createStory(data: CreateStoryData): Observable<ServerResponse<any>> {
        const formData: FormData = this._utilsService.createFormData(data);
        return this._httpClient.post<ServerResponse<any>>('auto-posting/story', formData);
    }

    public getPostsAndStoriesByMonth(data: GetPostAndStoriesData): Observable<ServerResponse<PostOrStory[]>> {
        const params = this._utilsService.createHttpParams(data);
        return this._httpClient.get<ServerResponse<PostOrStory[]>>('auto-posting/by-month', { params })
    }
}