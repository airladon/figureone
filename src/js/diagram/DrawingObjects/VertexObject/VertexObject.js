// @flow

// import * as g2 from '../g2';
import * as m2 from '../../../tools/m2';
import WebGLInstance from '../../webgl/webgl';
import * as g2 from '../../../tools/g2';
import DrawingObject from '../DrawingObject';

// Base clase of all shape objects made from verteces for webgl.
// The job of a VertexObject is to:
//  - Have the points of a object/shape
//  - Have the shape's border (used to determine whether a location is
//    within the shape)
//  - Setup the webgl buffer
//  - Draw the shape
class VertexObject extends DrawingObject {
  gl: WebGLRenderingContext;    // shortcut for the webgl context
  webgl: WebGLInstance;         // webgl instance for a html canvas
  glPrimative: number;          // primitive tyle (e.g. TRIANGLE_STRIP)
  buffer: WebGLBuffer;          // Vertex buffer
  // textureBuffer: WebGLBuffer;

  points: Array<number>;        // Primative vertices of shape
  numPoints: number;            // Number of primative vertices
  border: Array<Array<g2.Point>>; // Border vertices
  z: number;
  texture: ?{
    id: string;
    src: string;
    glTexture: Object;
    image: Object;
    points: Array<number>;
    buffer: WebGLBuffer;
    index: number;
  }
  // textureLocation: string | Object;
  // texturePoints: Array<number>;
  +change: (Array<g2.Point>) => void;
  programIndex: number;

  constructor(
    webgl: WebGLInstance,
    vertexShader: string = 'simple',
    fragmentShader: string = 'simple',
  ) {
    super();
    this.numPoints = 0;
    this.gl = webgl.gl;
    this.webgl = webgl;
    this.glPrimative = webgl.gl.TRIANGLES;
    this.points = [];
    this.z = 0;
    // this.textureLocation = '';
    // this.texturePoints = [];
    this.texture = null;
    this.programIndex = webgl.getProgram(vertexShader, fragmentShader);
  }

  addTextureToBuffer(
    texture, //: WebGLTextureBuffer
    image, // image data
  ) {
    console.log(image)
    this.gl.activeTexture(this.gl.TEXTURE0 + this.texture.index);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D, 0, this.gl.RGBA,
      this.gl.RGBA, this.gl.UNSIGNED_BYTE, image,
    );
    function isPowerOf2(value) {
      // eslint-disable-next-line no-bitwise
      return (value & (value - 1)) === 0;
    }
    // Check if the image is a power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
    } else {
      // No, it's not a power of 2. Turn off mips and set wrapping to clamp to edge
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    }
  }

  setupBuffer(numPoints: number = 0) {
    if (numPoints === 0) {
      this.numPoints = this.points.length / 2.0;
    } else {
      this.numPoints = numPoints;
    }

    // if (this.texture && this.texture.points == null) {
    //   this.texture.points = [];
    //   this.createTextureMap();
    // }

    const { texture } = this;
    if (texture != null) {
      if (texture.points == null) {
        texture.points = [];
      }
      if (texture.points.length === 0) {
        this.createTextureMap();
      }

      texture.buffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texture.buffer);
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(texture.points),
        this.gl.STATIC_DRAW,
      );

      if (texture.id in this.webgl.textures) {
        texture.index = this.webgl.textures[texture.id].index;
      } else {
        const glTexture = this.gl.createTexture();
        texture.index = this.webgl.addTexture(texture.id, glTexture);
        this.gl.activeTexture(this.gl.TEXTURE0 + texture.index);
        this.gl.bindTexture(this.gl.TEXTURE_2D, glTexture);
        if (texture.src) {
          // const texture = this.gl.createTexture();
          // this.webgl.addTexture(this.texture.id, texture);
          // this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

          // Fill the texture with a 1x1 blue pixel.
          this.gl.texImage2D(
            this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0,
            this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 100]),
          );
          const image = new Image();
          image.src = texture.src;
          image.addEventListener('load', () => {
            // Now that the image has loaded make copy it to the texture.
            this.addTextureToBuffer(glTexture, image);
            if (this.onLoad != null) {
              this.onLoad();
            }
          });
        } else {
          this.addTextureToBuffer(glTexture, texture.image);
        }
      }
    }
    // if (typeof this.texture.src === 'string') {
    //   if (this.textureLocation )
    //   // Create a texture.
    //   const texture = this.gl.createTexture();
    //   this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    //   // Fill the texture with a 1x1 blue pixel.
    //   this.gl.texImage2D(
    //     this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0,
    //     this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 100]),
    //   );
    //   const image = new Image();
    //   image.src = this.textureLocation;
    //   image.addEventListener('load', () => {
    //     // Now that the image has loaded make copy it to the texture.
    //     this.addTextureToBuffer(texture, image);
    //     // this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    //     // this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);
    //     // this.gl.texImage2D(
    //     //   this.gl.TEXTURE_2D, 0, this.gl.RGBA,
    //     //   this.gl.RGBA, this.gl.UNSIGNED_BYTE, image,
    //     // );
    //     // function isPowerOf2(value) {
    //     //   // eslint-disable-next-line no-bitwise
    //     //   return (value & (value - 1)) === 0;
    //     // }
    //     // // Check if the image is a power of 2 in both dimensions.
    //     // if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
    //     //   // Yes, it's a power of 2. Generate mips.
    //     //   this.gl.generateMipmap(this.gl.TEXTURE_2D);
    //     // } else {
    //     //   // No, it's not a power of 2. Turn off mips and set wrapping to clamp to edge
    //     //   this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    //     //   this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    //     //   this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    //     // }
    //     if (this.onLoad != null) {
    //       this.onLoad();
    //     }
    //   });
    // } else {
    //   console.log('creating text')
    //   this.addTextureToBuffer(texture, this.texture.image);
    // }
    // }

    // this.buffer = createBuffer(this.gl, this.vertices);
    this.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.points), this.gl.STATIC_DRAW);
  }

  resetBuffer(numPoints: number = 0) {
    const { texture } = this;
    if (texture) {
      this.gl.activeTexture(this.gl.TEXTURE0 + texture.index);
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);
      this.gl.deleteTexture(texture.buffer);
    }
    // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.deleteBuffer(this.buffer);
    this.setupBuffer(numPoints);
  }

  // eslint-disable-next-line no-unused-vars
  change(coords: Array<g2.Point>) {
    this.resetBuffer();
  }

  changeVertices(coords: Array<g2.Point>) {
    this.points = [];
    this.border = [];
    let minX = null;
    let minY = null;
    let maxX = null;
    let maxY = null;
    coords.forEach((p) => {
      this.points.push(p.x);
      this.points.push(p.y);
      if (minX === null || p.x < minX) {
        minX = p.x;
      }
      if (minY === null || p.y < minY) {
        minY = p.y;
      }
      if (maxY === null || p.y > maxY) {
        maxY = p.y;
      }
      if (maxX === null || p.x > maxX) {
        maxX = p.x;
      }
    });
    if (minX != null && minY != null && maxX != null && maxY != null) {
      this.border[0] = [
        new g2.Point(minX, minY),
        new g2.Point(minX, maxY),
        new g2.Point(maxX, maxY),
        new g2.Point(maxX, minY),
      ];
    }
    this.resetBuffer();
  }

  // Abstract method - should be reimplemented for any vertexObjects that
  getPointCountForAngle(drawAngle: number = Math.PI * 2) {
    return this.numPoints * drawAngle / (Math.PI * 2);
  }

  // Abstract method - should be reimplemented for any vertexObjects that
  // eslint-disable-next-line no-unused-vars
  getPointCountForLength(drawLength: number) {
    return this.numPoints;
  }

  createTextureMap(
    xMinGL: number = -1,
    xMaxGL: number = 1,
    yMinGL: number = -1,
    yMaxGL: number = 1,
    xMinTex: number = 0,
    xMaxTex: number = 1,
    yMinTex: number = 0,
    yMaxTex: number = 1,
  ) {
    const glWidth = xMaxGL - xMinGL;
    const glHeight = yMaxGL - yMinGL;
    const texWidth = xMaxTex - xMinTex;
    const texHeight = yMaxTex - yMinTex;
    this.texture.points = [];
    for (let i = 0; i < this.points.length; i += 2) {
      const x = this.points[i];
      const y = this.points[i + 1];
      const texNormX = (x - xMinGL) / glWidth;
      const texNormY = (y - yMinGL) / glHeight;
      this.texture.points.push(texNormX * texWidth + xMinTex);
      this.texture.points.push(texNormY * texHeight + yMinTex);
    }
  }

  draw(
    translation: g2.Point,
    rotation: number,
    scale: g2.Point,
    count: number,
    color: Array<number>,
  ) {
    let transformation = m2.identity();
    transformation = m2.translate(transformation, translation.x, translation.y);
    transformation = m2.rotate(transformation, rotation);
    transformation = m2.scale(transformation, scale.x, scale.y);
    this.drawWithTransformMatrix(m2.t(transformation), color, count);
  }

  drawWithTransformMatrix(
    transformMatrix: Array<number>,
    color: Array<number>,
    count: number,
  ) {
    const size = 2;         // 2 components per iteration
    const type = this.gl.FLOAT;   // the data is 32bit floats
    const normalize = false;    // don't normalize the data
    // 0 = move forward size * sizeof(type) each iteration to get
    // the next position
    const stride = 0;
    const offset = 0;       // start at the beginning of the buffer

    const locations = this.webgl.useProgram(this.programIndex);

    // Turn on the attribute
    this.gl.enableVertexAttribArray(locations.a_position);

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    this.gl.vertexAttribPointer(
      locations.a_position,
      size, type, normalize, stride, offset,
    );

    this.gl.uniformMatrix3fv(
      locations.u_matrix,
      false,
      m2.t(transformMatrix),
    );  // Translate

    this.gl.uniform1f(locations.u_z, this.z);

    this.gl.uniform4f(
      locations.u_color,
      color[0], color[1], color[2], color[3],
    );  // Translate

    const { texture } = this;
    if (texture != null) {
      // Textures
      // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
      const texSize = 2;          // 2 components per iteration
      const texType = this.gl.FLOAT;   // the data is 32bit floats
      const texNormalize = false; // don't normalize the data
      const texStride = 0;
      // 0 = move forward size * sizeof(type) each iteration to get
      // the next position
      const texOffset = 0;        // start at the beginning of the buffer

      this.gl.enableVertexAttribArray(locations.a_texcoord);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texture.buffer);
      this.gl.vertexAttribPointer(
        locations.a_texcoord, texSize, texType,
        texNormalize, texStride, texOffset,
      );
    }
    if (texture) {
      this.gl.uniform1i(locations.u_use_texture, 1);
      this.gl.uniform1i(locations.u_texture, texture.index);
    } else {
      this.gl.uniform1i(locations.u_use_texture, 0);
    }

    this.gl.drawArrays(this.glPrimative, offset, count);

    if (texture) {
      this.gl.disableVertexAttribArray(locations.a_texcoord);
    }
  }

  transform(transformMatrix: Array<number>) {
    for (let i = 0; i < this.points.length; i += 2) {
      let p = new g2.Point(this.points[i], this.points[i + 1]);
      p = p.transformBy(transformMatrix);
      this.points[i] = p.x;
      this.points[i + 1] = p.y;
    }
    for (let b = 0; b < this.border.length; b += 1) {
      for (let p = 0; p < this.border[b].length; p += 1) {
        this.border[b][p] = this.border[b][p].transformBy(transformMatrix);
      }
    }
  }

  // calcBorder(lastDrawTransformMatrix: Array<number>) {
  //   const glBorders = [];
  //   this.border.forEach(border => {
  //     const glBorder = [];
  //     border.forEach(p => {
  //       glBorder.push(p.transformBy(lastDrawTransformMatrix));
  //     })
  //     glBorders.push(glBorder);
  //   });
  //   return glBorders;
  // }
}

export default VertexObject;
