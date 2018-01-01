import { Component, OnInit } from '@angular/core';
import {CanvasService} from '../../../services/canvas.service';
import {HistoryService} from '../../../services/history.service';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-canvas-background',
  templateUrl: './canvas-background.component.html',
  styleUrls: ['./canvas-background.component.css']
})
export class CanvasBackgroundComponent implements OnInit {

  constructor(private canvas: CanvasService, private history: HistoryService, private dataService: DataService) { }

  ngOnInit() {
  }

  setBackground = function(color) {
    this.canvas.fabric.setBackgroundColor(color);
    this.canvas.fabric.renderAll();
  };

  apply = function() {
    this.dataService.activePanel = false;
    this.history.add('Canvas Color', 'format-color-fill');
  };

  cancel = function() {
    this.dataService.activePanel = false;
    this.canvas.fabric.setBackgroundColor('');
    this.canvas.fabric.renderAll();
  };

}
