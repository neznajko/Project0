////////////////////////////////////////////////////////////////
import React from "react";
import './App.css';
import logo from './GitHub-Mark-Light-64px.png';
////////////////////////////////////////////////////////////////
function rnd( min, max) { // [ min, max]
    return min + Math.floor( Math.random()*( max - min + 1));
}
////////////////////////////////////////////////////////////////
class Color {
    constructor( hue, sat, val) {
        this.hue = hue;
        this.sat = sat;
        this.val = val;
    }
    str() {
        return `hsl(${this.hue},${this.sat}%,${this.val}%)`;
    }
}
function randomHSL() { // Hue Saturation Lightness
    const bgr = new Color( rnd( 0, 360), rnd( 0, 100), rnd( 0, 100));
    const val = bgr.val < 50 ? bgr.val + 40 : bgr.val - 40;
    const fgr = new Color( rnd( 0, 360), rnd( 0, 100), val);
    return [ bgr, fgr];
}
//////////////////////////////////////////////////////// 
class Bar extends React.Component {
    constructor( props) {
        super( props); // gives access to props via this.props
        const [ bgr, fgr] = randomHSL();
        this.state = {
            bgr: bgr.str(),
            fgr: fgr.str(),
            wid: `${rnd( 20, 50)}px`,
        };
    }
    render() {
        return (
                <div className="BAR" style={{
                    backgroundColor: this.state.bgr,
                    color: this.state.fgr,
                    width: this.state.wid,
                }}>{this.props.char}</div>);
    }
    componentDidMount() {
        const dt = rnd( 10, 30)*1000;
        this.timerID = setInterval( () => this.tick(), dt);
    }
    componentWillUnmount() {
        clearInterval( this.timerID);
    }
    tick() {
        const [ bgr, fgr] = randomHSL();
        this.setState({ 
            bgr: bgr.str(),
            fgr: fgr.str(),
            wid: this.state.wid
        });
    }
}
class Barchart extends React.Component {
    constructor(pros) {
        super(pros);
    }
    render() {
        return (
                <div className="BARCHART">
                {this.props.str.split("").map((v, j) => (
                        <Bar key={j} char={v} />
                ))}
            </div>
        );
    }
}
////////////////////////////////////////////////////////////////
class Parser {
    constructor( str, m) {
        this.words = str.trim().split( /\s+/);
        this.m = m; // maximum characters per line
        this.staat = 0;
    }
    getNextLine() {
        // Dump next group of words with maximum this.m characters
        let j = this.staat;
        let n = 0;
        for(; j < this.words.length; j++) {
            n += this.words[ j].length;
            if( n > this.m) break;
        }
        const str = this.words.slice( this.staat, j).join( ' ');
        this.staat = j;
        return str; 
    }
}
function All( props) {
    let parsa = new Parser( props.str, 20);
    let ls = [];
    for( ;;) {
        const str = parsa.getNextLine();
        if( str === "") break;
        ls.push( str);
    }
    console.log( ls);
    return (
        <div>
            {
                ls.map(( u, j) =>  <Barchart key={j} str={u} />)
            }
        </div>
    );
}
////////////////////////////////////////////////////////////////
class Canvas extends React.Component {
    constructor( props) {
        super( props);
        this.canvas = React.createRef();
    }
    componentDidMount() {
        this.ctx = this.canvas.current.getContext( "2d");
        this.ctx.lineWidth = 14;
        this.ctx.lineCap = "round";
        this.ctx.strokeStyel = "black";
        this.prev = [ 0, 0]; // previous mouse coorz
        this.next = [ 0, 0]; // next mouse coorz
        // Are we drawing? It should be initialized to false
        // otherwise the draw function will complain.
        this.flag = false;
        // handling mouseup outside canvas window
        window.addEventListener( 'mouseup', this.handleMouseUp);
    }
    componentWillUnmount() {
        window.removeEventListener( 'mouseup', this.handleMouseUp);
    }
    getCoorz( e) {
        const rect = this.canvas.current.getBoundingClientRect();
        return[ e.clientX - rect.left, e.clientY - rect.top];
    }
    handleMouseMove = e => {
        /** This function is called every time the mouse is *
         * moving so it's necessary to lower the flag on    *
         * mouse up and at initialization.                  */
        if( this.flag == false) return;
        this.next = this.getCoorz( e);
        // =>
        this.ctx.beginPath();
        this.ctx.moveTo( this.prev[ 0], this.prev[ 1]);
        this.ctx.lineTo( this.next[ 0], this.next[ 1]);
        this.ctx.stroke();
        this.ctx.closePath();
        // <=
        this.prev = this.next; // update
    }
    handleMouseDown = e => {
        /** This function will be called every time we *
         * click the canvas.                           */
        this.prev = this.getCoorz( e);
        this.flag = true; // start drawing
    }
    handleMouseUp = e => {
        this.flag = false;
    };
    clearCanvas = () => {
        console.log( "Clear");
        this.ctx.clearRect( 0, 0, this.props.size, this.props.size);
        // this migth not work( Stack Overflow)
        document.querySelector("#image").src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
    }
    getPixels = () => {
        console.log( "Submit");
        // R, G, B, A from 0 to 255
        const imageData = this.ctx.getImageData( 0, 0,
                                                 this.props.size,
                                                 this.props.size);
        const data = imageData.data;
        let xhr = new XMLHttpRequest();
        const uri = window.location.origin + "/submit";
        console.log( uri);
        xhr.open( "POST", uri);
        xhr.setRequestHeader( "Content-Type", 
                              "application/json;charset=UTF-8");
        xhr.send( JSON.stringify( getAlpha( data)));
        //
        xhr.responseType = "blob";
        xhr.onload = function () {
            if( xhr.readyState === xhr.DONE) {
                if( xhr.status === 200) {
                    const res = xhr.response;
                    console.log( res);
                    // Stack Overflow
                    var urlCreator = window.URL || window.webkitURL;
                    var imageUrl = urlCreator.createObjectURL( res);
                    console.log( imageUrl);
                    document.querySelector("#image").src = imageUrl;
                }
            }
        };
    }
    render() {
        return(
            <div id="Canvas-Street">
                <div id="left">
                    <canvas ref={this.canvas}
                            width={this.props.size} 
                            height={this.props.size}
                            onMouseMove={this.handleMouseMove}
                            onMouseDown={this.handleMouseDown} />
                    <div>
                        <button onClick={this.clearCanvas}>Clear</button>
                        <button onClick={this.getPixels}>Submit</button>
                    </div>
                </div>
                <div id="ryte">
                    <img id="image" />
                </div>
            </div>
        );
    }
}
///0/1/2/3/4/5/6/7//////////////////////////////////////////////
// r g b a r g b a ..
// e r l l e r l l ..
// d e u p d e u p ..
//   e e h   e e h ..
//   n   a   n   a ..
function getAlpha( data) {
    let alpha = Array.from({ length: data.lenght});
    for( let j = 3, i = 0; j < data.length; j += 4, i++) {
        alpha[ i] = data[ j];
    }
    return alpha;
}
////////////////////////////////////////////////////////////////
function App() {
    return (
        <div className="App">
            <nav className="navbar navbar-light bg-warning">
                <div className="container-fluid">
                    <a className="navbar-brand"
                       href="https://github.com/neznajko/Project0"
                       target="_blank">
                        <img src={logo} />
                    </a>
                    <a className="navbar-brand"><i>BOOM</i></a>
                </div>
            </nav>
            <div className="Main">
                <All str=" 
[T]his is a simple project, for hand written digits recognition. 
It is based on flask for backend, and React for frontend. Below
on the left side is the Canvas, if you draw a digit with the
mouse and hit Submit, on the right side should appear an image of
the guessed digit you've draw. This is the nearest neighbor from
the MNIST digits library. I wanted to keep things simple and didn't
use any machine learning stof, although it will be fun to use
Image Recognition for guessing your own pictures, here if you draw
something more artistic only digits will appear on the right side.
" />
            </div>
            <div className="Draw">
                <div className="inner">
                    <Canvas size="280"/>
                </div>
            </div>
            <div className="footer">
                <p>© 2022 <b><i>We4er</i></b>, Inc. All rights reserved.</p>
            </div> 
        </div>
    );
}            
export default App;
////////////////////////////////////////////////////////////////
// log: 
////////////////////////////////////////////////////////////////
