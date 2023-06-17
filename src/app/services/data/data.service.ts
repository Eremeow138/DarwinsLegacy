import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { IEmoji, EmojiStatusEnum, LocalStorageKeyEnum } from "src/app/models/data";
import { map, Observable, of, tap } from "rxjs";

export interface IPageData<T> {
  items: Array<T>;
  count: number;
}

@Injectable({
  providedIn: "root",
})
export class DataService {
  constructor(private http: HttpClient) {}

  changeEmojiStatus(emojiName: string, status: EmojiStatusEnum): Observable<string> {
    const emojis = this.getEmojisFromLocalStorage();
    const updatedEmojis = emojis?.map((emoji) => (emoji.name === emojiName ? { ...emoji, status: status } : emoji));
    localStorage.setItem(LocalStorageKeyEnum.ALL_EMOJIS, JSON.stringify(updatedEmojis));
    return of("success");
  }

  getEmojisFromLocalStorage(): Array<IEmoji> | undefined {
    const allEmojisFromLocalStorageString = localStorage.getItem(LocalStorageKeyEnum.ALL_EMOJIS);

    if (allEmojisFromLocalStorageString) {
      return JSON.parse(allEmojisFromLocalStorageString) as Array<IEmoji>;
    }
    return undefined;
  }

  getEmojis(countPerPage: number, pageNumber = 1, status = EmojiStatusEnum.GENERAL): Observable<IPageData<IEmoji>> {
    const allEmojisFromLocalStorage = this.getEmojisFromLocalStorage();
    if (allEmojisFromLocalStorage) {
      const filteredeEmojis = this.filterEmojiByStatus(allEmojisFromLocalStorage, status);
      return of({
        items: filteredeEmojis.slice(countPerPage * pageNumber - countPerPage, countPerPage * pageNumber),
        count: filteredeEmojis.length,
      });
    }

    return this.http
      .get<Record<string, string>>("https://api.github.com/emojis", {
        // токен взят с неиспользуемого гитхаб аккаунта
        headers: new HttpHeaders({ Authorization: "Bearer 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" }),
      })
      .pipe(
        map((emojis) => {
          return Object.entries(emojis).map(
            ([name, imageUrl]) => ({ name, imageUrl, status: EmojiStatusEnum.GENERAL } as IEmoji)
          );
        }),
        tap((emojis) => {
          localStorage.setItem(LocalStorageKeyEnum.ALL_EMOJIS, JSON.stringify(emojis));
        }),
        map((emojis) => {
          const filteredeEmojis = this.filterEmojiByStatus(emojis, status);
          return {
            items: filteredeEmojis.slice(countPerPage * pageNumber - countPerPage, countPerPage * pageNumber),
            count: filteredeEmojis.length,
          };
        })
      );
  }

  private filterEmojiByStatus(emojis: Array<IEmoji>, status = EmojiStatusEnum.GENERAL): Array<IEmoji> {
    return emojis.filter((emoji) => {
      switch (status) {
        case EmojiStatusEnum.GENERAL:
          return emoji.status === EmojiStatusEnum.GENERAL || emoji.status === EmojiStatusEnum.FAVORITE;
        case EmojiStatusEnum.FAVORITE:
          return emoji.status === EmojiStatusEnum.FAVORITE;
        case EmojiStatusEnum.REMOVED:
          return emoji.status === EmojiStatusEnum.REMOVED;
        default:
          return false;
      }
    });
  }
}
