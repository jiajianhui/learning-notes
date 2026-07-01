type StatusProps = {
  name: string | number;
  icon?: string;
  iconPosition?: "left" | "right";
  underline?: boolean;
};

import Image from "next/image";

export function Status({
  name,
  icon,
  iconPosition = "left",
  underline = true,
}: StatusProps) {
  return (
    <div
      className={`${underline ? "border-b border-b-zinc-700" : ""} flex items-center gap-1 text-sm `}
    >
      {icon && iconPosition === "left" && (
        <Image src={icon} alt="" width={1} height={1} className="size-4" />
      )}

      <p>{name}</p>

      {icon && iconPosition === "right" && (
        <Image src={icon} alt="" width={1} height={1} className="size-4" />
      )}
    </div>
  );
}
