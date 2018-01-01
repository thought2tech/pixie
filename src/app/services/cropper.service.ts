import { Injectable } from '@angular/core';
import { CanvasService } from './canvas.service';
import { DataService } from './data.service';
import { HistoryService } from './history.service';
import { CropzoneService } from './cropzone.service';

declare var fabric: any;

@Injectable()
export class CropperService {

  constructor(private dataService: DataService, private canvas: CanvasService, private history: HistoryService,
              private cropzone: CropzoneService) { }

  start(e) {
    if (this.cropzone.initiated) return;

    this.cropzone.add();
    this.dataService.openPanel('crop', e);
  };

  stop(e) {
    this.cropzone.remove();
    this.dataService.activePanel = false;
  };

  crop() {
    if ( ! this.cropzone.initiated) return false;

    this.cropzone.hide();
    let image = new Image();
    let $this = this;

    image.onload = function() {
      let fabricImage = new fabric.Image(this, $this.canvas.imageStatic);
      fabricImage.name = 'mainImage';

      $this.canvas.mainImage && $this.canvas.mainImage.remove();
      $this.canvas.fabric.clear();
      $this.canvas.fabric.setWidth(Math.ceil($this.cropzone.rect.getWidth()));
      $this.canvas.fabric.setHeight(Math.ceil($this.cropzone.rect.getHeight()));

      $this.canvas.fabric.add(fabricImage);
      fabricImage.moveTo(0);
      fabricImage.center();
      $this.canvas.mainImage = fabricImage;
      $this.cropzone.remove();

      $this.history.add('crop', 'crop');

      // $this.dataService.$apply(function() {
      //   $this.dataService.activePanel = false;
      // });
    };

    this.canvas.zoom(1);

    this.dataService.editorCustomActions.crop = {
      left: this.cropzone.rect.getLeft(),
      top: this.cropzone.rect.getTop(),
      width: Math.ceil(this.cropzone.rect.getWidth()),
      height: Math.ceil(this.cropzone.rect.getHeight())
    };

    image.src = this.canvas.fabric.toDataURL({
      left: this.cropzone.rect.getLeft(),
      top: this.cropzone.rect.getTop(),
      width: Math.ceil(this.cropzone.rect.getWidth()),
      height: Math.ceil(this.cropzone.rect.getHeight())
    });

    this.canvas.originalWidth = Math.ceil(this.cropzone.rect.getWidth());
    this.canvas.originalHeight = Math.ceil(this.cropzone.rect.getHeight());
  }
}
