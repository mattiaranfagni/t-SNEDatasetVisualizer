import { Injectable } from '@angular/core';
import { GroupedObservable, Observable, Subject } from 'rxjs';
//import { CSS2DRenderer,  CSS2DObject} from '../../src/CSS2DRenderer.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {HTTPClientRequesterService} from './httpclient-requester.service'
import * as dat from 'dat.gui';


@Injectable({
  providedIn: 'root'
})
export class EngineService {
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  animation$: Observable<void>;
  private renderer!: THREE.WebGLRenderer;
  sphere!: THREE.InstancedMesh;
  mouse!: THREE.Vector2;
  raycaster!: THREE.Raycaster;
  INTERSECTED: any;
  tweens_prec: any;
  cached_color: THREE.Color;
  animationFrameID: number;
  //private labelRenderer!: CSS2DRenderer;


  private animation = new Subject<void>();
  data: any[];
  values: any[];
  labels: any[];
  images: any[];


  constructor(private http : HTTPClientRequesterService) {
    // Init animation observable to allow other services to subscribe it.
    this.animation$ = this.animation.asObservable();
  }

  init(host: HTMLElement): void {
    console.log("Using Three.js version: " + THREE.REVISION);  
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xf0f0f0 );
    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.set( 600, 550, 500 );
    this.camera.layers.enable( 0 ); // enabled by default
    this.camera.layers.enable( 10 );
    this.camera.layers.enable( 11 );

    this.scene.add( this.camera );
    this.scene.add( new THREE.AmbientLight( 0xf0f0f0 ) );
    const light = new THREE.SpotLight( 0xffffff, 1.5 );
    light.position.set( 0, 1500, 200 );
    light.angle = Math.PI * 0.2;
    light.castShadow = true;
    light.shadow.camera.near = 200;
    light.shadow.camera.far = 2000;
    light.shadow.bias = - 0.000222;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    this.scene.add( light );
    light.layers.set(10);
    const helper = new THREE.GridHelper( 10000, 1000);
    const axisHelper = new THREE.AxesHelper(100000);
    this.scene.add(axisHelper);
    (<any>helper.material).opacity = 0.25;
    (<any>helper.material).transparent = true;
    helper.layers.set(10);
    this.scene.add(helper);

    // Init three.js renderer, the engine that keep updated the models in the scene.
    this.renderer = new THREE.WebGLRenderer({ antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.shadowMap.enabled = true;
    host.appendChild(this.renderer.domElement);
    // Init the orbital controls of camera (plugin)
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.rotateSpeed = 0.7;
    controls.dampingFactor =  0.25;
    controls.enableZoom = true;
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.enableKeys = false;

    let params = {
      dataset: 1,
      perplexity: 100
    };

    //const spheres = [];
    const sphereGeometry = new THREE.SphereBufferGeometry(5, 10, 10);
    let sphereMaterial = new THREE.MeshStandardMaterial();
    const arraycolors = [
      0x49ef4,
      0x562bd1,
      0x14a019,
      0xf75600,
      0xf700cf,
      0x400f7,
      0xf70000,
      0xc5f700,
      0x725301,
      0x200035
    ]

    const gui = new dat.GUI();

    let dataset_gui = gui.add(params, 'dataset', { "FMNIST (train)": 0, "FMNIST (test)": 1, "Digits": 2 } );
    let perplexity_gui = gui.add(params, 'perplexity', {"10": 10, "20": 20, "50": 50,"70": 70, "100": 100, } );

    this.raycaster = new THREE.Raycaster();
    this.raycaster.layers.set(11);
          
    this.mouse = new THREE.Vector2();
    let onMouseMove = ( (event ) => {
      // calculate mouse position in normalized device coordinates
      // (-1 to +1) for both components
      this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    });

    document.addEventListener( 'mousemove', onMouseMove );
    // Update the screen layout.
    const load_texture_test = () => {
      this.http.request('1','100').then((data) => {
        this.data = data[0].images;
        console.log(this.data);
        
       // create a buffer with color data
        // 8x8 digit, 28x28 fmnist
        const width = Math.sqrt(this.data[0].length) * this.data.length;
        const height = Math.sqrt(this.data[0].length);
  
        const size = width * height ;
        const img = new Uint8Array( 3 * size );

        // used the buffer to create a DataTexture
        const texture = new THREE.DataTexture( img, width, height, THREE.RGBFormat );
        console.log(texture);
        let c = 0;
        this.data.forEach(el => {
    
          const size_img = Math.sqrt(this.data[0].length) * Math.sqrt(this.data[0].length);
          const img_txt = new Uint8Array( 3 * size_img );

          for (let j = 0; j < size_img; j++) {
            const stride = j * 3;

            img_txt[ stride ] = el[el.length-j-1]; //el[j]*255;
            img_txt[ stride + 1] = el[el.length-j-1]; //el[j]*255;
            img_txt[ stride + 2] = el[el.length-j-1]; //el[j]*255;
          }

          const img_min = new THREE.DataTexture( img_txt, Math.sqrt(this.data[0].length), Math.sqrt(this.data[0].length), THREE.RGBFormat );
          this.renderer.copyTextureToTexture( new THREE.Vector2(c,0), img_min, texture );
          c+=Math.sqrt(this.data[0].length);

        });
        
        const material = new THREE.SpriteMaterial( { map: texture } );
        
        const sprite = new THREE.Sprite( material );
        sprite.scale.set(width,height,1)
        this.scene.add( sprite );
      });
    }
    this.update();
        
  
    let stop_load = false;
    const init_animate = (stop_load) => {
      if(stop_load)
        return;
      this.renderer.render(this.scene, this.camera);
      window.requestAnimationFrame(() => init_animate(stop_load));

    }
    init_animate(stop_load);
    

    const load = (value) => {
      this.http.request(value.dataset.toString(), value.perplexity.toString()).then((data) => {
        stop_load = true;
        this.data = data[0].data;
        this.values = data[0].values;
        this.labels = data[0].labels;
        this.images = data[0].images;
        
        this.sphere = new THREE.InstancedMesh( sphereGeometry, sphereMaterial, this.data[0].length );
        this.sphere.visible = true; //for raycast
        console.log(data);

        const matrix = new THREE.Matrix4();
        const color = new THREE.Color();
        let n_iter = 0;
        for (let index = 0; index < this.data[n_iter].length; index++) {
          matrix.setPosition( this.data[n_iter][index][0]*10, this.data[n_iter][index][1]*10, this.data[n_iter][index][2]*10 );
          this.sphere.setMatrixAt( index, matrix );
          this.sphere.setColorAt( index, color.setHex(arraycolors[this.values[index]]));
          this.sphere.layers.set(11);
          //spheres.push(this.sphere);
        }
        this.sphere.instanceMatrix.needsUpdate = true;
  
        this.scene.add( this.sphere );
  
        // Update the scene and the camera with the renderer.
        this.renderer.render(this.scene, this.camera);
  
      }).finally(() => {
        let t = 0, dt = 0.02, n_iter = 0, max_n_iter = this.data.length; // t (dt delta for demo)
        this.cached_color = new THREE.Color();
        let highlight_color = new THREE.Color("black");
  
        let text1 = document.createElement('div');
        text1.style.position = 'absolute';
        text1.setAttribute("id","position");
        (<any>text1.style).width = 400;
        (<any>text1.style).height = 300;
        text1.style.backgroundColor = "black";
        text1.style.color = "white";
        text1.style.top = 0 + 'px';
        text1.style.left = 0 + 'px';
        host.appendChild(text1);
  
        let animate = () => {
          this.animation.next();
          if(n_iter < max_n_iter - 1) {
            for(let index = 0; index < this.data[n_iter].length; index++) {
              var newX = this.lerp(this.data[n_iter][index][0]* 10, this.data[n_iter+1][index][0] * 10, this.ease(t));   // interpolate between a and b where
              var newY = this.lerp(this.data[n_iter][index][1] * 10, this.data[n_iter+1][index][1] * 10, this.ease(t));   // t is first passed through a easing
              var newZ = this.lerp(this.data[n_iter][index][2] * 10, this.data[n_iter+1][index][2] * 10, this.ease(t));   // function in this example.
              const matrix = new THREE.Matrix4();
              matrix.setPosition(newX, newY, newZ);    
              this.sphere.setMatrixAt( index, matrix );
              this.sphere.instanceMatrix.needsUpdate = true;
            }
            t += dt;
            if(t >= 1) {
              t = 0;
              dt += 0.002
              n_iter++;
            }
          } 
          this.renderer.render(this.scene, this.camera);
  
  
          this.raycaster.setFromCamera( this.mouse, this.camera );
          const intersects = this.raycaster.intersectObject(this.sphere, true);
  
          text1.innerHTML = "<span> x: "+this.mouse.x+"</span><span> y: "+this.mouse.y+"</span>";
          let text2 = document.createElement('div');
          text2.style.position = 'absolute';
          (<any>text2.style).width = 100;
          (<any>text2.style).height = 100;
          text2.style.backgroundColor = "black";
          text2.style.color = "white";
          text2.style.top = 0 + 'px';
          text2.style.left = 0 + 'px';
          if ( intersects.length > 0 ) {
            if ( this.INTERSECTED != intersects[ 0 ].instanceId ) {
              if ( this.INTERSECTED || this.INTERSECTED == 0) {
                this.sphere.setColorAt(this.INTERSECTED, this.cached_color);
                if(host.contains(document.getElementById(this.INTERSECTED))) document.getElementById(this.INTERSECTED).remove();
              }
              this.INTERSECTED = intersects[0].instanceId;
              this.sphere.getColorAt(this.INTERSECTED, this.cached_color);
              this.sphere.setColorAt(this.INTERSECTED, highlight_color);
              this.sphere.instanceColor.needsUpdate = true;
              console.log(intersects[0]);
              //(<any>intersects[0].object).material.emissive.setHex( 0xff0000 );
              const x = (this.mouse.x *  .5 + .5) * this.renderer.domElement.clientWidth;
              const y = (this.mouse.y * -.5 + .5) * this.renderer.domElement.clientHeight;
              text2.style.transform = `translate(-50%, -50%) translate(${x+100}px,${y+75}px)`;
              text2.setAttribute("id",this.INTERSECTED);
              text2.innerHTML = "<div style='display: flex; justify-content: center; align-content: center; flex-direction: column;'><span> id: "+this.INTERSECTED+"</span><span> value: "+this.labels[this.INTERSECTED]+"</span><canvas id='myCanvas' style ='padding:5px'> </canvas></div>";
              host.appendChild(text2);
              var c = <HTMLCanvasElement> document.getElementById("myCanvas");
              console.log(c);
              let scale = params.dataset == 2? 15 : 4
              c.width = Math.sqrt(this.images[0].length) * scale;
              c.height = Math.sqrt(this.images[0].length) * scale;
              var ctx = c.getContext("2d");
              var imgData = ctx.createImageData(Math.sqrt(this.images[0].length), Math.sqrt(this.images[0].length));
              for (let i = 0; i < imgData.data.length; i++) {
                let stride = i*4
                imgData.data[stride] = params.dataset == 2? this.images[this.INTERSECTED][i]* 255 : this.images[this.INTERSECTED][i];
                imgData.data[stride+1] = params.dataset == 2? this.images[this.INTERSECTED][i]* 255 : this.images[this.INTERSECTED][i];
                imgData.data[stride+2] = params.dataset == 2? this.images[this.INTERSECTED][i]* 255 : this.images[this.INTERSECTED][i];
                imgData.data[stride+3] = 255;
              }

              let scaleImageData =  (imageData, scale) => {
                var scaled = ctx.createImageData(imageData.width * scale, imageData.height * scale);
              
                for(var row = 0; row < imageData.height; row++) {
                  for(var col = 0; col < imageData.width; col++) {
                    var sourcePixel = [
                      imageData.data[(row * imageData.width + col) * 4 + 0],
                      imageData.data[(row * imageData.width + col) * 4 + 1],
                      imageData.data[(row * imageData.width + col) * 4 + 2],
                      imageData.data[(row * imageData.width + col) * 4 + 3]
                    ];
                    for(var y = 0; y < scale; y++) {
                      var destRow = row * scale + y;
                      for(var x = 0; x < scale; x++) {
                        var destCol = col * scale + x;
                        for(var i = 0; i < 4; i++) {
                          scaled.data[(destRow * scaled.width + destCol) * 4 + i] =
                            sourcePixel[i];
                        }
                      }
                    }
                  }
                }
              
                return scaled;
              }
        
              let scaled = scaleImageData(imgData,scale);
              ctx.putImageData(scaled, 0, 0);

            }
          } else {
            if (this.INTERSECTED || this.INTERSECTED == 0)  {
              this.sphere.setColorAt(this.INTERSECTED, this.cached_color);
              this.sphere.instanceColor.needsUpdate = true;
              if(host.contains(document.getElementById(this.INTERSECTED))) document.getElementById(this.INTERSECTED).remove();
            } 
            this.INTERSECTED = null;         
          }
  
          // Bind this 'animate' method to the browser animation API to perform a 'repaint' loop.
          this.animationFrameID = window.requestAnimationFrame(() => animate());
        }
        animate();
      });
    };

    dataset_gui.onChange(() => {
      window.cancelAnimationFrame(this.animationFrameID);
      console.log(params);
      this.scene.remove(this.sphere);
      if(this.sphere) this.sphere.visible = false;
      this.sphere = null;
      load(params);
    });

    perplexity_gui.onChange(() => {
      window.cancelAnimationFrame(this.animationFrameID);
      console.log(params);
      this.scene.remove(this.sphere);
      if(this.sphere) this.sphere.visible = false;
      this.sphere = null;
      load(params);
    });

    load(params);
  }

  update(): void {
    if(this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
  }

  onWindowResize() {
    if(this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
  }

  lerp(a, b, t) {return a + (b - a) * t}
  // example easing function (quadInOut, see link above)
  ease(t) { return t<0.5 ? 2*t*t : -1+(4-2*t)*t}

}
