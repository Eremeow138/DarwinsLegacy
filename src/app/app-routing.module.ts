import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "emojis",
    loadChildren: () => import("./pages/emojis-page/emojis-page.module").then((m) => m.EmojisPageModule),
  },
  { path: "", redirectTo: "emojis", pathMatch: "full" },
  { path: "**", redirectTo: "emojis" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
