export enum LoaderType {
  OBJ = "obj",
  OBJMTL = "obj/mtl",
  PIXI = "pixi",
  FBX = "fbx",
}

export const BootAssets: Array<{key: string, path: string, type:  LoaderType}> = [];
