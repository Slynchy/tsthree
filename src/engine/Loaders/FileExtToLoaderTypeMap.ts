import { LoaderType } from "../Types/LoaderType";

export const FileExtToLoaderTypeMap: { [key: string]: LoaderType } = {
    "fbx": LoaderType.FBX,
    "gltf": LoaderType.GLTF,
    "obj": LoaderType.OBJMTL
}
