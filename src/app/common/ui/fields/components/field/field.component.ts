import { Component, Input, ViewEncapsulation } from "@angular/core";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-field",
  templateUrl: "./field.component.html",
  styleUrls: ["./field.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class FieldComponent {
  @Input()
  control = new FormControl("");

  @Input()
  placeholder = "";

  @Input()
  prefixIconName = "";

  @Input()
  isClearable = false;
}
