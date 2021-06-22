<template>
  <h1>子ページ</h1>
  <section class="video-wrapper">
    <h2>自分のvideo</h2>
    <p>Peer ID: {{ currentPeer.id }}</p>
    <video ref="videoRef" width="400" autoplay muted playsinline></video>
  </section>
  <div class="buttons">
    <button @click="initialize">カメラの初期化</button>
    <input v-model="theirId" />
    <button @click="call">発信</button>
  </div>
  <router-link to="/">親ページ</router-link>
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
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
        const videoElm = videoRef.value
        videoElm.srcObject = stream;
        await videoElm.play();
        localStream.value = stream;
        initSkyway()
      } catch (error) {
        console.error('mediaDevice.getUserMedia() error:', error);
      }
    }

    const call = () => {
      currentPeer.value.call(theirId.value, localStream.value);
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
