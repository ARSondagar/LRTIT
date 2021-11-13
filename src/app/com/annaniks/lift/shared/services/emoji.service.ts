import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EmojiInterface } from '../types/emoji.interface';
import EmojiJson from "../data/emoji.json";

@Injectable({
  providedIn: 'root',
})
export class EmojiService {

  constructor() {
  }

  getEmojis(): EmojiInterface[] {
    return EmojiJson;
  }
}
