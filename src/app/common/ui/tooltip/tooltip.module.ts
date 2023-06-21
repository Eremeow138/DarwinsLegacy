import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TooltipDirective } from "./directives/tooltip.directive";
import { TooltipComponent } from "./components/tooltip/tooltip.component";
const exports = [TooltipDirective];
@NgModule({
  declarations: [...exports, TooltipComponent],
  imports: [CommonModule],
  exports: [...exports],
})
export class TooltipModule {}
