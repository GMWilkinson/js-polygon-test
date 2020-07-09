import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';

const startPolygon = [
  {
    x: 100,
    y: 120
  },
  {
    x: 200,
    y: 70
  },
  {
    x: 300,
    y: 70
  },
  {
    x: 400,
    y: 220
  },
  {
    x: 350,
    y: 270
  },
  {
    x: 200,
    y: 320
  },
  {
    x: 150,
    y: 320
  }
]

const newPolygon = [
  {
    x: 100,
    y: 120
  },
  {
    x: 230,
    y: 110
  },
  {
    x: 280,
    y: 90
  },
  {
    x: 300,
    y: 220
  },
  {
    x: 350,
    y: 270
  },
  {
    x: 200,
    y: 320
  },
  {
    x: 150,
    y: 320
  }
]

export default class App extends React.Component{
constructor(props) {
  super(props);
  this.state = {
    isDown: false,
    startPointX: '',
    startPointY: '',
    fromTop: 0,
    fromLeft: 0,
    shapeWidth: 0,
    shapeHeight: 0,
    arrOfPolygonCoords: [],
    draggedLineCoords: [],
    polyObj: 'startPoly',
    errMessage: ''
  }
  this.handleMouseDown = this.handleMouseDown.bind(this);
  this.handleMouseMove = this.handleMouseMove.bind(this);
  this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  componentDidMount() {
    this.drawPolygon();
  }

  handleMouseDown(event) {
    this.setState({
      isDown: true,
      startPointX: event.offsetX,
      startPointY: event.offsetY
    }, ()=>{
      const canvas = ReactDOM.findDOMNode(this.refs.canvas);
      var x = event.offsetX;
      var y = event.offsetY;
      var ctx = canvas.getContext("2d");
      ctx.moveTo(x, y);
      ctx.lineTo(x + 1, y + 1);
      ctx.stroke();
    })
  }

  handleMouseMove() {

  }

  handleMouseUp(event){
    this.setState({
        isDown: false
    });
    const canvas = ReactDOM.findDOMNode(this.refs.canvas);
    var x = event.offsetX;
    var y = event.offsetY;
    var ctx = canvas.getContext("2d");
    ctx.moveTo(this.state.startPointX, this.state.startPointY);
    ctx.lineTo(x,y);
    ctx.stroke();
    ctx.closePath();
    this.setState({
      endPointX: x,
      endPointY: y
    }, async function() {
      const { startPointX, startPointY } = this.state;
      const a = [startPointX, startPointY];
      const b = [x, y];
      const draggedLineCoords = await this.lineCoords(a[0], a[1], b[0], b[1]);
      this.setState({
        draggedLineCoords
      }, function() {
        this.getPointIntersections()
      })
    })
  }

  drawPolygon(type) {
    this.setState({
      errMessage: ''
    })
    const canvas = ReactDOM.findDOMNode(this.refs.canvas);
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    const polygon = type === 'newPoly' ? newPolygon : startPolygon;
    this.setState({
      polyObj: type
    })
    const arrOfPolygonCoords = [];
    for (let i = 0; i < polygon.length; i++) {
      if (i === 0) {
        ctx.moveTo(polygon[i].x, polygon[i].y);
        const a = [polygon[i].x, polygon[i].y];
        const b = [polygon[i + 1].x, polygon[i + 1].y];
        arrOfPolygonCoords.push(this.lineCoords(a[0], a[1], b[0], b[1]));
      } else if (i === polygon.length -1) {
        ctx.lineTo(polygon[i].x, polygon[i].y);
        const a = [polygon[i].x, polygon[i].y];
        const b = [polygon[0].x, polygon[0].y];
        arrOfPolygonCoords.push(this.lineCoords(a[0], a[1], b[0], b[1]));
      } else {
        ctx.lineTo(polygon[i].x, polygon[i].y);
        const a = [polygon[i].x, polygon[i].y];
        const b = [polygon[i + 1].x, polygon[i + 1].y];
        arrOfPolygonCoords.push(this.lineCoords(a[0], a[1], b[0], b[1]));
      }
    }
    ctx.closePath();
    ctx.stroke();
    this.setState({
      arrOfPolygonCoords
    })
  }

  drawNewShapes(newPoints, changedEdgesIndex) {
    const { polyObj } = this.state;
    const newPolygon1 = polyObj === 'newPoly' ? newPolygon.map(item => ({...item})) : startPolygon.map(item => ({...item}));
    const newPolygon2 = polyObj === 'newPoly' ? newPolygon.map(item => ({...item})) : startPolygon.map(item => ({...item}));
    if (changedEdgesIndex.length === 2) {
      const arr1 = [];
      const arr2 = [];
      newPolygon1.forEach((item, i) => {
        if (i < changedEdgesIndex[0] + 1) {
          arr1.push(item);
        }
        if (i === changedEdgesIndex[0] + 1) {
          arr1.push({x: newPoints[0][0], y: newPoints[0][1]});
        }
        if (i === changedEdgesIndex[1]) {
          arr1.push({x: newPoints[1][0], y: newPoints[1][1]});
        }
        if (i > changedEdgesIndex[1]) {
          if (newPolygon1.length - changedEdgesIndex[1] > 1) {
            arr1.push(item);
          } else {
            return;
          }
        }
      })
      newPolygon2.forEach((item, i) => {
        if (i === changedEdgesIndex[0]) {
          arr2.push({x: newPoints[0][0], y: newPoints[0][1]});
        }
        if (i > changedEdgesIndex[0] && i < changedEdgesIndex[1] + 1) {
          arr2.push(item);
        }
        if (i === changedEdgesIndex[1]) {
          arr2.push({x: newPoints[1][0], y: newPoints[1][1]});
        }
        if (i > changedEdgesIndex[1]) {
          return;
        }
      })
      const canvas = ReactDOM.findDOMNode(this.refs.canvas);
      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      for (let i = 0; i < arr1.length; i++) {
        if (i === 0) {
          ctx.moveTo(arr1[i].x - 50, arr1[i].y - 50);
        } else {
          ctx.lineTo(arr1[i].x - 50, arr1[i].y - 50);
        }
      }
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i < arr2.length; i++) {
        if (i === 0) {
          ctx.moveTo(arr2[i].x + 50, arr2[i].y + 50);
        } else {
          ctx.lineTo(arr2[i].x + 50, arr2[i].y + 50);
        }
      }
      ctx.closePath();
      ctx.stroke();
      setTimeout(
        function() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          this.drawPolygon(polyObj);
        }.bind(this), 2000);
    } else {
      this.setState({
        errMessage: 'Sorry there has been a problem, try again'
      })
      setTimeout(
        function() {
          const canvas = ReactDOM.findDOMNode(this.refs.canvas);
          var ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          this.drawPolygon(polyObj);
        }.bind(this), 2000);
    }
  }

  getPointIntersections() {
    const {
      arrOfPolygonCoords,
      draggedLineCoords
    } = this.state;
    let newPoints = [];
    const changedEdgesIndex = [];
    for (let i = 0; i < arrOfPolygonCoords.length; i++) {
      for (let j = 0; j < draggedLineCoords.length; j++) {
        for (let k = 0; k < arrOfPolygonCoords[i].length; k++) {
          const dragCoord = JSON.stringify(draggedLineCoords[j]);
          const polyCoord = JSON.stringify(arrOfPolygonCoords[i][k]);
          if (dragCoord === polyCoord) {
            newPoints.push(draggedLineCoords[j]);
            changedEdgesIndex.push(i);
          }
        }
      }
    }
    this.drawNewShapes(newPoints, changedEdgesIndex);
  }

  lineCoords(x0, y0, x1, y1) {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;
    const arr = [];
    while(true) {
      if ((x0 === x1) && (y0 === y1)) break;
      var e2 = 2*err;
      if (e2 > -dy) { err -= dy; x0  += sx; }
      if (e2 < dx) { err += dx; y0  += sy; }
      arr.push([x0, y0])
    }
    return arr;
  }

  render() {
    const { errMessage } = this.state;
    return (
      <main className="main-container">
        <h1>Polygon Cutter</h1>
        <h2>Drag a line across the polygon</h2>
        <div>
          <h2>{errMessage}</h2>
          <canvas id="canvas" ref="canvas"
            width={500}
            height={400}
            onMouseDown={
              e => {
                let nativeEvent = e.nativeEvent;
                this.handleMouseDown(nativeEvent);
              }}
            onMouseMove={
              e => {
                let nativeEvent = e.nativeEvent;
                this.handleMouseMove(nativeEvent);
              }}
            onMouseUp={
              e => {
                let nativeEvent = e.nativeEvent;
                this.handleMouseUp(nativeEvent);
              }}
          ></canvas>
        </div>
        <button onClick={() => this.drawPolygon('newPoly')}>Different Polygon</button>
        <button onClick={() => this.drawPolygon('startPoly')}>Original Polygon</button>
      </main>
    );
  }
}
