import { Component, OnInit } from '@angular/core';
import {CanvasService} from '../../services/canvas.service';
import {DrawingService} from '../../services/drawing.service';
import {DataService} from '../../services/data.service';
import {WindowRef} from '../../utility/window-ref';
import {HistoryService} from '../../services/history.service';

@Component({
  selector: 'app-drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.css']
})
export class DrawingComponent implements OnInit {


  constructor(private canvas: CanvasService, private drawing: DrawingService, private dataService: DataService,
              private windowRef: WindowRef, private history: HistoryService) { }

  ngOnInit() {}

  window = this.windowRef.nativeWindow;
  // window.fb = this.canvas.fabric;

  changeBrush (brush, $event) {
    // openPanel('drawing', $event);

    if ( ! this.drawing.isEnabled) {
      this.drawing.enable();
    }

    this.drawing.changeBrush(brush);
  };

  finishAddingDrawingsToCanvas() {
    this.dataService.activePanel = false;

    if (this.canvas.mainImage) {
      this.canvas.fabric.setActiveObject(this.canvas.mainImage);
    }

    this.canvas.fabric.forEachObject(function(obj) {
      if (obj.name === 'freeDrawing') {
        obj.removeOnCancel = false;
      }
    });

    this.drawing.disable();
    this.history.add('added drawing', 'brush');
  };

  cancelAddingDrawingsToCanvas() {
    this.canvas.fabric.forEachObject(function (obj) {
      if (obj.name === 'freeDrawing' && obj.removeOnCancel) {
        this.canvas.fabric.remove(obj);
      }
    });

    this.drawing.disable();
    this.canvas.fabric.renderAll();
    this.dataService.activePanel = false;
  };

  // $rootScope.$on('tab.changed', function(e, name) {
  //   if (name !== 'drawing') {
  //     this.drawing.disable();
  //     this.cancelAddingDrawingsToCanvas();
  //   }
  // });

  // this.canvas.fabric.on('path:created', function(e) {
  //   if (this.drawing.isEnabled) {
  //     e.path.setOptions(this.canvas.imageStatic);
  //     e.path.name = 'freeDrawing';
  //     e.path.removeOnCancel = true;
  //   }
  // });

}
