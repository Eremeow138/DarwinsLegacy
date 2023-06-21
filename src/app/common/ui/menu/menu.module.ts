import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MenuComponent } from "./components/menu/menu.component";
import { MatListModule } from "@angular/material/list";
import { RouterModule } from "@angular/router";

const exports = [MenuComponent];
@NgModule({
  declarations: [...exports],
  imports: [CommonModule, RouterModule, MatListModule],
  exports: [...exports],
})
export class MenuModule {}
