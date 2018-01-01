import { Component, OnInit } from '@angular/core';
import {CanvasService} from '../../../services/canvas.service';
import {HistoryService} from '../../../services/history.service';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-rotate',
  templateUrl: './rotate.component.html',
  styleUrls: ['./rotate.component.css']
})
export class RotateComponent implements OnInit {

  constructor(private canvas: CanvasService, private history: HistoryService, private dataService: DataService) { }

  ngOnInit() {
  }

  angle = 0;

  startRotator($event) {
    this.history.add('rotate-original-state', 'backup', true);
    this.dataService.openPanel('rotate', $event);
  };

  applyRotation() {
    this.dataService.activePanel = false;
    this.history.add('rotation', 'rotate-right');
  };

  cancel() {
    this.history.load('rotate-original-state');
    this.dataService.activePanel = false;
    this.angle = 0;
  };

  //rotate properly by scaling canvas to new height after rotating main image by 90 degrees
  rotateProper (originalAngle) {
    this.canvas.zoom(1);
    let angle = (this.canvas.mainImage.getAngle() + originalAngle) % 360;

    let height = Math.abs(this.canvas.mainImage.getWidth()*(Math.sin(angle*Math.PI/180)))+Math.abs(this.canvas.mainImage.getHeight()*(Math.cos(angle*Math.PI/180))),
      width = Math.abs(this.canvas.mainImage.getHeight()*(Math.sin(angle*Math.PI/180)))+Math.abs(this.canvas.mainImage.getWidth()*(Math.cos(angle*Math.PI/180)));

    this.canvas.fabric.setWidth(width * this.canvas.currentZoom);
    this.canvas.fabric.setHeight(height * this.canvas.currentZoom);
    this.canvas.originalHeight = height;
    this.canvas.originalWidth  = width;
    this.canvas.mainImage.center();

    this.canvas.fabric.forEachObject(function(obj) {
      obj.rotate((obj.getAngle() + originalAngle) % 360);
      obj.setCoords();
    });

    this.dataService.editorCustomActions.rotate = originalAngle;
    this.canvas.fabric.renderAll();
    this.canvas.fitToScreen();
  };

  //only rotate the objects of canvas while leaving canvas width/height intact
  rotate (angle, direction) {
    if (angle > 360 || angle < 0) return;
    let resetOrigin = false;

    this.canvas.fabric.forEachObject(function(obj) {

      if (direction && direction === 'left') {
        angle = obj.getAngle() - 90;
      } else if (direction && direction === 'right') {
        angle = obj.getAngle() + 90;
      }

      if ((obj.originX !== 'center' || obj.originY !== 'center') && obj.centeredRotation) {
        this.setOriginToCenter && this.setOriginToCenter(obj);
        resetOrigin = true;
      }

      angle = angle > 360 ? 90 : angle < 0 ? 270 : angle;

      obj.setAngle(angle).setCoords();

      if (resetOrigin) {
        this.setCenterToOrigin && this.setCenterToOrigin(obj);
      }
    });

    this.canvas.fitToScreen();
    this.canvas.fabric.renderAll();
  };

  setOriginToCenter (obj) {
    obj._originalOriginX = obj.originX;
    obj._originalOriginY = obj.originY;

    let center = obj.getCenterPoint();

    obj.set({
      originX: 'center',
      originY: 'center',
      left: center.x,
      top: center.y
    });
  };

  setCenterToOrigin (obj) {
    let originPoint = obj.translateToOriginPoint(
      obj.getCenterPoint(),
      obj._originalOriginX,
      obj._originalOriginY);

    obj.set({
      originX: obj._originalOriginX,
      originY: obj._originalOriginY,
      left: originPoint.x,
      top: originPoint.y
    });
  };

}
