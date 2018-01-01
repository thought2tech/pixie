import { Component, OnInit } from '@angular/core';
import {DataService} from '../../../services/data.service';
import {CropperService} from '../../../services/cropper.service';
import {CropzoneService} from '../../../services/cropzone.service';

@Component({
  selector: 'app-crop',
  templateUrl: './crop.component.html',
  styleUrls: ['./crop.component.css']
})
export class CropComponent implements OnInit {

  constructor(private dataService: DataService, private cropper: CropperService, private cropzone: CropzoneService) { }

  ngOnInit() {
  }

  // this.dataService.$on('tab.changed', function(e, newTab, oldTab) {
  //   if (oldTab === 'basics' && newTab !== 'basics') {
  //     this.cropper.stop();
  //   }
  // });

  // $rootScope.$watch('activePanel', function(newPanel, oldPanel) {
  //   if (newPanel !== 'crop' && oldPanel === 'crop') {
  //     cropzone.remove();
  //   }
  // });

  // $rootScope.$on('cropzone.added', function() {
  //   $scope.width = Math.round(cropzone.rect.width);
  //   $scope.height = Math.round(cropzone.rect.height);
  // });
}
