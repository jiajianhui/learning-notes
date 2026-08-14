# 09 Prisma CRUD Demo

这是第 09 章的独立练习工程，用来第一次集中练习 Docker、PostgreSQL、TablePro、Prisma 7 和 Express CRUD。

它不是 Mini CMS，也不是后续持续扩展的项目模板。按照第 09 章逐步练习后，目录会形成下面的结构：

```text
09-prisma-crud/
├── compose.yaml
└── server/
    ├── package.json
    ├── prisma/
    └── src/
```

`compose.yaml` 放在本目录根部；Node.js、Express 和 Prisma 代码放在 `server/` 中。

读完第 09A 章并能复述 Prisma 主线后，这个 demo 就停在单表 CRUD 状态。后续 Zod、项目结构、管理页面、标签、登录和测试都直接在独立 `mini-cms` 仓库中实践。
