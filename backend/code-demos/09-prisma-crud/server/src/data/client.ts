// 加载 dotenv，读取环境变量
import "dotenv/config";

// PostgreSQL 数据库适配器；项目使用 PostgreSQL，通过 PostgreSQL 驱动连接数据库。
import { PrismaPg } from "@prisma/adapter-pg";

// 导入根据 schema.prisma 生成的客户端
import { PrismaClient } from "../generated/prisma/client";

// 解包环境变量中的 DATABASE_URL
const databaseURL = process.env.DATABASE_URL;

if (!databaseURL) {
  throw new Error("DATABASE_URL 不存在");
}

// 配置 PostgreSQL 连接；创建一个 PostgreSQL 适配器，并把数据库连接地址交给它。
const adapter = new PrismaPg({ connectionString: databaseURL });

// 创建并导出数据库操作对象；创建整个项目共用的 Prisma Client，并把 PostgreSQL 适配器交给它。
export const prisma = new PrismaClient({ adapter });
