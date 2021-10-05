import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.js';
import Dropzone from 'react-dropzone';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle, faPlayCircle, faPauseCircle } from "@fortawesome/free-solid-svg-icons";


class Waveform extends Component {
  render () {
    return <div id="waveform"></div>
  }
  componentDidMount() {
    this.player = WaveSurfer.create({
      container: '#waveform',
      waveColor: 'violet',
      progressColor: 'purple',
      scrollParent: false,
      responsive: true,
      plugins: [
        RegionsPlugin.create()
      ]
    });
  }
  loadFile(file) { 
    this.player.clearRegions();
    this.player.loadBlob(file);
  }
  togglePlay() { this.player.playPause() }
  addSegments(segments) { segments.forEach(segment => { this.player.addRegion(segment) }); }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state ={file: null }
    this.waveform = React.createRef();
  }
  setFile(file) {
    this.setState({
      file: file,
      segments: null,
      error: null,
      playing: false
    })
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>NG Whistles</h2>
          { this.state.file && 
              <div>
                <FontAwesomeIcon icon={this.state.playing ? faPauseCircle : faPlayCircle } size='3x' onClick={() => {
                  this.waveform.current.togglePlay(); 
                  this.setState({playing: !this.state.playing})
                }} />
                  <FontAwesomeIcon icon={faTimesCircle} size='3x' onClick={() => {
                    this.waveform.current.player.stop();
                    this.setFile(null)
                  } }/>
              </div>
          }
            </div>
            <Dropzone onDrop={files => { 
              this.setFile(files[0])
              this.waveform.current.loadFile(this.state.file);
              let data = new FormData(); 
              data.append("file", this.state.file);
              fetch("/segments", {
                method: 'post',
                body: data, 
              }).then( response => {
                if (!response.ok) {  throw Error(response.statusText) }
                return response.json()  
              })
                .then(json => {
                  if(this.state.file)
                  {
                    this.setState({segments: json.segments});
                    this.waveform.current.addSegments(this.state.segments);
                  }
                })
                .catch( err => { this.setState({error: err.toString()}); } )
            }}>
              {({getRootProps, getInputProps}) => (
                <div {...getRootProps()}>
                  {this.state.file ? 
                    <Waveform ref={this.waveform}/> :
                    <div>
                      <input {...getInputProps()} />
                      <div className = 'Dropzone'>Drop nightingale song (WAV, mono, 44.1kHz) here.</div>
                    </div>
                  }
                  </div>
              )}
                </Dropzone>
                { this.state.error ?
                    <p> Whistle detection failed: {this.state.error} </p> :
                 this.state.file && (
                  this.state.segments ?
                  <p>{this.state.segments.length} whistle(s) detected.</p>:
                  <p>Detecting flat whistles...</p>
                )
                }
                </div>
    );
  }
}

export default App;
