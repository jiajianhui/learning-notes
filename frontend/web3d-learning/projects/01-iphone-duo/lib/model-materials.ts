import { Material, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Texture } from 'three';
import type { Object3D } from 'three';
import { materialConfig, renderConfig } from './viewer-config';
import { assetMaterials } from './asset-materials';

// 对应本资产的材质角色，由源 glTF 的材质名称核对得到。
const polishedMetal = new Set(['OwqobJiNTlvAFyj', 'lrXfpZcYrByzvym', 'UcYWmlwZxcfqNko', 'mAvfMvCzYIPKaNG', 'jqlebwNqkTyrcyd']);

export function prepareMaterials(model: Object3D, hardwareAnisotropy: number, environments: { body: Texture; details: Texture; metal: Texture; lens: Texture; surface: Texture } | null) {
  const materials = new Map<Material, Material>();
  const textures = new Map<Texture, Texture>();
  const hiddenOverlays = new Map<Object3D, boolean>();

  const hingeMaterials: Material[] = [];

  function matchFrame(material: MeshStandardMaterial) {
    material.color.setHex(0xe3d9c8);
    material.metalness = 1;
    material.roughness = 0.16;
    material.map = material.aoMap = material.roughnessMap = material.metalnessMap = null;
    material.envMap = environments?.metal ?? null;
    material.envMapRotation.set(0, 0, 0);
    material.envMapIntensity = materialConfig.metalEnvironmentIntensity;
    material.userData.fixedStudio = true;
  }

  function localMaterial(source: Material) {
    const cached = materials.get(source);
    if (cached) return cached;
    const material = source.clone();
    materials.set(source, material);
    // 复制要改采样参数的纹理；像素数据仍共享，不修改 useGLTF 缓存。
    for (const [key, value] of Object.entries(material)) {
      if (!(value instanceof Texture)) continue;
      let texture = textures.get(value);
      if (!texture) {
        texture = value.clone();
        texture.anisotropy = Math.min(renderConfig.maxAnisotropy, hardwareAnisotropy);
        texture.needsUpdate = true;
        textures.set(value, texture);
      }
      Object.assign(material, { [key]: texture });
    }
    if (material instanceof MeshStandardMaterial) {
      const override = assetMaterials[material.name];
      if (override) {
        const { layer, ...properties } = override;
        Object.assign(material, properties);
        // 镜头光学层和背板使用各自的反射图，不跟金属边框共用灯牌。
        if (layer === 4 || layer === 5) {
          material.envMap = environments ? (layer === 4 ? environments.lens : environments.surface) : null;
          material.envMapRotation.set(0, Math.PI + (layer === 4 ? 0.1 : 1.98), 0);
        }
        if (layer === 0 || layer === 1) {
          material.envMap = environments ? (layer === 0 ? environments.body : environments.details) : null;
          material.envMapRotation.set(0, Math.PI, 0);
          material.envMapIntensity = layer === 0 ? materialConfig.bodyEnvironmentIntensity : 1;
        }
        if (layer === 2) {
          material.envMap = environments?.metal ?? null;
          material.envMapRotation.set(0, 0, 0);
          material.envMapIntensity = materialConfig.metalEnvironmentIntensity;
        }
        // 环境在资产坐标系中生成；产品转动时同步它的世界朝向。
        material.userData.environmentRotation = material.envMapRotation.y;
        if (material.transparent) material.depthWrite = false;
      }
      if (polishedMetal.has(material.name)) {
        material.roughness = Math.min(1, Math.max(0, material.roughness * materialConfig.metalRoughnessScale));
      }
      if (['lrXfpZcYrByzvym', 'mAvfMvCzYIPKaNG', 'jeFtQmHBLCfgIkY'].includes(material.name)) {
        matchFrame(material);
      }
      material.userData.fixedStudio = Boolean(environments && material.envMap === environments.metal);
      if (material.name === 'ZgMnqnyPATyacDv') {
        material.color.multiplyScalar(materialConfig.logoBaseColorScale);
      }
      if (material.name.startsWith('PracticeScreen_')) {
        // 屏幕仅显示静态图；移除环境亮条，金属仍使用自己的反射。
        material.envMap = null;
        material.envMapIntensity = 0;
        material.emissive.set('#ffffff');
        material.emissiveIntensity = materialConfig.screenBrightness;
        material.roughness = materialConfig.screenRoughness;
        material.metalness = 0;
        material.toneMapped = false;
      }
    }
    if (material instanceof MeshPhysicalMaterial && material.name.startsWith('PracticeScreen_')) {
      material.specularIntensity = 0;
      material.specularColor.set('#000000');
      material.clearcoat = materialConfig.screenClearcoat;
      material.clearcoatRoughness = materialConfig.screenRoughness;
      material.clearcoatMap = null;
      material.clearcoatRoughnessMap = null;
    }
    if (material instanceof MeshPhysicalMaterial && material.name === 'hkSmvYqlDNAQojv') {
      // 后摄保护玻璃：原材质依赖未移植的边缘反射扩展，使用标准介质反射补足。
      material.specularColor.setRGB(1, 1, 1);
      material.envMapIntensity = materialConfig.lensReflectionIntensity;
    }
    if (material instanceof MeshPhysicalMaterial && material.name === 'FVyIOhmektXDyZR') {
      material.specularColor.setRGB(1, 1, 1);
      material.envMapIntensity = materialConfig.lensOpticsIntensity;
    }
    return material;
  }

  model.traverse(object => {
    if (!(object instanceof Mesh)) return;
    if (object.name === 'LDcHeENovRXWVxD') {
      // Logo 上方的 Max 混合覆层依赖专用 Shader，会冲淡下方 Logo。
      // 只隐藏这块覆层；同材质的相机底座保持原样。
      hiddenOverlays.set(object, object.visible);
      object.visible = false;
    }
    object.material = Array.isArray(object.material) ? object.material.map(localMaterial) : localMaterial(object.material);
    // 铰链内衬与其它机身网格共享源材质，只给中央窄条单独换表面。
    if (object.name === 'TZjfnhYrtCYbdCh' && object.material instanceof MeshStandardMaterial) {
      const liner = object.material.clone();
      matchFrame(liner);
      hingeMaterials.push(liner);
      object.material = liner;
    }
  });

  return () => {
    for (const [object, visible] of hiddenOverlays) object.visible = visible;
    for (const material of hingeMaterials) material.dispose();
    for (const material of materials.values()) material.dispose();
    for (const texture of textures.values()) texture.dispose();
  };
}
