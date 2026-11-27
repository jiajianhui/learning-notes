// 从公开场景的 materials 配置摘录；glTF 本身未包含这些覆盖值。
// 来源见 asset-manifest.json。此表属于本模型的交接信息。
import type { Blending, BlendingSrcFactor, BlendingDstFactor, BlendingEquation } from 'three';
type MaterialOverride = { layer: number; opacity?: number; transparent?: boolean; blending?: Blending; blendSrc?: BlendingSrcFactor; blendDst?: BlendingDstFactor; blendEquation?: BlendingEquation; toneMapped?: boolean };
export const assetMaterials: Record<string, MaterialOverride> = {
  "QTguOGnxQOXIuCV": {
    "layer": 5
  },
  "jqsnBZpRGBJNKPm": {
    "layer": 5
  },
  "npGznGDsLOmhtPH": {
    "layer": 5
  },
  "xCmJdqeHryYgJtk": {
    "layer": 5,
    "opacity": 0.341,
    "transparent": true,
    "blending": 5,
    "blendSrc": 201,
    "blendDst": 201,
    "blendEquation": 104
  },
  "hkSmvYqlDNAQojv": {
    "layer": 5,
    "opacity": 0.453,
    "transparent": true,
    "blending": 2,
    "blendSrc": 201,
    "blendDst": 201,
    "blendEquation": 104
  },
  "FVyIOhmektXDyZR": {
    "layer": 4,
    "opacity": 1,
    "transparent": true,
    "blending": 2,
    "blendSrc": 201,
    "blendDst": 200,
    "blendEquation": 100
  },
  "uykWUEajxHqfrmh": {
    "layer": 0,
    "opacity": 0.461,
    "transparent": true,
    "blending": 1,
    "blendSrc": 201,
    "blendDst": 200,
    "blendEquation": 100
  },
  "iVzCHFKAaRqjQhl": {
    "layer": 0,
    "opacity": 1,
    "transparent": false,
    "blending": 5,
    "blendSrc": 201,
    "blendDst": 205,
    "blendEquation": 104
  },
  "qJbGiREHXwRMmQc": {
    "layer": 5
  },
  "dLDrceZOOgIrzrK": {
    "layer": 5
  },
  "pkUBCyCvYJYVzTr": {
    "layer": 5,
    "toneMapped": false
  },
  "screenTextureOuterDisplay_usd_shd_lts": {
    "layer": 5,
    "toneMapped": false
  },
  "OwqobJiNTlvAFyj": {
    "layer": 1,
    "opacity": 0.4,
    "transparent": true
  },
  "NtNSwEIIFmIbXaY": {
    "layer": 2
  },
  "jeFtQmHBLCfgIkY": {
    "layer": 0
  },
  "MZiYIrcFSqDDBWG": {
    "layer": 0
  },
  "ZoizrWFccovSVQl": {
    "layer": 0
  },
  "OYGBKvzrlgToWww": {
    "layer": 0
  },
  "mAvfMvCzYIPKaNG": {
    "layer": 2
  },
  "xHXZphlQnPqfbqz": {
    "layer": 0
  },
  "FaWnyZckmfryHBZ": {
    "layer": 0
  },
  "XVBEVNwvEGGqQcm": {
    "layer": 1
  },
  "ulZXFnTVkOsnIjC": {
    "layer": 0
  },
  "FoAbzXGuCEeVRQW": {
    "layer": 0
  },
  "ZgMnqnyPATyacDv": {
    "layer": 0
  },
  "stlMkdXkRsspsoE": {
    "layer": 0
  },
  "cUdgsgllIYGDtIW": {
    "layer": 0
  },
  "UcYWmlwZxcfqNko": {
    "layer": 2
  },
  "hAKVdrzztJgljCR": {
    "layer": 0
  },
  "MRYUabTVLFtJJce": {
    "layer": 0
  },
  "lrXfpZcYrByzvym": {
    "layer": 2
  },
  "jqlebwNqkTyrcyd": {
    "layer": 1
  },
  "hpmqrCvWLXWudrz": {
    "layer": 0
  }
};
