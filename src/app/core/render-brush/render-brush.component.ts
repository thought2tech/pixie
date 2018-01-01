import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-render-brush',
  templateUrl: './render-brush.component.html',
  styleUrls: ['./render-brush.component.css']
})
export class RenderBrushComponent implements OnInit {

  constructor(private dataService: DataService) { }

  ngOnInit() {
  }

  // let unbind = dataService.$on('tab.changed', function(e, name) {
  //   if (name === 'drawing') {
  //     $scope.$apply(function() {
  //       el.append($compile(template)($scope));
  //     });
  //     this.unbind();
  //   }
  // });

}
