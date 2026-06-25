// ShoreOS 全局配置
App({
  globalData: {
    version: '1.0.0',
    userData: null  // 由各页面填充
  },
  onLaunch() {
    // 恢复缓存数据
    const saved = wx.getStorageSync('shoreos_data');
    if (saved) {
      this.globalData.userData = JSON.parse(saved);
    }
  }
});
