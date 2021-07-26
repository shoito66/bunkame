<script></script>
<template>
    <!--ハンバーガーメニューのボタン-->
    <div class="hamburger_btn" v-on:click='ActiveBtn=!ActiveBtn'>
      <span class="line line_01" v-bind:class="{'btn_line01':ActiveBtn}"></span>
      <span class="line line_02" v-bind:class="{'btn_line02':ActiveBtn}"></span>
      <span class="line line_03" v-bind:class="{'btn_line03':ActiveBtn}"></span>
    </div>
    <!--サイドバー-->
    <transition name="menu">
      <div class="menu" v-show="ActiveBtn">
          <ul>
              <li><router-link to="/puppet">move puppet</router-link></li>
              <li><p>Peer ID: {{ currentPeer.id }}</p></li>
              <li><a href="#" v-on:click="initSkyway" class="btn-circle-3d-dent">initialize</a></li>              
              <li><a href="#" v-on:click="changefilter1" class="btn-circle-3d-dent">ChangeFilter-1</a></li>
              <li><a href="#" v-on:click="changefilter2" class="btn-circle-3d-dent">ChangeFilter-2</a></li>
              <li><a href="#" v-on:click="changemodel" class="btn-circle-3d-dent">3D-Cockpit</a></li>
              <li><a href="#" v-on:click="changefullscreen" class="btn-circle-3d-dent">ChangeFullScreen</a></li>
          </ul>
      </div>
  </transition>
 <video ref="theirRef" id="video" autoplay muted playsinline></video>
        <SpriteAnimation
            :sprite-x="740"
            :sprite-y="61420"
            :num="83"
            :fps="15"
            :is-start="isStart"
            @onFinish="reset"
            src="/css_sprites2.png"
        />

      <div class="container">
        <img ref="prefilter1" src="@/assets/cockpit9.png"  class="overlay" v-if="prefilter1"/>
        <img ref="prefilter2" src="@/assets/cockpit6.png"  class="overlay" v-if="prefilter2"/>
        <img ref="jpgfilter" v-bind:src="'data:image/jpeg;base64,'+filterjpeg" class="overlay" v-if="jpgfilter"/>
        <img ref="pngfilter" v-bind:src="'data:image/png;base64,'+filterpng" class="overlay" v-if="pngfilter"/>
        <a-scene ref="model" vr-mode-ui="enabled: false">
          <a-entity v-if="model" position="0 0.5 0.3" rotation="0 0 0"
              gltf-model="https://arjs-cors-proxy.herokuapp.com/https://media-uploader.work/?mode=dl&id=13751&original=1&key=dfb1aa80-f608-4834-9542-50ecba032184">
          </a-entity>
        </a-scene>
      </div>
       <canvas ref="canvas" id="canvas"></canvas>       
       <img id="snap" v-bind:src="'data:image/png;base64,'+snapimage"  v-if="capture"/>
      <div class="menu-button">
        <a href="#" v-on:click="start"></a>
        <a href="#" v-on:click="deletecapture"></a>
        <a href="#" ref="dl" download="buncam.png"></a>
        <a href="#" v-on:click="capturevideo" ></a>
      </div>
</template>

<script>
// document.querySelector("a-scene").renderer.gammaOutput = true;
import Peer from 'skyway-js';
import {ref} from "vue";
import 'aframe';
import SpriteAnimation from "../components/SpriteAnimation";

// buttonのindex(データの順番)と実際のボタンの対応表
const buttonMappingMap = new Map([
    [0, "A"],
    [1, "B"],
    [2, "X"],
    [3, "Y"],
    [4, "L︎︎B"],
    [5, "R︎︎B"],
    [6, "L︎T"],
    [7, "RT"],
    [8, "中央左ボタン"],
    [9, "中央右ボタン"],
    [10, "左スティック押し込み"],
    [11, "右スティック押し込み"],
    [12, "▲"],
    [13, "▼"],
    [14, "◀"],
    [15, "▶"],
    [16, ""]
])

export default {
  name: 'Master',
  setup() {
    const theirRef = ref(null)
    const localStream = ref(null);
    const currentPeer = ref({})
    const theirId = ref('')
    
    const initSkyway = () => {
      const peer = new Peer('Master',{key: process.env.VUE_APP_API_KEY, debug: 3});

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
        console.log('width'+stream.getVideoTracks()[0].getSettings().width);
        console.log('height'+stream.getVideoTracks()[0].getSettings().height);
        const tracks = videoElm.srcObject.getVideoTracks();
        tracks.forEach(track => {
          if ('contentHint' in track) {
            track.contentHint = 'detail';
            if (track.contentHint !== 'detail') {
              console.log('Invalid video track contentHint: detail');
              }
          } else {
              console.log('MediaStreamTrack contentHint attribute not supported');
          }
        });
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
      canvas: {},
      captures: [],
      prefilter1: false,
      prefilter2: false,
      jpgfilter: false,
      pngfilter: false,
      model:false,
      capture:false,
      timerId: null,
      buttons: [],
      axes: [],
      isStart: false,
      ActiveBtn: false
    }
  },
  components:{
    SpriteAnimation
  },
  computed: {
    buttonMapping() {
      return buttonMappingMap
    }
  },
  mounted() {
   window.addEventListener('resize', this.calculateWindowWidth);
   // 接続された時に発火する
   window.addEventListener("gamepadconnected", this.connected);
    // 接続が切れた時に発火する
   window.addEventListener("gamepaddisconnected", this.disconnected);

  //  this.initSkyway();
  },
  beforeDestroy() {
   window.removeEventListener('resize', this.calculateWindowWidth);
  },
  // 他のページに遷移するときはOFFにする
  beforeUnmount() {
    window.removeEventListener("gamepadconnected", this.connected);
    window.removeEventListener("gamepaddisconnected", this.disconnected);
  },
  methods: {
    changefilter1(){
      this.prefilter1 = true;
      this.prefilter2 = false;
      this.jpgfilter = false;
      this.pngfilter = false;
      this.model = false;
    },
    changefilter2(){
      this.prefilter1 = false;
      this.prefilter2 = true;
      this.jpgfilter = false;
      this.pngfilter = false;
      this.model = false;
    },
    changemodel(){
      this.model = true;
      this.prefilter1 = false;
      this.prefilter2 = false;
      this.jpgfilter = false;
      this.pngfilter = false;
      this.$refs.model.renderer.gammaOutput = true;
    },
    start() {
      console.log('Anime-start');
      this.isStart = true
    },
    reset() {
      console.log('Anime-finish');
      this.isStart = false
    },
    changefullscreen(){
          if(document.fullscreenElement){
            document.exitFullscreen();
          }else{
            document.body.requestFullscreen();
          }
        },
        async uploadfilter(event){
          const files = event.target.files || event.dataTransfer.files;
          const file = files[0];
          console.log('upload ok');

          if (this.checkFile(file)) {
            const picture = await this.getBase64(file);
            console.log('file ready');
            console.log('picture = '+picture)
            let image = picture.split(',');
            if(file.type === 'image/jpeg'){
              console.log('jpeg set');
              this.filterjpeg = image[1];
              this.prefilter1 = false;
              this.prefilter2 = false;
              this.jpgfilter = true;
              this.pngfilter = false;
              this.model = false;
            }else{
              console.log('png set');
              this.filterpng = image[1];
              this.prefilter1 = false;
              this.prefilter2 = false;
              this.jpgfilter = false;
              this.pngfilter = true;
              this.model = false;
            }
          }
        },
        checkFile(file) {
          let result = true
          const SIZE_LIMIT = 5000000 // 5MB
          // ローカルマシンからの読み込みをキャンセルしたら処理中断
          if (!file) {
            result = false
          }
          // jpeg か png 関連ファイル以外は受付けない
          if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
            result = false
          }
          // 上限サイズより大きければ受付けない
          if (file.size > SIZE_LIMIT) {
            result = false
          }
          return result
        },
        getBase64(file) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result)
            reader.onerror = error => reject(error)
          })
        },
        capturevideo(){
          let myvideo = this.theirRef;                           
          this.canvas = this.$refs.canvas;
          console.log('myvideo.width='+myvideo.width);
          console.log('myvideo.height='+myvideo.height);
          this.canvas.width = myvideo.width;
          this.canvas.height = myvideo.height;
          console.log(this.canvas);
          this.canvas.getContext('2d').drawImage(myvideo,0,0,myvideo.width,myvideo.height);

          //今表示しているフィルターも書き込む
          if(this.prefilter1){
            let image = this.$refs.prefilter1;
            this.canvas.getContext('2d').drawImage(image,0,0,myvideo.width,myvideo.height);
          }else if(this.prefilter2){
            let image = this.$refs.prefilter2;
            this.canvas.getContext('2d').drawImage(image,0,0,myvideo.width,myvideo.height);
          }else if(this.jpgfilter){
            let image = this.$refs.jpgfilter;
            this.canvas.getContext('2d').drawImage(image,0,0,myvideo.width,myvideo.height);
          }else if(this.pngfilter){
            let image = this.$refs.pngfilter;
            this.canvas.getContext('2d').drawImage(image,0,0,myvideo.width,myvideo.height);
          }else if(this.model){
            let scene = this.$refs.model.components.screenshot.getCanvas("perspective");
            this.canvas.getContext('2d').drawImage(scene,0,0,myvideo.width,myvideo.height);
          }
          console.log(this.canvas.toDataURL('image/png'));
          let dl = this.$refs.dl;
          dl.href = this.canvas.toDataURL('image/png');
          let capture = this.canvas.toDataURL('image/png').split(',');
          this.snapimage = capture[1];
          this.capture = true;
          console.log('getCapture');
        },
        deletecapture(){
          this.capture = false;
          this.snapimage = '';
        },
        calculateWindowWidth() {
          let video = this.theirRef;
          video.width = window.innerWidth;
          video.height = window.innerHeight;
          console.log(video);
        },
        connected(e) {
      console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
          e.gamepad.index, e.gamepad.id,
          e.gamepad.buttons.length, e.gamepad.axes.length);

      this.ticker()
    },
    disconnected(e) {
      console.log("Gamepad disconnected from index %d: %s",
          e.gamepad.index, e.gamepad.id);
      this.stop()
    },
    ticker() {
      // コントローラーの全ての値をbuttonとaxesに保存するloop
      const loop = () => {
        const controllers = navigator.getGamepads();
        // console.log(controllers);
        //const controller = Array.from(controllers).find(c => !!c);
        let controller = [];
        for(let i = 0; i < controllers.length ; i++){
          // console.log('No'+i+'='+controllers[i])
          if(controllers[i] != null){
          //  console.log('controller='+ controllers[i].id + 'button=' + controllers[i].buttons.length);
           if(controllers[i].buttons.length > 0){
             controller = controllers[i];
            //  console.log(controller)
             break;
           }
          }
        }
        this.buttons = controller.buttons.map(button => button.pressed);
        this.axes = controller.axes.map(axis => axis.toFixed(4));
        this.timerId = requestAnimationFrame(loop)
      }
      this.timerId = requestAnimationFrame(loop)
    },
    stop() {
      cancelAnimationFrame(this.timerId)
      this.timerId = null
    },
    sleep(msec) {
          return new Promise(function (resolve) {

            setTimeout(function () { resolve() }, msec);

          })
        }
  },
  watch: {
    buttons: async function (buttonsValue) {
      if (buttonsValue[0] === true) {
        console.log(this.buttonMapping.get(0), 'が押されてます')
        this.changefilter1();
      }
      if (buttonsValue[1] === true) {
        console.log(this.buttonMapping.get(1), 'が押されてます')
        this.changefilter2();
      }
      if (buttonsValue[2] === true) {
        console.log(this.buttonMapping.get(2), 'が押されてます')
        this.changemodel();
      }
      if (buttonsValue[3] === true) {
        console.log(this.buttonMapping.get(3), 'が押されてます')
        this.stop();
        this.changefullscreen();
        await this.sleep(1000);
        this.ticker();
      }
      if (buttonsValue[4] === true) {
        console.log(this.buttonMapping.get(4), 'が押されてます')
        this.start();
      }
      if (buttonsValue[5] === true) {
        console.log(this.buttonMapping.get(5), 'が押されてます')
        this.capturevideo();
      }
      if (buttonsValue[6] === true) {
        console.log(this.buttonMapping.get(6), 'が押されてます')
        this.deletecapture();
      }
      if (buttonsValue[7] === true) {
        console.log(this.buttonMapping.get(7), 'が押されてます')
        this.$refs.dl.click();
      }      
    }
  },
}
</script>

<style>

/*ボタン*/
.hamburger_btn {
  position: fixed; /*常に最上部に表示したいので固定*/
  top: 0;
  right: 0;
  width: 70px;
  height: 72px;
  cursor: pointer;
  z-index: 50;
}

.hamburger_btn .line {
  position: absolute;
  top: 0;
  left: 20px;
  width: 32px;
  height: 2px;
  background: #333333;
  text-align: center;
}

.hamburger_btn .line_01 {
  top: 16px;
  transition: 0.4s ease;
}
.hamburger_btn .line_02 {
  top: 26px;
  transition: 0.4s ease;
}
.hamburger_btn .line_03 {
  top: 36px;
  transition: 0.4s ease;
}


.btn_line01 {
  transform: translateY(10px) rotate(-45deg);
  transition: 0.4s ease;
}
.btn_line02 {
  transition: 0.4s ease;
  opacity: 0;
}
.btn_line03 {
  transform: translateY(-10px) rotate(45deg);
  transition: 0.4s ease;
}

/*サイドバー*/
.menu-enter-active, .menu-leave-active {
  transition: opacity 0.4s;
}
.menu-enter, .menu-leave-to {
  opacity: 0;
}
.menu-leave, .menu-enter-to{
  opacity: 1;
}

.menu li {
  list-style: none;
  line-height: auto;
  padding: auto;
  flex-grow:1;
}
.menu {
  background-color: rgba(197, 197, 197, 0.671);
  z-index: 30;
  padding: 2rem 1rem;
  position: fixed;
  width: 20rem;
  height: 100vh;
  top: 0;
  right: 0;
  overflow: auto;
}
.menu a {
  color: rgb(66, 66, 66);
  text-decoration: none;
  font-size: 1rem;
  padding: 0 2rem;
}
.menu ul{
  margin: 1rem;
  padding: 0;
  display:flex;
  flex-direction: column;
}

  #canvas {
    display: none;
  }

  #video {
  /* position: fixed; right: 0; bottom: 0; */
  position: absolute; top: 50%; left:50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  min-width: 100%; min-height: 100%;
  /* max-width: 100%; max-height: 100%;
  width: auto; height: auto;  */
  width: 100%; height: 100%; 
  object-fit: cover;
  z-index: -100;
  background-size: cover;
  }

  #app{
    max-width: 100vw; max-height: 100vh;
  }

  .container{
    max-width: 100%; max-height: 100%;
    width: 100vw; height: 100vh;
  }

  .SpriteAnimation {
  /* position: absolute; bottom: 24%; left:37%; */
  /* transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%); */
  /* min-width: 100%; min-height: 100%;
  width: 100%; height: 100%; 
  object-fit: cover; */
  z-index: -75;
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
    /* text-shadow: 2px 2px 2px rgb(0, 27, 6); */
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
    font-family: 'Orbitron', sans-serif;
    text-decoration: none;
    background: #4ec99000;
    color: rgb(100, 160, 77);
    /* text-shadow: 1px 1px 1px rgb(0, 27, 6); */
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

  #canvas {
  display: none;
}

  #snap {
    position: absolute;
    z-index: 100;
    top: 5%;
    right: 0%;
    max-width: 15%;
    height: auto;
    display: block;    
  }

.menu-button {
  position: absolute;
  right: 2rem;
  bottom: 2rem;
  width: 3rem;
  height: 3rem;
  text-align: center;
  line-height: 60px;
  border-radius: 50%;
  background-color: #e91e6200;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26), 0 2px 10px 0 rgba(0, 0, 0, 0.22);
  cursor: pointer;
}
.menu-button a {
  opacity: 1;
  width: 100%;
  height: 100%;
  text-align: center;
  line-height: 50px;
  border-radius: 50%;
  border-width: 2px;
  border-style:solid;
  border-color: #24bb68;
  background: #6ec73b00;
  background-size: contain;
  font-size: 1px;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26), 0 2px 10px 0 rgba(0, 0, 0, 0.22);
  cursor: pointer;
}
.menu-button a:nth-child(1) {
  position: absolute;
  right: 0px;
  bottom: 0px;
  background-image: url(/icon_Atack.png); 
}

.menu-button a:nth-child(2) {
  position: absolute;
  right: 80px;
  bottom: 0px;
  background-image: url(/icon_delete.png); 
}
.menu-button a:nth-child(3) {
  position: absolute;
  right: 65px;
  bottom: 65px;
  background-image: url(/icon_dl.png); 
}
.menu-button a:nth-child(4) {
  position: absolute;
  right: 0px;
  bottom: 80px;
  background-image: url(/icon_cam.png); 
}

</style>