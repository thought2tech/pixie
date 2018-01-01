import { Component, OnInit } from '@angular/core';
import {CanvasService} from '../../../services/canvas.service';
import {HistoryService} from '../../../services/history.service';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-resize',
  templateUrl: './resize.component.html',
  styleUrls: ['./resize.component.css']
})
export class ResizeComponent implements OnInit {

  constructor(private canvas: CanvasService, private history: HistoryService, private dataService: DataService) { }

  ngOnInit() {
  }

  constrainProportions = true;
  percent = 100;
  width: any;
  height: any;
  usePercentages: any;

  startResizer = function($event) {
    this.width  = this.usePercentages ? 100 : Math.ceil(this.canvas.originalWidth);
    this.height = this.usePercentages ? 100 : Math.ceil(this.canvas.originalHeight);
    this.history.add('beforeResize', false, true);
    this.canvas.zoom(1);
    this.openPanel('resize', $event);
  };

  /**
   * Toggle resizing mode between percentages and pixles.
   *
   * @param {boolean} usePercentages
   */
  togglePercentages = function(usePercentages) {
    if (usePercentages) {
      this.width = (this.width / this.canvas.originalWidth) * 100;
      this.height = (this.height / this.canvas.originalHeight) * 100;
    } else {
      this.width = (this.width * this.canvas.originalWidth) / 100;
      this.height = (this.height * this.canvas.originalHeight) / 100;
    }
  };

  apply = function() {
    let currentWidth  = Math.ceil(this.canvas.original.width),
      currentHeight = Math.ceil(this.canvas.original.height),
      newWidth      = Math.ceil(this.width),
      newHeight     = Math.ceil(this.height);

    let widthScale;
    let heightScale;

    if (this.usePercentages) {
      widthScale    = this.width / 100;
      heightScale   = this.height / 100;
    } else {
      widthScale    = this.width / this.canvas.originalWidth;
      heightScale   = this.height / this.canvas.originalHeight;
    }

    if (currentWidth === newWidth && currentHeight === newHeight) return;

    this.resize(widthScale, heightScale);

    this.dataService.activePanel = false;
    this.history.add('resize', 'open-width');
    this.canvas.fitToScreen();
  };

  close = function() {
    this.dataService.activePanel = false;
    this.canvas.fitToScreen();
  };

  aspectToHeight = function(newWidth) {
    if ( ! this.constrainProportions) return;

    if (this.usePercentages) {
      this.height = newWidth;
    } else {
      let wRatio = parseFloat((this.canvas.originalWidth / newWidth).toPrecision(3));
      this.height = Math.ceil(this.canvas.originalHeight / wRatio);
    }
  };

  aspectToWidth = function(newHeight) {
    if ( ! this.constrainProportions) return;

    if (this.usePercentages) {
      this.width = newHeight;
    } else {
      let hRatio = parseFloat((this.canvas.originalHeight / newHeight).toPrecision(3));
      this.width = Math.floor(this.canvas.originalWidth / hRatio);
    }
  };

  resize(widthScale, heightScale) {
    let newHeight = Math.round(this.canvas.originalHeight * heightScale),
      newWidth  = Math.round(this.canvas.originalWidth * widthScale);

    this.canvas.fabric.setHeight(newHeight);
    this.canvas.fabric.setWidth(newWidth);
    this.canvas.originalWidth = newWidth;
    this.canvas.originalHeight = newHeight;

    let objects = this.canvas.fabric.getObjects();
    for (let i in objects) {
      let scaleX = objects[i].scaleX;
      let scaleY = objects[i].scaleY;
      let left = objects[i].left;
      let top = objects[i].top;

      let tempScaleX = scaleX * widthScale;
      let tempScaleY = scaleY * heightScale;
      let tempLeft = left * widthScale;
      let tempTop = top * heightScale;

      objects[i].scaleX = tempScaleX;
      objects[i].scaleY = tempScaleY;
      objects[i].left = tempLeft;
      objects[i].top = tempTop;

      objects[i].setCoords();
    }

    this.canvas.fabric.renderAll();
  }

}
