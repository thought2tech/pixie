import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { ObjectsPanelControllerComponent } from './core/object/objects-panel-controller/objects-panel-controller.component';
import { CanvasService } from './services/canvas.service';
import { DataService } from './services/data.service';
import { KeybindsService } from './services/keybinds.service';

import { WindowRef } from './utility/window-ref';
import {HistoryService} from './services/history.service';
import {SimpleShapesService} from './services/simple-shapes.service';
import {FiltersService} from './services/filters.service';
import { CanvasBackgroundComponent } from './core/basic/canvas-background/canvas-background.component';
import { ResizeComponent } from './core/basic/resize/resize.component';
import { RotateComponent } from './core/basic/rotate/rotate.component';
import { RoundedCornersComponent } from './core/basic/rounded-corners/rounded-corners.component';
import { CropComponent } from './core/crop/crop/crop.component';
import { DrawingComponent } from './core/drawing/drawing.component';
import { RenderBrushComponent } from './core/render-brush/render-brush.component';
import { FilterControllerComponent } from './core/filters/filter-controller/filter-controller.component';
import {GlobalsService} from './services/globals.service';


@NgModule({
  declarations: [
    AppComponent,
    ObjectsPanelControllerComponent,
    CanvasBackgroundComponent,
    ResizeComponent,
    RotateComponent,
    RoundedCornersComponent,
    CropComponent,
    DrawingComponent,
    RenderBrushComponent,
    FilterControllerComponent
  ],
  imports: [
    BrowserModule,
    MatDialogModule
  ],
  providers: [CanvasService, DataService, KeybindsService, WindowRef, HistoryService, SimpleShapesService, FiltersService, GlobalsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
