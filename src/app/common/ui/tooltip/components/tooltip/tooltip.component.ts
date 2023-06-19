import { Component } from "@angular/core";
import { TooltipPosition } from "../../directives/tooltip.directive";

@Component({
  selector: "app-tooltip",
  templateUrl: "./tooltip.component.html",
  styleUrls: ["./tooltip.component.scss"],
})
export class TooltipComponent {
  position: TooltipPosition = TooltipPosition.DEFAULT;
  text = "";
  title = "";
  left = 0;
  top = 0;
  visible = false;
  maxWidth = "";
  imgLink = "";
}
