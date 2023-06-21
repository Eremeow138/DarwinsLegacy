import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TableComponent } from "./components/table/table.component";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TooltipModule } from "../tooltip/tooltip.module";

const exports = [TableComponent];
@NgModule({
  declarations: [...exports],
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, TooltipModule],
  exports: [...exports],
})
export class TableModule {}
