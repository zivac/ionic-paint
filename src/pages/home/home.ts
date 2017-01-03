import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';

import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  headerSize = 44;

  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight - 2*this.headerSize;
  draw = false;
  ppts = [];

  lineWidth = 10;
  color = 'blue';

  @ViewChild('canvas') canvas;
  @ViewChild('tmpCanvas') tmpCanvas;
  ctx;

  constructor(public navCtrl: NavController) {
    
  }

  ngOnInit() {
    let canvas = this.tmpCanvas.nativeElement;
    this.ctx = canvas.getContext('2d');
  }

  startDraw(e) {
    this.draw = true;
  }

  endDraw(e) {
    this.draw = false;
    let ctx =  this.canvas.nativeElement.getContext('2d');
    ctx.drawImage(this.tmpCanvas.nativeElement, 0, 0);
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.ppts = [];
  }

  clear() {
    let ctx = this.canvas.nativeElement.getContext('2d');
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  paint(e) {

    if(!this.draw) return;

    let x = e.touches[0].pageX;
    let y = e.touches[0].pageY - this.headerSize;

    this.ppts.push({x: x, y: y})

    this.ctx.lineWidth = this.lineWidth;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = this.color;

    if(this.ppts.length < 3) {
      let b = this.ppts[0]
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, this.ctx.lineWidth / 2, 0, Math.PI * 2, !0);
      this.ctx.fill();
      this.ctx.closePath();
      return;
    }

    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.ctx.beginPath();
    this.ctx.moveTo(this.ppts[0].x, this.ppts[0].y)

    for(var i = 1; i < this.ppts.length - 2; i++) {
      let c = (this.ppts[i].x + this.ppts[i + 1].x) / 2;
      let d = (this.ppts[i].y + this.ppts[i + 1].y) / 2;
      this.ctx.quadraticCurveTo(this.ppts[i].x, this.ppts[i].y, c, d)
    }

    this.ctx.quadraticCurveTo(this.ppts[i].x, this.ppts[i].y, this.ppts[i+1].x, this.ppts[i+1].y);
    this.ctx.stroke();

  }

}
