// 配置文件 — 上线前填写
module.exports = {
  appId: '',          // 去 mp.weixin.qq.com → 开发设置 获取
  appName: 'ShoreOS',
  version: '1.0.0',
  
  // 社保默认值（可按需修改）
  defaults: {
    pensionMin: 15,   // 养老最低缴费年限
    medicalMin: 25,   // 医保终身年限（男25/女20）
    assetReturn: 2,   // 资产年化收益率（保守估计）
  }
};
