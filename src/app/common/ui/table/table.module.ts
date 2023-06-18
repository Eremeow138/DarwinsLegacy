import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TableComponent } from "./components/table/table.component";
import { MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

const exports = [TableComponent];
@NgModule({
  declarations: [...exports],
  imports: [CommonModule, MatTableModule, MatTooltipModule, MatButtonModule, MatIconModule],
  exports: [...exports],
})
export class TableModule {}
