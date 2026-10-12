# 羽渡鸦夜 · Yudu Raven Night

> 冰山之下，请勿靠近（除非你很想）。

一个紫色调的**个人名片页面**。单页、零依赖、零构建 —— 打开 `index.html` 就能看。

![紫色冰山主题个人名片](assets/img/preview.svg)

---

## 这是什么

一张放在主页上的个人名片。冷是外壳，软是内核：

- **表与里** —— 点击「敲开冰面」，冰层化开，露出藏起来的那一面
- **属性面板** —— 代码力 97，社交电量 2%，以及一条不该出现的「心软度」
- **技能 / 作品 / 联系** —— 该有的都有，语气不太热情

设计上用**棱角表达高冷，圆润表达软萌**：冷的部分是细线、方角、衬线字与克制的留白；软的部分是圆角、粉色光晕和会弹跳的小动效。

## 特性

| | |
|---|---|
| **零依赖** | 没有框架、没有 CDN、没有构建步骤，纯 HTML + CSS + JS |
| **零外链** | 字体用系统栈，图标内联 SVG，断网也能完整显示 |
| **自适应** | 1000px / 700px / 420px 三档断点，移动端可用 |
| **可访问** | 语义标签、跳转链接、焦点样式、`aria` 属性齐全 |
| **尊重偏好** | 自动响应 `prefers-reduced-motion`，关闭动画不至于失效 |
| **深浅通吃** | 深色为主，打印样式自动转白底黑字 |

## 文件结构

```
.
├── index.html              # 单页主体
├── assets/
│   ├── css/style.css       # 全部样式
│   ├── js/main.js          # 全部交互
│   └── img/preview.svg     # 预览图
├── LICENSE
└── README.md
```

## 本地预览

直接双击 `index.html` 即可。

想用本地服务器（推荐，剪贴板 API 在 `file://` 下会被浏览器禁用）：

```bash
python -m http.server 8080
# 打开 http://localhost:8080
```

## 部署到 GitHub Pages

```bash
git init
git add .
git commit -m "feat: 羽渡鸦夜个人名片"
git branch -M main
git remote add origin https://github.com/YuDu-Yaye/yudu-raven-night.git
git push -u origin main
```

然后在仓库 **Settings → Pages** 里把 Source 设为 `main` 分支的 `/ (root)`，
稍等片刻即可通过 `https://yudu-yaye.github.io/yudu-raven-night/` 访问。

## 交互一览

| 操作 | 效果 |
|---|---|
| 点击「敲开冰面」 | 冰层融化，暖色边框亮起，API 撒一把光点 |
| 双击页面空白处 | 冒出爱心与星屑（彩蛋） |
| 移动指针 | 寒霜光晕跟随；冰晶粒子被靠近时变亮 |
| 滚动到「表与里」 | 冰面先自己裂一下，提示这里可以点 |
| 点击微信一行 | 复制微信号，按钮变为「已复制」 |

## 想改成自己的

主要改这几个地方：

1. **`index.html`** —— 搜索 `羽渡鸦夜` 替换名字；`#contact` 区块里的 GitHub / 邮箱 / 微信换成你的
2. **属性数值** —— `data-val="97"`、`data-lv="95"`、`data-to="97"` 这些属性
3. **文案** —— 「表与里」两张清单、作品卡片里的描述
4. **配色** —— `assets/css/style.css` 顶部 `:root` 里的 CSS 变量，改 `--vi-*`（紫）、`--ice-*`（冰）、`--warm`（暖）即可整体换色

## 许可

[MIT](LICENSE) —— 随便用，改吧。反正我也不会说什么。

---

<p align="center">
  <sub>代码如羽 · 渡夜而行</sub>
</p>
