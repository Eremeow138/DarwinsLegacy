import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { TooltipPosition } from "../../directives/tooltip.directive";

@Component({
  selector: "app-tooltip",
  templateUrl: "./tooltip.component.html",
  styleUrls: ["./tooltip.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {
  @Input()
  visible = false;
  position: TooltipPosition = TooltipPosition.DEFAULT;
  text = "";
  title = "";
  left = 0;
  top = 0;
  maxWidth = "";
  imgLink = "";
}
