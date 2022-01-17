////////////////////////////////////////////////////////////////
import React from "react";
import './App.css';
////////////////////////////////////////////////////////////////
class Canvas extends React.Component {
    constructor( props) {
        super( props);
        this.canvas = React.createRef();
    }
    componentDidMount() {
        this.ctx = this.canvas.current.getContext( "2d");
        this.ctx.lineWidth = 10;
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
        console.log( uri);//
    }
    render() {
        return(
            <div>
                <canvas ref={this.canvas}
                        width={this.props.size} 
                        height={this.props.size}
                        onMouseMove={this.handleMouseMove}
                        onMouseDown={this.handleMouseDown}
                />
                <div>
                    <button onClick={this.clearCanvas}>Clear</button>
                    <button onClick={this.getPixels}>Submit</button>
                </div>
            </div>
        );
    }
}
////////////////////////////////////////////////////////////////
function App() {
    return(
        <div className="App">
            <Canvas size="280"/>
        </div>
    );
}
////////////////////////////////////////////////////////////////
export default App;
////////////////////////////////////////////////////////////////
// log:
////////////////////////////////////////////////////////////////
