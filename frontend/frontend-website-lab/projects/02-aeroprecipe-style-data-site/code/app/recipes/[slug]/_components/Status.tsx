export type StatusProps = {
  name: string | number;
  icon?: string;
};

import Image from "next/image";

export function Status({ name, icon }: StatusProps) {
  return (
    <div className="flex items-center gap-1 text-sm border-b border-b-zinc-700">
      {icon && (
        <Image
          src={icon}
          alt=""
          width={1}
          height={1}
          className="size-4"
        />
      )}

      <p>{name}</p>
    </div>
  );
}
