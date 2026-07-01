"use client";

import Image from "next/image";

// 状态管理
import { useState } from "react";

export function Comments() {
  const [currentTab, setTab] = useState<"comments" | "notes">("comments");

  return (
    <div className="flex flex-col gap-6 mb-50">
      <div className="flex items-center gap-10">
        <TabItem
          icon="/detail/comments/comments.svg"
          name="Comments (45)"
          isActive={currentTab === "comments"}
          onClick={() => setTab("comments")}
        />
        <TabItem
          icon="/detail/comments/private-notes.svg"
          name="Private Notes"
          isActive={currentTab === "notes"}
          onClick={() => setTab("notes")}
        />

      </div>
      <p className="font-sans flex justify-center items-center bg-option-bg py-12 px-6 text-center rounded-sm">
        {currentTab === "comments"
          ? "Login or create an account to join the conversation."
          : "Login or create an account to add private notes to this recipe."}
      </p>
    </div>
  );
}

// 组件内部专用的类型，不需要 export，也不会变成全局类型；只有其他文件也要用时，才需要 export。
type TabItemProps = {
  icon: string;
  name: string;
  isActive: boolean;
  onClick: () => void;
};

// 选项组件
function TabItem({ icon, name, isActive, onClick }: TabItemProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 cursor-pointer py-1 border-b-2 
                  ${isActive ? "border-b-black" : "border-b-transparent opacity-50 hover:opacity-100"}`}
    >
      <Image src={icon} alt="" width={1} height={1} className="size-4.5" />
      <p className="font-display">{name}</p>
    </div>
  );
}
