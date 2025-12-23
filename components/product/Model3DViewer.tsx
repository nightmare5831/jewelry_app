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

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <style>
        body {
          margin: 0;
          overflow: hidden;
          background: #808080;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #canvas { width: 100%; height: 100vh; display: block; }
        #error { color: red; padding: 20px; text-align: center; font-family: sans-serif; display: none; }
        #loading { color: #ffffff; padding: 20px; text-align: center; font-family: sans-serif; display: none; }
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
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

        function showError(msg) {
          document.getElementById('loading').style.display = 'none';
          document.getElementById('error').style.display = 'block';
          document.getElementById('error').textContent = msg;
          window.ReactNativeWebView?.postMessage('error:' + msg);
        }

        try {
          const scene = new THREE.Scene();

          // Gray background for jewelry display
          scene.background = new THREE.Color(0x808080);

          const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
          camera.position.z = 5;

          const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
          });
          renderer.setSize(window.innerWidth, window.innerHeight);
          renderer.setPixelRatio(window.devicePixelRatio);
          renderer.outputColorSpace = THREE.SRGBColorSpace;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.8;
          renderer.shadowMap.enabled = false;
          document.body.appendChild(renderer.domElement);

          // Create environment map for metallic reflections
          const pmremGenerator = new THREE.PMREMGenerator(renderer);
          const envScene = new RoomEnvironment();
          const envMap = pmremGenerator.fromScene(envScene).texture;
          scene.environment = envMap;
          scene.environmentIntensity = 1.5;
          pmremGenerator.dispose();

          // Add OrbitControls for zoom and manual rotation
          const controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.dampingFactor = 0.05;
          controls.minDistance = 2;
          controls.maxDistance = 10;
          controls.enablePan = false;
          controls.autoRotate = true;
          controls.autoRotateSpeed = 2.0;

          // Soft studio lighting - no shadows, very bright even illumination

          // Very high ambient light for overall brightness (no shadows)
          const ambientLight = new THREE.AmbientLight(0xffffff, 6.0);
          scene.add(ambientLight);

          // Hemisphere light for soft natural fill (sky + ground)
          const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 4.5);
          hemiLight.position.set(0, 10, 0);
          scene.add(hemiLight);

          // Soft directional lights from multiple angles (no shadows)
          // Front lights
          const frontLight1 = new THREE.DirectionalLight(0xffffff, 4.5);
          frontLight1.position.set(0, 5, 10);
          scene.add(frontLight1);

          const frontLight2 = new THREE.DirectionalLight(0xffffff, 4.5);
          frontLight2.position.set(5, 3, 8);
          scene.add(frontLight2);

          const frontLight3 = new THREE.DirectionalLight(0xffffff, 4.5);
          frontLight3.position.set(-5, 3, 8);
          scene.add(frontLight3);

          // Back lights for rim highlights
          const backLight1 = new THREE.DirectionalLight(0xffffff, 3.0);
          backLight1.position.set(0, 5, -10);
          scene.add(backLight1);

          const backLight2 = new THREE.DirectionalLight(0xffffff, 3.0);
          backLight2.position.set(5, 3, -8);
          scene.add(backLight2);

          const backLight3 = new THREE.DirectionalLight(0xffffff, 3.0);
          backLight3.position.set(-5, 3, -8);
          scene.add(backLight3);

          // Bottom lights to eliminate dark areas
          const bottomLight1 = new THREE.DirectionalLight(0xffffff, 4.0);
          bottomLight1.position.set(0, -10, 0);
          scene.add(bottomLight1);

          const bottomLight2 = new THREE.DirectionalLight(0xffffff, 3.5);
          bottomLight2.position.set(0, -8, 5);
          scene.add(bottomLight2);

          const bottomLight3 = new THREE.DirectionalLight(0xffffff, 3.5);
          bottomLight3.position.set(0, -8, -5);
          scene.add(bottomLight3);

          // Additional side lights for complete coverage
          const sideLight1 = new THREE.DirectionalLight(0xffffff, 3.5);
          sideLight1.position.set(10, 0, 0);
          scene.add(sideLight1);

          const sideLight2 = new THREE.DirectionalLight(0xffffff, 3.5);
          sideLight2.position.set(-10, 0, 0);
          scene.add(sideLight2);

          // Diagonal lights from corners
          const diagLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
          diagLight1.position.set(7, 7, 7);
          scene.add(diagLight1);

          const diagLight2 = new THREE.DirectionalLight(0xffffff, 2.5);
          diagLight2.position.set(-7, 7, 7);
          scene.add(diagLight2);

          const diagLight3 = new THREE.DirectionalLight(0xffffff, 2.5);
          diagLight3.position.set(7, 7, -7);
          scene.add(diagLight3);

          const diagLight4 = new THREE.DirectionalLight(0xffffff, 2.5);
          diagLight4.position.set(-7, 7, -7);
          scene.add(diagLight4);

          const diagLight5 = new THREE.DirectionalLight(0xffffff, 2.5);
          diagLight5.position.set(7, -7, 7);
          scene.add(diagLight5);

          const diagLight6 = new THREE.DirectionalLight(0xffffff, 2.5);
          diagLight6.position.set(-7, -7, 7);
          scene.add(diagLight6);

          const diagLight7 = new THREE.DirectionalLight(0xffffff, 2.5);
          diagLight7.position.set(7, -7, -7);
          scene.add(diagLight7);

          const diagLight8 = new THREE.DirectionalLight(0xffffff, 2.5);
          diagLight8.position.set(-7, -7, -7);
          scene.add(diagLight8);

          let model;
          const loader = new GLTFLoader();

          const modelUrl = '${modelUrl}';
          window.ReactNativeWebView?.postMessage('loading:' + modelUrl);

          // Add timeout for large files (30 seconds)
          const loadTimeout = setTimeout(() => {
            showError('Model loading timeout. File may be too large (14MB). Consider optimizing the model.');
          }, 30000);

          loader.load(
            modelUrl,
            (gltf) => {
              clearTimeout(loadTimeout);
              console.log('✅ 3D model loaded successfully');
              document.getElementById('loading').style.display = 'none';

              model = gltf.scene;

              // Ensure materials/textures render correctly
              model.traverse((child) => {
                if (child.isMesh) {
                  child.castShadow = false;
                  child.receiveShadow = false;

                  // Ensure geometry has proper UV coordinates for AO maps
                  if (child.geometry && !child.geometry.attributes.uv2 && child.geometry.attributes.uv) {
                    child.geometry.setAttribute('uv2', child.geometry.attributes.uv);
                  }

                  // Ensure materials are updated and textures are properly configured
                  if (child.material) {
                    // Handle both single materials and material arrays
                    const materials = Array.isArray(child.material) ? child.material : [child.material];

                    materials.forEach((mat) => {
                      // Ensure material updates
                      mat.needsUpdate = true;

                      // Ensure textures use correct color space and UV mapping
                      if (mat.map) {
                        mat.map.colorSpace = THREE.SRGBColorSpace;
                        mat.map.needsUpdate = true;
                        mat.map.flipY = false;
                      }
                      if (mat.emissiveMap) {
                        mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
                        mat.emissiveMap.needsUpdate = true;
                        mat.emissiveMap.flipY = false;
                      }
                      if (mat.normalMap) {
                        mat.normalMap.needsUpdate = true;
                        mat.normalMap.flipY = false;
                      }
                      if (mat.roughnessMap) {
                        mat.roughnessMap.needsUpdate = true;
                        mat.roughnessMap.flipY = false;
                      }
                      if (mat.metalnessMap) {
                        mat.metalnessMap.needsUpdate = true;
                        mat.metalnessMap.flipY = false;
                      }
                      if (mat.aoMap) {
                        mat.aoMap.needsUpdate = true;
                        mat.aoMap.flipY = false;
                        if (mat.aoMapIntensity === undefined) {
                          mat.aoMapIntensity = 1.0;
                        }
                      }

                      // Ensure proper rendering
                      mat.side = THREE.FrontSide;

                      // Enhance emissive intensity for glowing elements
                      if (mat.emissive && (mat.emissive.r > 0 || mat.emissive.g > 0 || mat.emissive.b > 0)) {
                        mat.emissiveIntensity = Math.max(mat.emissiveIntensity || 1.0, 2.0);
                      }

                      // Brighten base colors that appear too dark
                      if (mat.color) {
                        const brightness = (mat.color.r + mat.color.g + mat.color.b) / 3;
                        // If material is dark but should be metallic/bright
                        if (brightness < 0.5 && mat.metalness !== undefined && mat.metalness > 0) {
                          const factor = 1.5;
                          mat.color.r = Math.min(1.0, mat.color.r * factor);
                          mat.color.g = Math.min(1.0, mat.color.g * factor);
                          mat.color.b = Math.min(1.0, mat.color.b * factor);
                        }
                      }
                    });
                  }
                }
              });

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
            controls.update();
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
          // Don't set loading to false here - wait for the 3D model to load
        }}
        onMessage={(event) => {
          const message = event.nativeEvent.data;

          if (message === 'loaded') {
            setLoading(false);
            setErrorMsg(null);
            setProgress(100);
          } else if (message.startsWith('error:')) {
            setLoading(false);
            setErrorMsg(message.substring(6));
            console.error('3D Model error:', message.substring(6));
          } else if (message.startsWith('loading:')) {
            // Silently handle loading start
          } else if (message.startsWith('progress:')) {
            const percent = parseInt(message.substring(9));
            setProgress(percent);
            // Don't log progress updates - user can see progress on screen
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
          <ActivityIndicator size="large" color="#D4AF37" />
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
    overflow: 'hidden',
    backgroundColor: '#808080',
    borderWidth: 2,
    borderColor: '#808080',
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
    backgroundColor: '#808080',
  },
  progressText: {
    marginTop: 12,
    color: '#ffffff',
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
    backgroundColor: '#808080',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
});
