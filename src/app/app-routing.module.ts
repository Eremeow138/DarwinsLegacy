import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { EmojisComponent } from "./components/emojis/emojis.component";
import { EmojiStatusEnum } from "./models/data";

const routes: Routes = [
  { path: ":status", component: EmojisComponent },
  { path: "", redirectTo: EmojiStatusEnum.GENERAL, pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
