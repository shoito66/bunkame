<template>
  <h1>子ページ</h1>
  <section class="video-wrapper">
    <h2>自分のvideo</h2>
    <p>Peer ID: {{ currentPeer.id }}</p>
    <div class="buttons">
    <button @click="initialize">カメラの初期化</button>
    <input v-model="theirId" />
    <button @click="call">発信</button>
  </div>
  <router-link to="/">親ページ</router-link>
  <br/>
    <!-- <video ref="videoRef" autoplay muted playsinline></video> -->
    <video ref="videoRef" width="400" autoplay muted playsinline></video>
  </section>

</template>

<script>
import Peer from 'skyway-js';
import {ref} from "vue";

export default {
  name: 'Puppet',
  setup() {
    const videoRef = ref(null)
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
      });
    }

    const initialize = async () => {
      try {
        let constraints = {};
        if (navigator.userAgent.indexOf('iPhone') > 0 || navigator.userAgent.indexOf('Android') > 0 && navigator.userAgent.indexOf('Mobile') > 0) {
          console.log('スマホ');
          constraints = { video: { width: { ideal: 4096 }, height: { ideal: 2160 } ,facingMode: { exact: "environment" } } };
        } else {
          console.log('PC');
          constraints = { video: { width: { ideal: 4096 }, height: { ideal: 2160 } },audio: false };
        }

        console.log(constraints);
        // const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        console.log('width'+stream.getVideoTracks()[0].getSettings().width);
        console.log('height'+stream.getVideoTracks()[0].getSettings().height);
        const videoElm = videoRef.value
        videoElm.srcObject = stream;
        await videoElm.play();
        localStream.value = stream;
        const tracks = localStream.value.getVideoTracks();
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
        initSkyway()
      } catch (error) {
        console.error('mediaDevice.getUserMedia() error:', error);
      }
    }

    const call = () => {
      // currentPeer.value.call(theirId.value, localStream.value);
      currentPeer.value.call('Master', localStream.value);
    }

    return {
      currentPeer,
      videoRef,
      theirId,
      initialize,
      call
    }
  }
}
</script>
