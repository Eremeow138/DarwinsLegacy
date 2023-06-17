import { Component, Input, ViewEncapsulation } from "@angular/core";

export interface IMenuLink {
  label: string;
  link: string;
}

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class MenuComponent {
  @Input()
  menuLinks: Array<IMenuLink> = [];
}
