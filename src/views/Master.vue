<template>
 <video ref="theirRef" id="video" autoplay muted playsinline></video>
 <div class="peerhead">
  <section>
    <p>Peer ID: {{ currentPeer.id }}</p>    
  </section>
  <button @click="initSkyway" class="btn-init-cam">initialize</button>
  <router-link to="/puppet">move puppet</router-link>
 </div>
      <div class="container">
        <img src="@/assets/cockpit8.png"  class="overlay" v-if="prefilter1"/>
        <img src="@/assets/cockpit7.png"  class="overlay" v-if="prefilter2"/>
      </div>
            <div class="ui">
            <a href="#" v-on:click="changefilter1" class="btn-circle-3d-dent">ChangeFilter-1</a>
            <a href="#" v-on:click="changefilter2" class="btn-circle-3d-dent">ChangeFilter-2</a>
            <a href="#" v-on:click="changemodel" class="btn-circle-3d-dent">3D-Cockpit</a>
            <!-- <a href="#" v-on:click="uploadfilter" class="btn-circle-3d-dent">UploadFilter</a> -->
            <label class="btn-circle-3d-dent">
            <input ref="file" class="file-button" type="file" @change="uploadfilter" />
            UploadFilter
            </label>
            <a href="#" v-on:click="changefullscreen" class="btn-circle-3d-dent">ChangeFullScreen</a>
      </div>
</template>

<script>
import Peer from 'skyway-js';
import {ref} from "vue";

export default {
  name: 'Master',
  setup() {
    const theirRef = ref(null)
    const localStream = ref(null);
    const currentPeer = ref({})
    const theirId = ref('')
    
    const initSkyway = () => {
      const peer = new Peer({key: process.env.VUE_APP_API_KEY, debug: 3});

      peer.on('open', () => {
        currentPeer.value = peer;
      });

      peer.on('call', mediaConnection => {
        mediaConnection.answer(localStream.value);
        setEventListener(mediaConnection);
      });
    }

    const setEventListener = mediaConnection => {
      mediaConnection.on('stream', stream => {
        const videoElm = theirRef.value
        videoElm.srcObject = stream;
        videoElm.play();
      });
    }

    return {
      currentPeer,
      theirRef,
      theirId,
      initSkyway      
    }
  },
  data(){
    return{
      prefilter1: false,
      prefilter2: false
    }
  },
  methods: {
    changefilter1(){
      this.prefilter1 = true;
      this.prefilter2 = false;
    },
    changefilter2(){
      this.prefilter1 = false;
      this.prefilter2 = true;      
    }
  }
}
</script>

<style>
  #canvas {
    display: none;
  }

  #video {
  position: fixed; right: 0; bottom: 0;
  min-width: 100%; min-height: 100%;
  width: auto; height: auto; z-index: -100;
  background-size: cover;
  }

  #app{
    max-width: 100vw; max-height: 100vh;
  }

  .container{
    max-width: 100%; max-height: 100%;
    width: 100vw; height: 100vh;
  }

  .overlay {
  position: absolute; top: 50%; left:50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  min-width: 100%; min-height: 100%;
  width: 100%; height: 100%; 
  object-fit: cover;
  z-index: -50;
  }

  .capture {
    /* display: inline; */
    padding: 5px;
  }

  .peerhead {
    position: absolute;
    z-index: 100;
    top: 5%;
    left: 0;
    width: 100%;
    height: auto;
    margin: 0;
    padding: 10px 15px 30px;
    text-align: left;
    vertical-align: center;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    font-family: 'Orbitron', sans-serif;
    text-decoration: none;
    background: #4ec99000;
    color: rgb(100, 160, 77);
    text-shadow: 1px 1px 1px rgb(0, 27, 6);
    }

    .btn-init-cam{
    font-family: 'Orbitron', sans-serif;
    text-decoration: none;
    background: #4ec99000;
    color: rgb(100, 160, 77);
    width: 120;
    font-size: 16px;
    height: auto;
    line-height: 50px;
    text-align: left;
    overflow:auto;
    font-weight: bold;
    text-shadow: 2px 2px 2px rgb(0, 27, 6);
    transition: .4s;
    border: none;
    }

   .ui {
    position: absolute;
    z-index: 100;
    bottom: 5%;
    left: 0;
    width: 100%;
    height: auto;
    margin: 0;
    padding: 10px 15px 30px;
    text-align: left;
    vertical-align: center;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    }

    .btn-circle-3d-dent {
    font-family: 'Orbitron', sans-serif;
    text-decoration: none;
    background: #4ec99000;
    color: rgb(100, 160, 77);
    width: 100;
    font-size: 16px;
    height: 50px;
    line-height: 50px;
    text-align: left;
    overflow:auto;
    font-weight: bold;
    text-shadow: 2px 2px 2px rgb(0, 27, 6);
    transition: .4s;
  }

    .ui2 {
    position: absolute;
    z-index: 100;
    top: 5%;
    right: 0%;
    width: 100%;
    height: auto;
    margin: 0;
    padding: 10px 15px 30px;
    text-align: right;
    vertical-align: center;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    }

    .btn-circle-3d-dent2 {
    font-family: 'Orbitron', sans-serif;
    text-decoration: none;
    background: #4ec99000;
    color: rgb(100, 160, 77);
    width: 100;
    font-size: 16px;
    height: 50px;
    line-height: 50px;
    text-align: right;
    overflow:auto;
    font-weight: bold;
    text-shadow: 2px 2px 2px rgb(0, 27, 6);
    transition: .4s;
  }

  .file-button {
    display: none;
  }

</style>