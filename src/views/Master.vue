<template>
  <h1>親ページ</h1>
  <section>
    <h2>相手のvideo</h2>
    <p>Peer ID: {{ currentPeer.id }}</p>
    <video ref="theirRef" width="400" autoplay muted playsinline></video>
  </section>
  <button @click="initSkyway">カメラの初期化</button>
  <router-link to="/puppet">子ページ</router-link>
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
      initSkyway,
    }
  }
}
</script>
