export interface IEmoji {
  name: string;
  imageUrl: string;
  status: EmojiStatusEnum;
}

export enum EmojiStatusEnum {
  GENERAL = "general",
  FAVORITE = "favorite",
  REMOVED = "removed",
}

export enum LocalStorageKeyEnum {
  ALL_EMOJIS = "--AllEmojis",
  EMOJIS_PAGE_STATE = "--EmojisPageState",
}
