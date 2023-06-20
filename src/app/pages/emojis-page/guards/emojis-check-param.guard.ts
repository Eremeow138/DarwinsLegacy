import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { EmojiStatusEnum, EMOJI_STATUS_PARAM } from "src/app/pages/emojis-page/models/emojis";

/**
 * Гвард, проверяющий корректность указания параметра для страницы эмодзи.
 */
@Injectable({
  providedIn: "root",
})
export class EmojisCheckParamGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const param = route.params[EMOJI_STATUS_PARAM];

    switch (param) {
      case EmojiStatusEnum.GENERAL:
      case EmojiStatusEnum.FAVORITE:
      case EmojiStatusEnum.REMOVED:
        return true;
      default:
        this.router.navigate([EmojiStatusEnum.GENERAL]);
        return false;
    }
  }
}
