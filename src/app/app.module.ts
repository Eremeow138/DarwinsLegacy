import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatFormFieldDefaultOptions, MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";

const defaultFieldConfig: MatFormFieldDefaultOptions = {
  appearance: "outline",
};

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, BrowserAnimationsModule],
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: defaultFieldConfig }],
  bootstrap: [AppComponent],
})
export class AppModule {}
