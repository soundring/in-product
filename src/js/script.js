'use strict';


import $ from 'jquery';
import _ from 'lodash';

let canvas = document.getElementById("canvas");
canvas.width = 600;
canvas.height = 600;

const isSP = /(iphone|ipod|ipad|android)/g.test(navigator.userAgent.toLowerCase())

let ctx = canvas.getContext("2d");

ctx.fillStyle = 'rgb(0,0,0)';
ctx.fillRect(0, 0, 600, 600);

var img = new Image();
img.src = "mapBg.png";
img.onload = function() {
    ctx.drawImage(img, 0, 0);
};




//マウスの座標を入れる変数
let mouseX; 
let mouseY; 

//クリックした所の座標を保存しておく配列
let coordinatePoints = [
    // {x:mouseX. mouseY}
];

//それぞれのチェックポイントで始点となる座標を収納
let movepoints = [];

//円６つ
const circlePosition = [
    {//上
        x: 290,
        y: 63,
        r: 24,
        p: Math.PI*2
    },
    {//左上
        x: 54,
        y: 233,
        r: 24,
        p: Math.PI*2
    },
    {//右上
        x: 530,
        y: 232,
        r: 24,
        p: Math.PI*2
    },
    {//左下
        x: 140,
        y: 515,
        r: 24,
        p: Math.PI*2
    },
    {//右下
        x: 440,
        y: 513,
        r: 24,
        p: Math.PI*2
    },
    {//真ん中
        x: 290,
        y: 310,
        r: 33,
        p: Math.PI*2
    }
];

let circleNumber = ["1"];
ctx.textAlign = "center";
ctx.textBaseline = "middle";


//線の色
const color = ["purple","red","pink","orange","green","blue"];

/* フォントスタイルを定義&文字の色定義 */
ctx.font = "30px 'ＭＳ Ｐゴシック'";
ctx.fillStyle = color[0];
ctx.fill();

// クリックイベントの登録
function onClick(e) {
     //前回の座標を保存する
      if (mouseX != coordinatePoints[0] && mouseY != coordinatePoints[1] &&  circlePosition.length < 2) {
          coordinatePoints.push({x:mouseX,y:mouseY})
      }

    

    //円の中でクリックすると円を描画
    let d = 0;
    for (let i = 0; i < circlePosition.length; i++) {
        const c = circlePosition[i]
        d = Math.hypot(mouseX - circlePosition[i].x,mouseY - circlePosition[i].y) ; 
        // マウスから円の中心までの距離が円の半径よりも短い時　座標を入れる
        if(d <= c.r && !_.find(coordinatePoints, {x: c.x, y: c.y})) {
            coordinatePoints.push({x: c.x, y: c.y});
            circleNumber.push([coordinatePoints.length]);

            mouseX,mouseY = clickCoordinatePointsCalc();
            movepoints = [mouseX,mouseY];
        }
        
    }

}

/* Canvas上でマウスが動いている時 */
function onMouseMove(e) {
    if (coordinatePoints[0] !== 0 && coordinatePoints[1] !== 0) {
        ctx.clearRect(0,0,600,600);
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.fillRect(0, 0, 600, 600);
        ctx.drawImage(img, 0, 0);

        drawPastLine(0);

        //circleの中心とマウスの距離で吸い込み判定
        let d = 0;
        for(let i = 0; i < circlePosition.length; i++) {
            ctx.restore()
            const c = circlePosition[i]
            d = Math.hypot(mouseX - circlePosition[i].x,mouseY - circlePosition[i].y) ; 
            // マウスから円の中心までの距離が円の半径よりも短い時　座標を入れる
            if(d <= c.r && !_.find(coordinatePoints, {x: c.x, y: c.y}) && coordinatePoints.length > 0) {
                
                coordinatePoints.push({x: c.x, y: c.y});
                circleNumber.push([coordinatePoints.length]);
                return;
            } else if (_.find(coordinatePoints,{x: 290, y:310})) {
                drawPastNumberCircle(coordinatePoints);
                setTimeout(warning, 500);
                return;
            } else {
                //マウスを動かしてる時の線を描画
                mouseX,mouseY = clickCoordinatePointsCalc();
                movingline(coordinatePoints.length - 1 , e, mouseX, mouseY);
            }
        }
     

        //coordinatePointsの数だけ円と数字を描画
        if (coordinatePoints.length > 0 && coordinatePoints.length < 7) {
            drawPastNumberCircle(coordinatePoints);
        }
       

        
    }
}

if(!isSP) {
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('click', onClick, false);
}

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////


//クリック位置の座標計算する関数（canvasの左上を基準。）
function clickCoordinatePointsCalc() {
    let rect = event.target.getBoundingClientRect();
    mouseX = event.clientX - Math.floor(rect.left);
    mouseY = event.clientY - Math.floor(rect.top);
    return mouseX,mouseY;
}



//今までの線を描画
function drawPastLine(plusNumber) {
    for(let i = 0; i < coordinatePoints.length - 1; i++) {
        const point = coordinatePoints[i]
        const nextPoint = coordinatePoints[i+1]
        ctx.beginPath();
        ctx.strokeStyle = color[i+plusNumber];
        ctx.lineWidth = 16;
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(nextPoint.x, nextPoint.y);
        movepoints = [nextPoint.x,nextPoint.y]
        ctx.closePath();
        ctx.stroke();
    }
}

//今までの数字と円を描画
function drawPastNumberCircle(coordinatePoints) {
    ctx.lineWidth = 10;
    // coordinatePointsのデータだけを使って円とテキストを表示する
    for (let i = 0; i < coordinatePoints.length; i++) {
        //円
        ctx.beginPath();
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = color[i];
        ctx.arc(coordinatePoints[i].x, coordinatePoints[i].y, 24, Math.PI*2,false);
        ctx.fill();
        ctx.closePath();
        //数字
        ctx.stroke();
        ctx.fillStyle = color[i];
        ctx.fillText(
            i + 1,
            coordinatePoints[i].x,
            coordinatePoints[i].y
        );
    }
        
}


//マウスを動かしている時の線を描画するための関数
function movingline(colorPulusNumber,event,lineToPoint_X,lineToPoint_Y) {
    ctx.beginPath();
    changeColor();
    ctx.arc(coordinatePoints[0], coordinatePoints[1], 10, 0, Math.PI * 2, false);
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.strokeStyle = color[colorPulusNumber];
    ctx.moveTo(movepoints[0], movepoints[1]);
    ctx.lineTo(lineToPoint_X, lineToPoint_Y);
    ctx.closePath();
    ctx.stroke();
}


//アラートを１回しか出さないようにする関数
let cnt = 0;
function warning(){
if(cnt == 0){
alert("真ん中に来ましたよー");
}
cnt = 1;
}

function changeColor() {
    //座標の保存数に応じて線の色を変更
    for (let i = 0; i < coordinatePoints.length; i++) {
        ctx.strokeStyle = color[i];
        
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

//スマホ
let touchX;
let touchY;

function touchStart(e) {
    event.preventDefault();
    touchX = e.changedTouches[0].pageX;
    touchY = e.changedTouches[0].pageY;

    //円の中でクリックすると円を描画
    let d = 0;
    for (let i = 0; i < circlePosition.length; i++) {
        const c = circlePosition[i]
        d = Math.hypot(touchX- circlePosition[i].x,touchY - circlePosition[i].y) ; 
        // マウスから円の中心までの距離が円の半径よりも短い時　座標を入れる
        if(d <= c.r && !_.find(coordinatePoints, {x: c.x, y: c.y})) {
            movepoints.push(touchX, touchY);
            circleNumber.push([coordinatePoints.length]);
        }
        
    }
}

function touchMove(e) {
    ctx.clearRect(0,0,600,600); 
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(0, 0, 600, 600);
    ctx.drawImage(img, 0, 0);
    event.preventDefault();

    

    touchX = e.changedTouches[0].pageX;
    touchY = e.changedTouches[0].pageY;

    //今までの線を描画
    drawPastLine(1);
    
    //coordinatePointsの数だけ円と数字を描画
    if (coordinatePoints.length > 0 && coordinatePoints.length < 6) {
        drawPastNumberCircle(coordinatePoints);
    }

    //circleの中心と指の距離で吸い込み判定
    let d = 0;
    for(let i = 0; i < circlePosition.length; i++) {
        ctx.restore()
        const c = circlePosition[i]
        d = Math.hypot(touchX - circlePosition[i].x,touchY - circlePosition[i].y) ; 
        // 指から円の中心までの距離が円の半径よりも短い時
        if(d <= c.r && !_.find(coordinatePoints, {x: c.x, y: c.y})) {
            coordinatePoints.push({x: c.x, y: c.y})
            return;
        } else if (_.find(coordinatePoints,{x: 290, y:310})) {
            drawPastNumberCircle(coordinatePoints);
            setTimeout(warning, 500);
            return;
        } else {
            //指をを動かしてる時の線を描画
            ctx.beginPath();
            ctx.strokeStyle = color[i];
            touchX = e.changedTouches[0].pageX;
            touchY = e.changedTouches[0].pageY;
            ctx.beginPath();
            ctx.strokeStyle = color[coordinatePoints.length];
            ctx.moveTo(movepoints[0], movepoints[1]);
            ctx.lineTo(touchX, touchY);
            ctx.closePath();
            ctx.stroke();
        }
    }
}

if(isSP) {
    window.addEventListener("touchstart", touchStart, false);
    window.addEventListener('touchmove', touchMove, false);
    changeColor();
}
