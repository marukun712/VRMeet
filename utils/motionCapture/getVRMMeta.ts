interface GLBMeta {
  magic: number;
  version: number;
  total: number;
}

interface GLTFImage {
  name?: string;
  bufferView: number;
  mimeType: string;
}

interface GLTFBufferView {
  buffer: number;
  byteOffset: number;
  byteLength: number;
}

interface VRMMeta {
  title: string;
  version: string;
  author: string;
  contactInformation?: string;
  reference?: string;
  texture: number;
  allowedUserName?: string;
  violentUssageName?: string;
  sexualUssageName?: string;
  commercialUssageName?: string;
  otherPermissionUrl?: string;
}

interface GLTFJson {
  images: GLTFImage[];
  bufferViews: GLTFBufferView[];
  extensions: {
    VRM: {
      meta: VRMMeta;
    };
  };
}

interface JSONData {
  json: GLTFJson;
  length: number;
}

const LE = true;
const MAGIC_glTF = 0x676c5446;
const GLB_FILE_HEADER_SIZE = 12;
const GLB_CHUNK_LENGTH_SIZE = 4;
const GLB_CHUNK_TYPE_SIZE = 4;
const GLB_CHUNK_HEADER_SIZE = GLB_CHUNK_LENGTH_SIZE + GLB_CHUNK_TYPE_SIZE;
const GLB_CHUNK_TYPE_JSON = 0x4e4f534a;
const GLB_CHUNK_TYPE_BIN = 0x004e4942;

function getMagic(dataView: DataView): number {
  const offset = 0;
  return dataView.getUint32(offset);
}

function getVersion(dataView: DataView): number {
  const offset = 4;
  return dataView.getUint32(offset, LE);
}

function getTotalLength(dataView: DataView): number {
  const offset = 8;
  return dataView.getUint32(offset, LE);
}

function getGLBMeta(dataView: DataView): GLBMeta {
  const magic = getMagic(dataView);
  const version = getVersion(dataView);
  const total = getTotalLength(dataView);

  return {
    magic,
    version,
    total,
  };
}

function getJSONData(dataView: DataView) {
  const offset = GLB_FILE_HEADER_SIZE;

  const chunkLength = dataView.getUint32(offset, LE);

  const chunkType = dataView.getUint32(offset + GLB_CHUNK_LENGTH_SIZE, LE);

  if (chunkType !== GLB_CHUNK_TYPE_JSON) {
    console.warn("This GLB file doesn't have a JSON part.");
    return;
  }

  const jsonChunk = new Uint8Array(
    dataView.buffer,
    offset + GLB_CHUNK_HEADER_SIZE,
    chunkLength
  );
  const decoder = new TextDecoder("utf8");
  const jsonText = decoder.decode(jsonChunk);
  const json = JSON.parse(jsonText) as GLTFJson;

  return {
    json,
    length: chunkLength,
  };
}

function getThumbnail(jsonData: JSONData, buffer: ArrayBuffer, offset: number) {
  const thumbnailIndex = jsonData.json.extensions.VRM.meta.texture;
  if (thumbnailIndex === undefined || thumbnailIndex === -1) {
    console.warn("Thumbnail field was not found.");
    return;
  }

  const image = jsonData.json.images[thumbnailIndex];
  const view = jsonData.json.bufferViews[image.bufferView];

  const imgBuf = new Uint8Array(
    buffer,
    offset + GLB_CHUNK_HEADER_SIZE + view.byteOffset,
    view.byteLength
  );

  return new File(
    [new Blob([imgBuf], { type: image.mimeType })],
    "thumbnail.png"
  );
}

export async function getVRMMeta(file: File) {
  const buf = await file.arrayBuffer();
  const ds = new DataView(buf);

  const glbMeta = getGLBMeta(ds);

  if (glbMeta.magic !== MAGIC_glTF) {
    console.warn("This file is not a GLB file.");
    return;
  }

  const jsonData = getJSONData(ds);
  if (!jsonData) return;

  const offset = GLB_FILE_HEADER_SIZE + GLB_CHUNK_HEADER_SIZE + jsonData.length;
  const dataChunkType = ds.getUint32(offset + GLB_CHUNK_LENGTH_SIZE, LE);

  if (dataChunkType !== GLB_CHUNK_TYPE_BIN) {
    console.warn("This GLB file doesn't have a binary buffer.");
    return;
  }

  const name = jsonData.json.extensions.VRM.meta.title;
  const image = getThumbnail(jsonData, ds.buffer, offset);

  return { name, image };
}

export async function checkVRMVersion(file: File) {
  const buf = await file.arrayBuffer();
  const ds = new DataView(buf);

  const glbMeta = getGLBMeta(ds);

  if (glbMeta.magic !== MAGIC_glTF) {
    console.warn("This file is not a GLB file.");
    return;
  }

  const jsonData = getJSONData(ds);
  if (!jsonData) return;

  // @ts-ignore
  const version = jsonData.json.extensions.VRM.specVersion;

  if (version) {
    return true;
  } else {
    return false;
  }
}
