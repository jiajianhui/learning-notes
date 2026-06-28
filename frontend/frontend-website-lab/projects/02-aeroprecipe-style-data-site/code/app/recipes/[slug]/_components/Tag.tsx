import Image from "next/image";

export type TagProps = {
    icon: string
    name: string | number
}
export function Tag({icon, name}: TagProps) {
  return (
    <div className="flex items-center gap-2 bg-option-bg text-sm rounded-sm py-1 px-2">
      <Image src={icon} width={1} height={1} alt="" className="size-4" />
      <p className="font-sans">{name}</p>
    </div>
  );
}
