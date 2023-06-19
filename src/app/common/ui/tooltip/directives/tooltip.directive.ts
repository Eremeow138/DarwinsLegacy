import {
  ApplicationRef,
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewContainerRef,
} from "@angular/core";
import { TooltipComponent } from "../components/tooltip/tooltip.component";

export enum TooltipPosition {
  ABOVE = "above",
  BELOW = "below",
  LEFT = "left",
  RIGHT = "right",
  DEFAULT = "above",
}

@Directive({
  selector: "[appTooltip]",
  exportAs: "appTooltip",
})
export class TooltipDirective implements OnChanges, OnDestroy {
  @Input() tooltipText = "";
  @Input() tooltipImage = "";
  @Input() tooltipTitle = "";
  @Input() position: TooltipPosition = TooltipPosition.DEFAULT;
  @Input() showDelay = 0;
  @Input() hideDelay = 0;
  @Input() maxWidth = "";
  @Input() disabled = false;

  private componentRef: ComponentRef<TooltipComponent> | null = null;
  private showTimeout?: number;
  private hideTimeout?: number;

  constructor(
    private elementRef: ElementRef<HTMLInputElement>,
    private appRef: ApplicationRef,
    private viewContainerRef: ViewContainerRef
  ) {}

  @HostListener("mouseenter")
  onMouseEnter(): void {
    this.initializeTooltip();
  }

  @HostListener("mouseleave")
  onMouseLeave(): void {
    this.setHideTooltipTimeout();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { disabled } = changes;
    if (disabled && disabled.currentValue === true && disabled.previousValue === false) {
      this.destroy();
    }
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  /**
   * Инициализируем тултип.
   */
  initializeTooltip(): void {
    if (!this.componentRef) {
      window.clearInterval(this.hideDelay);

      this.componentRef = this.viewContainerRef.createComponent(TooltipComponent);

      this.setTooltipComponentProperties();

      document.body.appendChild(this.componentRef.location.nativeElement);
      this.showTimeout = window.setTimeout((): void => {
        this.showTooltip();
      }, this.showDelay);
    }
  }

  setHideTooltipTimeout(): void {
    this.hideTimeout = window.setTimeout((): void => {
      this.destroy();
    }, this.hideDelay);
  }

  private setTooltipComponentProperties(): void {
    if (this.componentRef) {
      this.componentRef.instance.text = this.tooltipText;
      this.componentRef.instance.title = this.tooltipTitle;
      this.componentRef.instance.position = this.position;
      this.componentRef.instance.maxWidth = this.maxWidth;
      this.componentRef.instance.imgLink = this.tooltipImage;

      const left = this.elementRef.nativeElement.getBoundingClientRect().left + window.pageXOffset;
      const right = this.elementRef.nativeElement.getBoundingClientRect().right + window.pageXOffset;
      const top = this.elementRef.nativeElement.getBoundingClientRect().top + window.pageYOffset;
      const bottom = this.elementRef.nativeElement.getBoundingClientRect().bottom + window.pageYOffset;

      switch (this.position) {
        case TooltipPosition.ABOVE: {
          this.componentRef.instance.left = Math.round((right - left) / 2 + left);
          this.componentRef.instance.top = Math.round(top);
          break;
        }
        case TooltipPosition.BELOW: {
          this.componentRef.instance.left = Math.round((right - left) / 2 + left);
          this.componentRef.instance.top = Math.round(bottom);
          break;
        }
        case TooltipPosition.RIGHT: {
          this.componentRef.instance.left = Math.round(right);
          this.componentRef.instance.top = Math.round(top + (bottom - top) / 2);
          break;
        }
        case TooltipPosition.LEFT: {
          this.componentRef.instance.left = Math.round(left);
          this.componentRef.instance.top = Math.round(top + (bottom - top) / 2);
          break;
        }
        default: {
          break;
        }
      }
    }
  }

  private showTooltip(): void {
    if (this.componentRef) {
      this.componentRef.instance.visible = true;
      this.componentRef.changeDetectorRef.detectChanges();
    }
  }

  private destroy(): void {
    if (this.componentRef) {
      window.clearInterval(this.showTimeout);
      window.clearInterval(this.hideTimeout);
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.changeDetectorRef.detectChanges();
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }
}
