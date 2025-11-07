# 3D Product Viewer Implementation Guide

## Overview

This guide covers implementing a high-performance 3D product viewer in React Native that supports multiple 3D file formats (GLB, OBJ, STL) for jewelry product visualization.

---

## Supported 3D Formats

| Format | Description | File Size | Best For | Priority |
|--------|-------------|-----------|----------|----------|
| **.glb** | Binary glTF (recommended) | Small | Production use, mobile optimization | **Primary** |
| **.obj** | Wavefront OBJ | Medium | Legacy models, simple geometry | Secondary |
| **.stl** | Stereolithography | Large | 3D printing files, technical models | Fallback |

**Recommendation**: Primarily use GLB format. Convert OBJ/STL to GLB for better performance.

---

## Technology Stack

### React Native 3D Libraries

#### Option 1: Expo GL + Three.js (Recommended)
**Pros**:
- Works with Expo managed workflow
- Full Three.js ecosystem support
- Great documentation
- Supports all formats (GLB, OBJ, STL)
- Active community

**Cons**:
- Larger bundle size
- May require performance optimization

**Installation**:
```bash
npx expo install expo-gl expo-three three @react-three/fiber
```

#### Option 2: React Native WebView + Three.js
**Pros**:
- Easier setup
- No native dependencies
- Quick prototyping

**Cons**:
- Lower performance
- Limited gesture support
- Memory overhead

---

## Implementation with Expo GL + Three.js

### 1. Install Dependencies

```bash
cd app
npx expo install expo-gl expo-three three
npm install @react-three/fiber@~8.15.0
npm install three@~0.160.0
npm install expo-asset expo-file-system
```

### 2. Create 3D Viewer Component

**app/components/3d/ProductViewer3D.tsx**:
```typescript
import React, { Suspense, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { useGLTF, useOBJ, Environment, OrbitControls } from '@react-three/drei/native';
import * as THREE from 'three';

interface ProductViewer3DProps {
  modelUrl: string;
  modelType: 'glb' | 'obj' | 'stl';
  autoRotate?: boolean;
  enableZoom?: boolean;
}

// GLB Model Component
function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  // Auto-center and scale model
  React.useEffect(() => {
    if (modelRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Center model
      modelRef.current.position.x = -center.x;
      modelRef.current.position.y = -center.y;
      modelRef.current.position.z = -center.z;

      // Scale to fit view (jewelry typically small)
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      modelRef.current.scale.set(scale, scale, scale);
    }
  }, []);

  return <primitive ref={modelRef} object={scene} />;
}

// OBJ Model Component
function OBJModel({ url }: { url: string }) {
  const obj = useOBJ(url);
  const modelRef = useRef<THREE.Group>(null);

  React.useEffect(() => {
    if (modelRef.current && obj) {
      // Apply default material if needed
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (!child.material) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xffd700, // Gold color
              metalness: 0.9,
              roughness: 0.1,
            });
          }
        }
      });

      // Auto-center and scale
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      obj.position.x = -center.x;
      obj.position.y = -center.y;
      obj.position.z = -center.z;

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      obj.scale.set(scale, scale, scale);
    }
  }, [obj]);

  return obj ? <primitive ref={modelRef} object={obj} /> : null;
}

// STL Loader (requires custom implementation)
function STLModel({ url }: { url: string }) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  React.useEffect(() => {
    const loader = new STLLoader();
    loader.load(url, (geo) => {
      setGeometry(geo);
    });
  }, [url]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={0xffd700}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}

// Main Viewer Component
export default function ProductViewer3D({
  modelUrl,
  modelType,
  autoRotate = true,
  enableZoom = true,
}: ProductViewer3DProps) {
  const [error, setError] = useState<string | null>(null);

  const ModelComponent = {
    glb: GLBModel,
    obj: OBJModel,
    stl: STLModel,
  }[modelType];

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={styles.canvas}
        >
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} />
          <spotLight
            position={[0, 10, 0]}
            angle={0.3}
            intensity={0.8}
            castShadow
          />

          {/* Environment for reflections (jewelry looks better) */}
          <Environment preset="studio" />

          {/* Model */}
          <Suspense
            fallback={
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="gray" />
              </mesh>
            }
          >
            <ModelComponent url={modelUrl} />
          </Suspense>

          {/* Camera Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={enableZoom}
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 4}
          />
        </Canvas>
      )}

      {/* Loading indicator */}
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading 3D Model...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  canvas: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    fontSize: 16,
  },
});

// Preload models for better performance
useGLTF.preload = (url: string) => useGLTF(url);
```

### 3. STL Loader Implementation

**app/utils/STLLoader.ts**:
```typescript
import * as THREE from 'three';

export class STLLoader extends THREE.Loader {
  load(
    url: string,
    onLoad: (geometry: THREE.BufferGeometry) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (error: Error) => void
  ) {
    const loader = new THREE.FileLoader(this.manager);
    loader.setResponseType('arraybuffer');

    loader.load(
      url,
      (data) => {
        try {
          const geometry = this.parse(data as ArrayBuffer);
          onLoad(geometry);
        } catch (e) {
          if (onError) onError(e as Error);
        }
      },
      onProgress,
      onError
    );
  }

  parse(data: ArrayBuffer): THREE.BufferGeometry {
    const isASCII = (data: ArrayBuffer) => {
      const header = new Uint8Array(data, 0, 5);
      return (
        header[0] === 115 && // s
        header[1] === 111 && // o
        header[2] === 108 && // l
        header[3] === 105 && // i
        header[4] === 100    // d
      );
    };

    return isASCII(data)
      ? this.parseASCII(this.ensureString(data))
      : this.parseBinary(data);
  }

  parseASCII(data: string): THREE.BufferGeometry {
    const patternFace = /facet([\s\S]*?)endfacet/g;
    const vertices: number[] = [];
    const normals: number[] = [];

    let result;
    while ((result = patternFace.exec(data)) !== null) {
      const text = result[0];
      const normalMatch = /normal\s+([\d\.\-e]+)\s+([\d\.\-e]+)\s+([\d\.\-e]+)/g.exec(text);

      if (normalMatch) {
        const normal = [
          parseFloat(normalMatch[1]),
          parseFloat(normalMatch[2]),
          parseFloat(normalMatch[3]),
        ];

        const vertexPattern = /vertex\s+([\d\.\-e]+)\s+([\d\.\-e]+)\s+([\d\.\-e]+)/g;
        let vertexMatch;
        while ((vertexMatch = vertexPattern.exec(text)) !== null) {
          vertices.push(
            parseFloat(vertexMatch[1]),
            parseFloat(vertexMatch[2]),
            parseFloat(vertexMatch[3])
          );
          normals.push(normal[0], normal[1], normal[2]);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

    return geometry;
  }

  parseBinary(data: ArrayBuffer): THREE.BufferGeometry {
    const reader = new DataView(data);
    const faces = reader.getUint32(80, true);

    const vertices = new Float32Array(faces * 3 * 3);
    const normals = new Float32Array(faces * 3 * 3);

    for (let face = 0; face < faces; face++) {
      const start = 84 + face * 50;

      for (let i = 0; i < 3; i++) {
        const vertexStart = start + 12 + i * 12;
        const normalIndex = face * 9 + i * 3;

        normals[normalIndex] = reader.getFloat32(start + i * 4, true);
        normals[normalIndex + 1] = reader.getFloat32(start + i * 4 + 4, true);
        normals[normalIndex + 2] = reader.getFloat32(start + i * 4 + 8, true);

        vertices[normalIndex] = reader.getFloat32(vertexStart, true);
        vertices[normalIndex + 1] = reader.getFloat32(vertexStart + 4, true);
        vertices[normalIndex + 2] = reader.getFloat32(vertexStart + 8, true);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

    return geometry;
  }

  ensureString(buffer: ArrayBuffer): string {
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(buffer));
  }
}
```

### 4. Usage in Product Screen

**app/app/product/[id].tsx** (Enhanced):
```typescript
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import ProductViewer3D from '../../components/3d/ProductViewer3D';

export default function ProductDetailScreen() {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const product = {
    id: '1',
    name: 'Gold Ring',
    model3d: {
      url: 'https://your-backend.com/storage/models/ring.glb',
      type: 'glb' as const,
    },
    images: ['https://...'],
  };

  return (
    <View style={styles.container}>
      {/* Toggle Button */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === '2d' && styles.toggleBtnActive]}
          onPress={() => setViewMode('2d')}
        >
          <Text style={styles.toggleText}>2D</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === '3d' && styles.toggleBtnActive]}
          onPress={() => setViewMode('3d')}
        >
          <Text style={styles.toggleText}>3D</Text>
        </TouchableOpacity>
      </View>

      {/* Viewer */}
      {viewMode === '3d' && product.model3d ? (
        <ProductViewer3D
          modelUrl={product.model3d.url}
          modelType={product.model3d.type}
          autoRotate={true}
          enableZoom={true}
        />
      ) : (
        <Image source={{ uri: product.images[0] }} style={styles.image} />
      )}
    </View>
  );
}
```

---

## Laravel Backend - 3D Model Management

### 1. Database Migration

```php
// database/migrations/xxxx_add_3d_model_to_products_table.php
public function up()
{
    Schema::table('products', function (Blueprint $table) {
        $table->string('model_3d_url')->nullable();
        $table->enum('model_3d_type', ['glb', 'obj', 'stl'])->nullable();
        $table->integer('model_3d_size_kb')->nullable();
        $table->boolean('has_3d_model')->default(false);
    });
}
```

### 2. File Upload Controller

```php
// app/Http/Controllers/Api/ModelUploadController.php
class ModelUploadController extends Controller
{
    public function upload(Request $request, Product $product)
    {
        $request->validate([
            'model' => 'required|file|mimes:glb,obj,stl|max:20480', // 20MB max
        ]);

        $file = $request->file('model');
        $extension = $file->getClientOriginalExtension();

        // Store file
        $path = $file->storeAs(
            'models',
            $product->id . '_' . time() . '.' . $extension,
            'public'
        );

        // Update product
        $product->update([
            'model_3d_url' => Storage::url($path),
            'model_3d_type' => $extension,
            'model_3d_size_kb' => $file->getSize() / 1024,
            'has_3d_model' => true,
        ]);

        return response()->json([
            'success' => true,
            'model_url' => $product->model_3d_url,
        ]);
    }
}
```

### 3. API Response Format

```php
// app/Http/Resources/ProductResource.php
public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'description' => $this->description,
        'current_price' => $this->current_price,
        'images' => $this->images,
        'model_3d' => $this->has_3d_model ? [
            'url' => $this->model_3d_url,
            'type' => $this->model_3d_type,
            'size_kb' => $this->model_3d_size_kb,
        ] : null,
    ];
}
```

---

## 3D Model Optimization

### Recommended Tools

1. **Blender** (Free)
   - Convert between formats
   - Reduce polygon count
   - Optimize textures
   - Export optimized GLB

2. **gltf-pipeline** (CLI tool)
   ```bash
   npm install -g gltf-pipeline
   gltf-pipeline -i input.glb -o output.glb -d
   ```

3. **Meshlab** (Free)
   - Clean up STL files
   - Reduce mesh complexity
   - Fix errors

### Optimization Guidelines

| Metric | Target | Maximum |
|--------|--------|---------|
| File Size | < 2MB | < 5MB |
| Polygon Count | < 50k | < 100k |
| Texture Size | 1024x1024 | 2048x2048 |
| Load Time | < 2s | < 5s |

### GLB Optimization Script

```javascript
// optimize-glb.js
const gltfPipeline = require('gltf-pipeline');
const fsExtra = require('fs-extra');

async function optimizeGLB(inputPath, outputPath) {
  const glb = await fsExtra.readFile(inputPath);

  const options = {
    dracoOptions: {
      compressionLevel: 7, // 0-10, higher = better compression
    },
    separate: false, // Keep as single GLB file
  };

  const results = await gltfPipeline.processGlb(glb, options);
  await fsExtra.writeFile(outputPath, results.glb);

  console.log(`Optimized: ${inputPath} -> ${outputPath}`);
}

// Usage
optimizeGLB('models/ring.glb', 'models/ring-optimized.glb');
```

---

## Performance Considerations

### Mobile Optimization

1. **Lazy Loading**
   - Load 3D model only when user switches to 3D view
   - Cache loaded models in memory

2. **LOD (Level of Detail)**
   ```typescript
   // Show simplified model initially, load high-quality on zoom
   const [modelQuality, setModelQuality] = useState<'low' | 'high'>('low');

   const modelUrl = modelQuality === 'high'
     ? product.model3d_high_url
     : product.model3d_low_url;
   ```

3. **Progressive Loading**
   - Show placeholder/wireframe while loading
   - Display progress indicator

### Memory Management

```typescript
// Cleanup when unmounting
React.useEffect(() => {
  return () => {
    // Dispose Three.js objects
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (object.material instanceof THREE.Material) {
          object.material.dispose();
        }
      }
    });
  };
}, []);
```

---

## Testing 3D Models

### Test Models
Use these free jewelry 3D models for testing:
- **Sketchfab**: https://sketchfab.com/3d-models?features=downloadable&category=jewelry
- **TurboSquid**: https://www.turbosquid.com/Search/3D-Models/free/jewelry/glb
- **Free3D**: https://free3d.com/3d-models/jewelry

### Conversion Tools
- **OBJ to GLB**: https://products.aspose.app/3d/conversion/obj-to-glb
- **STL to GLB**: https://anyconv.com/stl-to-glb-converter/

---

## Cost Estimates for 3D Models

### Option 1: 3D Scanning Service
- **Cost**: $50-150 per jewelry piece
- **Turnaround**: 3-5 days
- **Quality**: High accuracy
- **Recommended for**: High-value items

### Option 2: 3D Modeling Service
- **Cost**: $100-300 per jewelry piece
- **Turnaround**: 5-10 days
- **Quality**: Perfect precision
- **Recommended for**: New designs

### Option 3: In-House 3D Scanning
- **Equipment**: $2,000-5,000 (one-time)
- **Learning curve**: 2-4 weeks
- **Cost per model**: $5-10 (labor)
- **Recommended for**: High volume

### Option 4: AI-Generated 3D from Photos
- **Services**: Luma AI, Polycam
- **Cost**: Free - $30/month
- **Quality**: Medium (improving rapidly)
- **Recommended for**: Prototyping

---

## Fallback Strategy

If 3D model is not available:
1. Show high-quality 2D images
2. Implement 360° photo viewer (swipe to rotate)
3. Allow zoom and pan on images
4. Add "3D model coming soon" badge

---

## Implementation Checklist

- [ ] Install Expo GL and Three.js dependencies
- [ ] Create ProductViewer3D component
- [ ] Implement STL loader
- [ ] Add 3D model fields to product database
- [ ] Create model upload endpoint in Laravel
- [ ] Implement model optimization pipeline
- [ ] Add 2D/3D toggle in product screen
- [ ] Test with all 3 file formats (GLB, OBJ, STL)
- [ ] Optimize loading performance
- [ ] Add error handling for failed loads
- [ ] Implement model caching
- [ ] Test on low-end devices
- [ ] Add analytics tracking for 3D usage

---

**Estimated Development Time**: 1.5-2 weeks
**Budget**: $450-600
**Priority**: Medium-High