# ShoreOS · 微信小程序版

人生自由度仪表盘 — 算清楚你离 FIRE 还有多远。

## 运行步骤

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开工具 → 导入项目 → 选择这个文件夹
3. 填入你的 AppID（去 mp.weixin.qq.com 注册获取）
4. 点击编译预览，手机扫码即可查看

## 项目结构

```
├── app.json          # 小程序配置
├── app.js            # 全局入口
├── app.wxss          # 全局样式
├── pages/
│   ├── wizard/       # 引导式填写（7步）
│   └── dashboard/    # 仪表盘展示
└── utils/
    └── calc.js       # FIRE 计算引擎
```

## 功能

- 7步引导式填写：基本信息 → 社保 → 收入 → 住房 → 开销 → 最低开销 → 资产
- 养老+医保双线独立计算，支持「达标即停」/「缴到退休」两种策略
- FIRE 目标计算（4%法则），房贷保守估算
- 情景推演：现在不工作 vs 坚持到35/40/45/50/55/60岁
- 数据自动保存到微信本地存储
