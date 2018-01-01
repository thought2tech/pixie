import { Component, OnInit } from '@angular/core';
import {KeybindsService} from '../../../services/keybinds.service';
import {WindowRef} from '../../../utility/window-ref';
import {DataService} from '../../../services/data.service';
import {CanvasService} from '../../../services/canvas.service';

declare var fabric: any;

@Component({
  selector: 'app-rounded-corners',
  templateUrl: './rounded-corners.component.html',
  styleUrls: ['./rounded-corners.component.css']
})
export class RoundedCornersComponent implements OnInit {

  constructor(private dataService: DataService, private canvas: CanvasService, private windowRef: WindowRef) { }

  ngOnInit() {
  }

  radius = 50;
  rect: any;

  startRoundedCorners (e) {
    if (this.dataService.activePanel === 'round') return;

    this.dataService.openPanel('round', e);

    this.rect = new fabric.Rect({
      width: this.canvas.originalWidth,
      height: this.canvas.originalHeight,
      rx: this.radius,
      ry: this.radius,
      opacity: 1,
      fill: 'transparent',
      name: 'rounding-rect',
      stroke: '#fff',
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      ignore: true
    });

    this.canvas.fabric.add(this.rect);
    this.canvas.fabric.renderAll();
  };

  adjustPreview() {
    if ( ! this.rect) return;

    this.rect.set({
      rx: this.radius, ry: this.radius
    });
    this.canvas.fabric.renderAll();
  };

  cancel(leavePanel?) {
    this.canvas.fabric.remove(this.rect);
    this.rect  = false;
    this.radius = 50;
    this.canvas.fabric.renderAll();

    if ( !leavePanel) {
      this.dataService.activePanel = false;
    }
  };

  apply() {
    Object.assign(this.dataService.editorCustomActions.roundCorners,this.radius);

    this.canvas.fabric.remove(this.rect);
    this.canvas.zoom(1);

    this.canvas.fabric.clipTo = function(ctx) {
      this.rect.render(ctx);
      this.canvas.fabric.clipTo = false;
    };
    let data = this.canvas.fabric.toDataURL(); //canvas.getDataURL();
    this.canvas.fabric.clear();
    this.cancel();

    this.canvas.loadMainImage(data, false, false, false, function() {
      this.dataService.$apply(function() {
        this.history.add('Round Corners', 'panorama-wide-angle');
      });
    });
  };

  // this.dataService.$on('tab.changed', function(e, newTab, oldTab) {
  //   if (oldTab === 'basics' && $scope.rect && newTab !== 'basics') {
  //     this.cancel();
  //   }
  // });

  // this.dataService.$watch('activePanel', function(newPanel, oldPanel) {
  //   if (newPanel !== 'round' && oldPanel === 'round') {
  //     $scope.cancel(true);
  //   }
  // });

}
