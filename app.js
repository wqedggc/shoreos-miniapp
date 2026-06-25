// 统一配置入口
const config = require('./config.js');

App({
  globalData: {
    config: config,
    version: config.version,
    userData: null
  },
  onLaunch() {
    const saved = wx.getStorageSync('shoreos_data');
    if (saved) {
      this.globalData.userData = JSON.parse(saved);
    }
  }
});
