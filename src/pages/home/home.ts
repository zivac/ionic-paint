import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';

import { AlertController } from 'ionic-angular';
import { Splashscreen } from 'ionic-native';
import { Base64ToGallery } from 'ionic-native';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  isPortrait = this.canvasHeight > this.canvasWidth;
  draw = false;

  ppts = [];
  history = [];
  future = [];

  lineWidth = 10;
  color = '#111111';

  colors = ['#111111', '#DDDDDD', '#ffffff', '#2ECC40', '#0074D9', '#B10DC9', '#FF4136', '#FF851B', '#FFDC00'];

  @ViewChild('canvas') canvas;
  @ViewChild('tmpCanvas') tmpCanvas;
  ctx;

  flipImage(ctx, imgData) {
    let newImgData = ctx.createImageData(imgData.height, imgData.width);
    for(let i=0; i< newImgData.data.length; i += 4) {
      let row = (i/4)%newImgData.width;
      let column = Math.floor((i/4)/newImgData.width);
      for(let j=0; j<4; j++) {
        newImgData.data[i + j] = imgData.data[row*imgData.width*4 + column*4 + j];
      }
    }
    return newImgData;
  }

  constructor(public alertCtrl: AlertController) {
    window.addEventListener('orientationchange', () => {
      let ctx = this.canvas.nativeElement.getContext('2d');
      let imgData = ctx.getImageData(0,0,this.canvasWidth,this.canvasHeight);
      this.canvasWidth = window.innerWidth;
      this.canvasHeight = window.innerHeight;
      this.isPortrait = this.canvasHeight > this.canvasWidth;
      setTimeout(() => {
        if(imgData.width == this.canvasWidth) ctx.putImageData(imgData, 0, 0)
        else ctx.putImageData(this.flipImage(ctx, imgData), 0, 0);
      })
    })
  }

  ngOnInit() {
    let canvas = this.tmpCanvas.nativeElement;
    this.ctx = canvas.getContext('2d');
  }

  setColor(color) {
    this.color = color;
  }

  isActiveColor(color) {
    return this.color == color;
  }

  setSize(size) {
    this.lineWidth = size;
  }

  isActiveSize(size) {
    return this.lineWidth == size;
  }

  startDraw(e) {
    this.draw = true;
  }

  undo(redo) {
    let imgData = this[redo?'future':'history'].pop();
    let ctx = this.canvas.nativeElement.getContext('2d');
    let oldImgData = ctx.getImageData(0,0,this.canvasWidth,this.canvasHeight);
    this[redo?'history':'future'].push(oldImgData);
    if(imgData.width == this.canvasWidth) ctx.putImageData(imgData, 0, 0)
    else ctx.putImageData(this.flipImage(ctx, imgData), 0, 0);
  }

  save() {
    let base64Data = this.canvas.nativeElement.toDataURL();
    Base64ToGallery.base64ToGallery(base64Data).then(
      res => {
        let alert = this.alertCtrl.create({
          title: 'Success!',
          subTitle: 'Drawing was saved!',
          buttons: ['OK']
        });
        alert.present();
      },
      err => {
        let alert = this.alertCtrl.create({
          title: 'Error!',
          subTitle: err,
          buttons: ['OK']
        });
        alert.present();
      }
    );
  }

  endDraw(e) {
    this.draw = false;
    let ctx =  this.canvas.nativeElement.getContext('2d');
    this.history.push(ctx.getImageData(0,0,this.canvasWidth,this.canvasHeight));
    ctx.drawImage(this.tmpCanvas.nativeElement, 0, 0);
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.ppts = [];
    this.future = [];
  }

  clear() {
    let ctx = this.canvas.nativeElement.getContext('2d');
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.history = [];
    this.future = [];
  }

  paint(e) {

    if(!this.draw) return;

    let x = e.touches[0].pageX;
    let y = e.touches[0].pageY;

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
