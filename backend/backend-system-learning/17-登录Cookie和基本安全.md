# 17. 登录和安全：服务器怎样确认管理员身份

> Mini CMS 阶段 6：先完成标签、发布规则和管理页面，再用本章理解登录闭环；具体代码放到第 17A 章实践。

## 问题背景

有一个登录页面，不代表后端已经有登录能力。

真正的登录要解决：

```text
密码怎样保存？
登录成功后怎样记住身份？
下一次请求怎样证明自己已经登录？
哪些接口必须拦截未登录用户？
```

假设管理员刚提交了正确密码，随后又发出一条“创建文章”的请求。服务器需要从这条新请求中识别管理员，浏览器也需要一种凭证，避免每次操作都重新提交密码。

本项目使用**数据库 Session + HttpOnly Cookie**：服务器保存登录记录，浏览器保存并携带对应凭证，后端在每次受保护请求中查询记录。

---

## 登录链路包含哪些部分

### 1. 认证和授权不同

```text
认证 Authentication
-> 你是谁？

授权 Authorization
-> 你能做什么？
```

单管理员文章系统先完成认证即可，不急着增加角色和复杂权限。

### 2. 密码不能明文保存

数据库只保存密码哈希：

```text
用户输入密码
-> 使用密码哈希算法验证
-> 比较结果
```

哈希不是加密后再解密。验证时比较哈希结果，不取回原始密码。

### 3. Session 是服务器保存的登录记录

Session 通常译为“会话”。在 Mini CMS 中，可以先把它理解成数据库里的一条登录记录。

登录成功时，服务器生成一串随机字符串，叫 **Session Token**，并创建对应的 Session。先分清三个对象：

| 对象 | 保存在哪里 | 本项目中的作用 |
|---|---|---|
| Session | PostgreSQL 的 `sessions` 表 | 记录凭证属于哪个管理员、何时过期 |
| Session Token | 浏览器的 Cookie 中；发送请求时交给服务器 | 作为后续请求的登录凭证 |
| Cookie | 由浏览器管理 | 保存 Token，并在符合规则的请求中自动携带 |

Token 本身只是一串随机值，不包含管理员 ID。服务器收到 Token 后，要查询 Session 才知道它对应谁。

第 17A 章还会做一层保护：数据库只保存 Token 的哈希。后续收到同一个 Token，再计算一次哈希，就能找到对应记录。原始 Token 和哈希的具体生成方法留到实操中学习。

### 4. Cookie 怎样把凭证带回来

登录成功后，服务器在 HTTP 响应头中设置 Cookie。下面省略了部分属性，`example-token` 只是示意值，实操时由服务器随机生成：

```http
Set-Cookie: mini_cms_session=example-token; Path=/; HttpOnly; SameSite=Lax
```

浏览器保存它。以后前端请求管理接口时，浏览器在符合规则的情况下自动带上请求头：

```http
Cookie: mini_cms_session=example-token
```

`Set-Cookie` 出现在服务器响应里，用于设置 Cookie；`Cookie` 出现在后续请求里，用于把凭证带回服务器。前端的 `fetch()` 不需要手动拼接这个请求头。

Cookie 后面的属性用于限制它怎样被使用：

| 属性 | 当前先理解成 |
|---|---|
| `HttpOnly` | 浏览器 JavaScript 不能直接读取这条 Cookie |
| `SameSite` | 限制跨站请求何时可以自动携带 Cookie |
| `Secure` | 只通过 HTTPS 发送 Cookie |

这些限制可以降低登录凭证被误用或窃取的风险。

**HttpOnly 限制的是前端 JavaScript 读取 Cookie，浏览器仍然能保存和发送它。** 因此前端不用拿到 Token，再存进 `localStorage`。登录响应的 JSON 只需要返回管理员 ID、用户名等页面显示信息。

### 5. 认证中间件查询 Session，再决定是否放行

```text
请求创建文章
-> 认证中间件从 Cookie 读取 Token
-> 计算 Token 哈希，查询 sessions 表
-> 记录存在且未过期：得到管理员身份，继续创建文章
-> 没有有效凭证：返回 401
```

401 表示这次请求没有有效的登录凭证。

前端隐藏按钮或跳转登录页负责页面体验；后端认证中间件负责保护数据。即使用 Apifox 直接请求接口，也必须经过认证。

---

## 单管理员系统的最小认证范围

| 接口 | 做什么 | Session 怎样变化 |
|---|---|---|
| `POST /api/auth/login` | 验证账号密码，设置 Cookie | 创建一条登录记录 |
| `GET /api/auth/me` | 验证当前凭证，返回管理员信息 | 查询已有记录 |
| `POST /api/auth/logout` | 退出当前登录，清除 Cookie | 删除当前凭证对应的记录 |

刷新页面后，React 中的管理员状态会重新初始化，但浏览器仍可保留未过期的 Cookie。页面调用 `/me`，浏览器携带 Cookie，后端验证 Session 后返回管理员信息，页面就能恢复显示。这里没有再次提交密码，也没有创建新的登录记录。

退出时，后端先删除 Session，再让浏览器清除 Cookie。即使旧 Token 被再次发送，服务器也查不到有效记录，后续请求会被拒绝。

公开接口：

- 健康检查；17A 将它统一为 `/api/health`。
- 阶段 8 再增加读取已发布文章的公开接口。

受保护接口：

- 管理后台使用的文章、标签读写接口，包括草稿内容。

第一轮不做公开注册、多角色和找回密码。

---

## 接触过 JWT，怎样理解这次的选择

两种方案都沿着同一条主线：验证账号密码，发放凭证，后续请求携带凭证，认证中间件验证后放行。

主要区别在于后端怎样验证凭证：

| 操作 | 常见的无状态 JWT 方案 | 本项目的数据库 Session |
|---|---|---|
| 登录成功 | 签发包含身份信息、过期时间等内容的 JWT | 生成随机 Token，保存对应登录记录 |
| 后续认证 | 验证签名、过期时间等条件 | 用 Token 哈希查询记录，检查过期时间 |
| 提前撤销 | 需要额外的撤销机制 | 删除对应记录，后续请求无法通过认证 |

Cookie 是保存和携带凭证的机制，JWT 也可以放进 HttpOnly Cookie。不要把“JWT”和“Cookie”理解成两种互斥的登录方案。

Mini CMS 已经有 PostgreSQL 和 Prisma，管理员数量少。Session 可以复用已学过的创建、查询和删除，退出也容易验证。代价是每次认证增加数据库查询；这是当前项目可以接受的取舍。以前学过的密码验证、认证中间件和 401 处理继续适用。

---

## CORS 和 Cookie 为什么会一起出现

开发环境中：

```text
Next.js：http://localhost:3000
Express：http://localhost:3001
```

来源（origin）由协议、主机和端口共同决定。这里端口不同，所以属于不同来源。

如果已按第 14 章配置 Express 允许管理后台的来源，登录改用 Cookie 后，还需要让后端 CORS 允许凭证：

```ts
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
```

前端请求也要声明携带凭证：

```ts
fetch(`${API_URL}/api/auth/me`, {
  credentials: "include",
});
```

`credentials: "include"` 要放在统一请求封装中，登录请求也需要它：跨来源登录时，浏览器要接收响应设置的 Cookie；之后请求时，还要携带已有 Cookie。第 17A 章会在一处完成配置。

上面的两个 localhost 地址虽然跨来源，但仍属于同站；`SameSite=Lax` 不会仅因为端口不同就阻止这里的 Cookie。开发时前后端统一使用 `localhost`，避免一边使用 `127.0.0.1`。

CORS 控制浏览器是否允许前端读取跨来源响应，不能代替后端身份验证。

浏览器会自动携带 Cookie，也带来一种风险：恶意网站可能诱导已登录用户发出修改数据的请求。这类攻击叫 CSRF。`SameSite` 可以降低风险；第 17A 章还会检查写请求的 `Origin`，只接受配置的后台来源。上线时再结合实际域名和 HTTPS 检查这些设置。

---

## 小结

```text
密码哈希
-> 数据库不保存原始密码，登录时通过哈希结果验证

数据库 Session
-> 记录当前凭证属于谁、何时过期；退出时删除记录

Cookie
-> 浏览器保存 Token，并在符合规则的后续请求中自动携带

认证中间件
-> 读取 Token，查询 Session；成功才继续，失败返回 401

CORS
-> 控制浏览器是否允许前端读取跨来源响应，不能代替登录验证
```

登录的核心不是页面，而是每次敏感请求都能被服务器验证。

能解释“凭证存在哪里、请求怎样带上它、后端怎样验证、退出怎样失效”后，就进入 [17A-管理员登录实操](./17A-管理员登录实操-用Session和Cookie保护写接口.md)，把这条链路写出来。

## 官方参考

- [MDN：Set-Cookie 与 HttpOnly](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)
- [OWASP：Session 管理](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Auth.js：JWT 与数据库 Session 的取舍](https://authjs.dev/concepts/session-strategies)
