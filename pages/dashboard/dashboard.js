// pages/dashboard/dashboard.js
const calc = require('../../utils/calc.js');

Page({
  data: {
    hasData: false,
    version: '',
    result: null,
    freedomIdx: '--',
    freedomLabel: '填写参数后查看',
    fireTarget: '--',
    fireGap: '--',
    fireETA: '--',
    annualSave: '--',
    saveSub: '--',
    ssStatus: '--',
    ssSub: '--',
    quitSurvive: '--',
    quitSub: '--',
    assetGap: '--',
    assetGapSub: '--',
    scenarios: [],
    gaugePct: 0,
    gaugeColor: '#e5e5ea'
  },

  onShow() {
    const app = getApp();
    this.setData({ version: app.globalData.config.version });
    const saved = wx.getStorageSync('shoreos_data');
    if (saved) {
      const d = JSON.parse(saved);
      const result = calc.calculate({ ...d, expHousing: this.getHousing(d) });
      if (result) {
        this.renderResult(result, d);
      }
    }
  },

  getHousing(d) {
    if (d.houseType === 'rent') return d.expRent || 0;
    if (d.houseType === 'mortgage') return (d.expMortgage || 0) + (d.expProperty || 0);
    return d.expProperty || 0;
  },

  renderResult(r, d) {
    const moods = ['起步积累', '路走一半', '曙光在前', '接近自由', '可以选择不工作了'];
    const mi = r.fi < 20 ? 0 : r.fi < 40 ? 1 : r.fi < 60 ? 2 : r.fi < 80 ? 3 : 4;
    const clr = r.fi < 25 ? '#ff3b30' : r.fi < 50 ? '#ff9500' : r.fi < 75 ? '#007aff' : '#34c759';

    const sc = r.scenarios.map(s => ({
      ...s,
      assetsStr: s.assets >= 10000 ? (s.assets / 10000).toFixed(1) + '万' : s.assets.toFixed(0),
      survivalStr: s.survival > 100 ? '>100年' : s.survival.toFixed(1) + '年',
      fiStr: Math.min(s.fi, 100).toFixed(1) + '%',
      penStr: s.pen >= r.penMin ? '✅' : s.pen.toFixed(1) + '年',
      medStr: s.med >= r.medMin ? '✅' : s.med.toFixed(1) + '年'
    }));

    this.setData({
      hasData: true,
      result: r,
      freedomIdx: Math.min(r.fi, 100).toFixed(1) + '%',
      freedomLabel: moods[mi],
      fireTarget: this.fmtW(r.fire),
      fireGap: this.fmtW(r.gap),
      fireETA: r.yearsToFire < 100 ? (new Date().getFullYear() + Math.round(r.yearsToFire)) + '年' : '—',
      annualSave: this.fmtW(r.annualSavings),
      saveSub: '≈' + (r.minMonthly > 0 ? (r.annualSavings / r.minMonthly).toFixed(1) : '0') + '个月',
      ssStatus: r.penToMin > 0 ? r.penToMin.toFixed(1) + '年' : '✅',
      ssSub: r.penToMin > 0 ? (r.age + r.penToMin).toFixed(1) + '岁达标' : '已达标',
      quitSurvive: r.quitYears > 50 ? '>50年' : r.quitYears.toFixed(1) + '年',
      quitSub: '最低月均' + this.fmtW(r.minMonthly),
      assetGap: this.fmtW(r.gap),
      assetGapSub: r.gap <= 0 ? '够了！🎉' : '继续积累',
      scenarios: sc,
      gaugePct: Math.min(r.fi, 100),
      gaugeColor: clr
    });
  },

  fmtW(n) {
    if (Math.abs(n) >= 10000) return (n / 10000).toFixed(1) + '万';
    return n.toFixed(0);
  },

  goToWizard() {
    wx.switchTab({ url: '/pages/wizard/wizard' });
  }
});
