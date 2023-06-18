import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { EmojisComponent } from "./components/emojis/emojis.component";
import { TableModule } from "src/app/common/ui/table/table.module";
import { MenuModule } from "src/app/common/ui/menu/menu.module";
import { MatPaginatorIntl, MatPaginatorModule } from "@angular/material/paginator";
import { getRussianPaginatorIntl } from "./utils/material-utils";
import { EmojisPageRoutingModule } from "./emojis-page-routing.module";

const exports = [EmojisComponent];
@NgModule({
  declarations: [...exports],
  imports: [CommonModule, EmojisPageRoutingModule, TableModule, MenuModule, MatPaginatorModule],
  providers: [{ provide: MatPaginatorIntl, useValue: getRussianPaginatorIntl() }],
  exports: [...exports],
})
export class EmojisPageModule {}
