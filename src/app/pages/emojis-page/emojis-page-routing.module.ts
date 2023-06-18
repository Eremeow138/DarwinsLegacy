import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { EmojiStatusEnum } from "src/app/pages/emojis-page/models/emojis";
import { EmojisComponent } from "./components/emojis/emojis.component";
import { EmojisCheckParamGuard } from "./guards/emojis-check-param.guard";

const routes: Routes = [
  { path: ":status", component: EmojisComponent, canActivate: [EmojisCheckParamGuard] },
  { path: "", redirectTo: EmojiStatusEnum.GENERAL, pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmojisPageRoutingModule {}
