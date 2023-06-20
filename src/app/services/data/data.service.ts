import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { IEmoji, EmojiStatusEnum, LocalStorageKeyEnum } from "src/app/pages/emojis-page/models/emojis";
import { map, Observable, of, tap } from "rxjs";

export interface IPageData<T> {
  items: Array<T>;
  count: number;
}

@Injectable({
  providedIn: "root",
})
export class DataService {
  // Токен в формате base64 с неиспользуемого гитхаб аккаунта.
  // Без токена запрос может завалиться.
  // Хранить токен как есть не получится, так как гитхаб его найдет и аннулирует.
  // Поэтому храним в base64, а перед использованием декодируем.
  private base64Token =
    "Z2l0aHViX3BhdF8xMUJBVjM0VVEwSWlrc2p6SFJpcEEyX0xyVEluWDhyS09hS0VkRmd3SHNvQkFhaW1lVUIxY2VPQ1I3M0QxN1NzaW1FNjVDSDdOUUkzcmpvU1pU";
  constructor(private http: HttpClient) {}

  /**
   * Изменить статус эмодзи
   * @param emojiName - имя эмодзи
   * @param status - новый статус
   */
  changeEmojiStatus(emojiName: string, status: EmojiStatusEnum): Observable<string> {
    const emojis = this.getEmojisFromLocalStorage();
    const updatedEmojis = emojis?.map((emoji) => (emoji.name === emojiName ? { ...emoji, status: status } : emoji));
    localStorage.setItem(LocalStorageKeyEnum.ALL_EMOJIS, JSON.stringify(updatedEmojis));
    return of("success");
  }

  /**
   * Получить эмодзи для страницы.
   * Метод пытается получить эмодзи из локального хранилища.
   * Если локальное хранилище пустое - идем за эмодзиами в гитхаб и записываем в свое локальное хранилище.
   * @param countPerPage - количество эмодзи на странице
   * @param pageNumber - текущий номер страницы
   * @param pageName - адрес страницы (идентичен статусу эмодзи)
   * @param searchText - текст поиска
   */
  getEmojisDataForPage(
    countPerPage: number,
    pageNumber = 1,
    pageName = EmojiStatusEnum.GENERAL,
    searchText: string | null = null
  ): Observable<IPageData<IEmoji>> {
    const emojisFromLocalStorage = this.getEmojisFromLocalStorage();
    // Если эмодзи есть в локал сторейдж, возвращаем их
    if (emojisFromLocalStorage) {
      const pageData = this.filterAndCutEmojis(emojisFromLocalStorage, countPerPage, pageNumber, pageName, searchText);
      return of(pageData);
    }
    // Иначе, идем за ними на гитхаб
    return this.http
      .get<Record<string, string>>("https://api.github.com/emojis", {
        headers: new HttpHeaders({
          Authorization: `Bearer ${atob(this.base64Token)}`,
        }),
      })
      .pipe(
        map((emojis) => {
          return Object.entries(emojis).map(
            ([name, imageUrl]) => ({ name, imageUrl, status: EmojiStatusEnum.GENERAL } as IEmoji)
          );
        }),
        tap((emojis) => {
          // Попутно запишем эмодзи в локал сторедж
          localStorage.setItem(LocalStorageKeyEnum.ALL_EMOJIS, JSON.stringify(emojis));
        }),
        map((emojis) => {
          const pageData = this.filterAndCutEmojis(emojis, countPerPage, pageNumber, pageName, searchText);
          return pageData;
        })
      );
  }

  /**
   * Получить эмодзи из локал сторейджа
   */
  private getEmojisFromLocalStorage(): Array<IEmoji> | undefined {
    const allEmojisFromLocalStorageString = localStorage.getItem(LocalStorageKeyEnum.ALL_EMOJIS);

    if (allEmojisFromLocalStorageString) {
      return JSON.parse(allEmojisFromLocalStorageString) as Array<IEmoji>;
    }
    return undefined;
  }

  /**
   * Фильтруем и обрезаем список эмодзи
   * @param countPerPage - количество эмодзи на странице
   * @param pageNumber - текущий номер страницы
   * @param pageName - адрес страницы (идентичен статусу эмодзи)
   * @param searchText - текст поиска
   */
  private filterAndCutEmojis(
    emojis: Array<IEmoji>,
    countPerPage: number,
    pageNumber: number,
    pageName: EmojiStatusEnum,
    searchText: string | null
  ): IPageData<IEmoji> {
    const filteredByPageNameEmojis = this.filterEmojiByPageName(emojis, pageName);

    const filteredBySearchTextEmojis = searchText
      ? filteredByPageNameEmojis.filter((emoji) => emoji.name.toLowerCase().includes(searchText))
      : filteredByPageNameEmojis;

    const cutEmojis = filteredBySearchTextEmojis.slice(
      countPerPage * pageNumber - countPerPage,
      countPerPage * pageNumber
    );

    return { items: cutEmojis, count: filteredBySearchTextEmojis.length };
  }

  /**
   * Фильтруем и обрезаем список эмодзи.
   * Для каждой страницы свой набор эмодзи.
   * @param emojis - количество эмодзи на странице
   * @param pageName - адрес страницы (идентичен статусу эмодзи)
   */
  private filterEmojiByPageName(emojis: Array<IEmoji>, pageName = EmojiStatusEnum.GENERAL): Array<IEmoji> {
    return emojis.filter((emoji) => {
      switch (pageName) {
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
