import { Component, OnInit } from '@angular/core';
import {CanvasService} from '../../../services/canvas.service';

@Component({
  selector: 'app-objects-panel-controller',
  templateUrl: './objects-panel-controller.component.html',
  styleUrls: ['./objects-panel-controller.component.css']
})
export class ObjectsPanelControllerComponent implements OnInit {

  constructor(private canvas: CanvasService) { }

  ngOnInit() {
  }

}
