import { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text as RNText } from 'react-native';
import { WebView } from 'react-native-webview';

interface Model3DViewerProps {
  modelUrl: string;
  height?: number;
}

export default function Model3DViewer({ modelUrl, height }: Model3DViewerProps) {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  console.log('Model3DViewer rendering with URL:', modelUrl);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <style>
        body { margin: 0; overflow: hidden; background: #f5f5f5; display: flex; align-items: center; justify-content: center; }
        #canvas { width: 100%; height: 100vh; display: block; }
        #error { color: red; padding: 20px; text-align: center; font-family: sans-serif; display: none; }
        #loading { color: #666; padding: 20px; text-align: center; font-family: sans-serif; }
      </style>
    </head>
    <body>
      <div id="loading">Loading 3D Model...</div>
      <div id="error"></div>
      <script type="importmap">
        {
          "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
          }
        }
      </script>
      <script type="module">
        import * as THREE from 'three';
        import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

        function showError(msg) {
          document.getElementById('loading').style.display = 'none';
          document.getElementById('error').style.display = 'block';
          document.getElementById('error').textContent = msg;
          window.ReactNativeWebView?.postMessage('error:' + msg);
        }

        try {
          const scene = new THREE.Scene();
          scene.background = new THREE.Color(0xf5f5f5);

          const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
          camera.position.z = 5;

          const renderer = new THREE.WebGLRenderer({ antialias: true });
          renderer.setSize(window.innerWidth, window.innerHeight);
          document.body.appendChild(renderer.domElement);

          // Brighter lighting
          const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
          scene.add(ambientLight);

          const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
          directionalLight1.position.set(10, 10, 5);
          scene.add(directionalLight1);

          const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
          directionalLight2.position.set(-10, -10, -5);
          scene.add(directionalLight2);

          let model;
          const loader = new GLTFLoader();

          console.log('Attempting to load model from: ${modelUrl}');
          window.ReactNativeWebView?.postMessage('loading:${modelUrl}');

          // Add timeout for large files (30 seconds)
          const loadTimeout = setTimeout(() => {
            showError('Model loading timeout. File may be too large (14MB). Consider optimizing the model.');
          }, 30000);

          loader.load(
            '${modelUrl}',
            (gltf) => {
              clearTimeout(loadTimeout);
              console.log('✅ 3D model loaded successfully');
              document.getElementById('loading').style.display = 'none';

              model = gltf.scene;

              // Center and scale model
              const box = new THREE.Box3().setFromObject(model);
              const center = box.getCenter(new THREE.Vector3());
              const size = box.getSize(new THREE.Vector3());
              const maxDim = Math.max(size.x, size.y, size.z);
              const scale = 3 / maxDim;

              model.scale.setScalar(scale);
              model.position.sub(center.multiplyScalar(scale));

              scene.add(model);
              window.ReactNativeWebView?.postMessage('loaded');
            },
            (progress) => {
              if (progress.total > 0) {
                const percent = (progress.loaded / progress.total * 100).toFixed(0);
                const mbLoaded = (progress.loaded / 1024 / 1024).toFixed(1);
                const mbTotal = (progress.total / 1024 / 1024).toFixed(1);
                console.log('Loading progress:', percent + '%', mbLoaded + 'MB /' + mbTotal + 'MB');
                document.getElementById('loading').textContent = 'Loading... ' + percent + '% (' + mbLoaded + '/' + mbTotal + ' MB)';
                window.ReactNativeWebView?.postMessage('progress:' + percent);
              }
            },
            (error) => {
              clearTimeout(loadTimeout);
              console.error('❌ Error loading model:', error);
              showError('Failed to load 3D model: ' + error.message);
            }
          );

          function animate() {
            requestAnimationFrame(animate);
            if (model) model.rotation.y += 0.01;
            renderer.render(scene, camera);
          }
          animate();

          window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
          });
        } catch (e) {
          showError('Initialization error: ' + e.message);
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, height ? { height } : { flex: 1 }]}>
      <WebView
        source={{ html }}
        style={styles.webview}
        onLoadEnd={() => {
          console.log('WebView loaded');
          // Don't set loading to false here - wait for the 3D model to load
        }}
        onMessage={(event) => {
          const message = event.nativeEvent.data;
          console.log('WebView message:', message);
          if (message === 'loaded') {
            setLoading(false);
            setErrorMsg(null);
            setProgress(100);
          } else if (message.startsWith('error:')) {
            setLoading(false);
            setErrorMsg(message.substring(6));
          } else if (message.startsWith('loading:')) {
            console.log('Starting to load:', message.substring(8));
          } else if (message.startsWith('progress:')) {
            const percent = parseInt(message.substring(9));
            setProgress(percent);
          }
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          setErrorMsg('WebView failed to load');
          setLoading(false);
        }}
        originWhitelist={['*']}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFCC00" />
          {progress > 0 && progress < 100 && (
            <RNText style={styles.progressText}>{progress}%</RNText>
          )}
        </View>
      )}
      {errorMsg && (
        <View style={styles.errorOverlay}>
          <RNText style={styles.errorText}>{errorMsg}</RNText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  progressText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
});
