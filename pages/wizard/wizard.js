// pages/wizard/wizard.js
const calc = require('../../utils/calc.js');

Page({
  data: {
    step: 0,
    totalSteps: 7,
    progress: 0,
    version: '',
    // 用户数据（从 config.defaults 初始化）
    birthYear: 1995,
    gender: '',
    workYears: 7,
    pensionMin: 15,
    medicalMin: 25,
    pensionSelfPay: 0,
    medicalSelfPay: 0,
    ssStrategy: 'min',
    incomePost: 0,
    // 住房
    houseType: 'rent',
    expRent: 0,
    expMortgage: 0,
    mortgageYearsLeft: 0,
    expProperty: 0,
    // 当前开销
    expFood: 0, expTransport: 0, expPet: 0,
    expEntertain: 0, expInsurance: 0, expOther: 0,
    // 最低开销
    expQHousing: 0, expQFood: 0, expQTransport: 0,
    expQPet: 0, expQEntertain: 0, expQInsurance: 0, expQOther: 0,
    // 资产
    assetCash: 0, assetDeposit: 0, assetFund: 0,
    assetStock: 0, assetPension: 0, assetReturn: 2,
    // 子女
    childPlan: 'none',
    childCost: 0,
    // 显示
    currentYear: new Date().getFullYear(),
    currentNowTotal: 0,
    currentMinTotal: 0,
    currentAssetTotal: 0
  },

  onLoad() {
    const app = getApp();
    const def = app.globalData.config.defaults;
    // 用配置的默认值覆盖初始状态
    this.setData({
      pensionMin: def.pensionMin,
      medicalMin: def.medicalMin,
      assetReturn: def.assetReturn,
      version: app.globalData.config.version
    });
    const saved = wx.getStorageSync('shoreos_data');
    if (saved) {
      const d = JSON.parse(saved);
      this.setData({ ...d, currentYear: new Date().getFullYear() });
    }
    this.recalc();
  },

  // 保存 + 重算
  saveAndCalc() {
    const data = { ...this.data };
    delete data.step; delete data.totalSteps; delete data.progress;
    delete data.currentNowTotal; delete data.currentMinTotal;
    delete data.currentAssetTotal; delete data.__webviewId__;
    wx.setStorageSync('shoreos_data', JSON.stringify(data));
    this.recalc();
  },

  recalc() {
    const d = this.data;
    d.pensionYears = d.workYears;
    d.medicalYears = d.workYears;

    const housing = d.houseType === 'rent' ? (d.expRent || 0) :
      (d.houseType === 'mortgage' ? (d.expMortgage || 0) + (d.expProperty || 0) : (d.expProperty || 0));
    const expHousing = housing;

    const result = calc.calculate({ ...d, expHousing });
    if (!result) return;

    // 更新显示
    this.setData({
      currentNowTotal: (result.currentMonthly || 0).toFixed(0),
      currentMinTotal: (result.minMonthly || 0).toFixed(0),
      currentAssetTotal: (result.totalAssets || 0).toFixed(0)
    });
  },

  // 向导导航
  setStep(n) {
    if (n < 0 || n >= this.data.totalSteps) return;
    this.setData({
      step: n,
      progress: ((n + 1) / this.data.totalSteps * 100).toFixed(0)
    });
  },
  nextStep() {
    this.setStep(this.data.step + 1);
  },
  prevStep() {
    this.setStep(this.data.step - 1);
  },
  finish() {
    wx.switchTab({ url: '/pages/dashboard/dashboard' });
  },

  // 年份步进
  stepYear(delta) {
    const v = Math.max(1960, Math.min(2010, this.data.birthYear + delta));
    this.setData({ birthYear: v });
    this.saveAndCalc();
  },
  stepWork(delta) {
    const v = Math.max(0, Math.min(50, this.data.workYears + delta));
    this.setData({ workYears: v });
    this.saveAndCalc();
  },

  // 性别
  setGender(g) {
    const min = g === 'female' ? 20 : 25;
    this.setData({ gender: g, medicalMin: min });
    this.saveAndCalc();
  },

  // 城市预设
  applyCity(city) {
    const presets = {
      beijing: { pensionMin: 15, medicalMin: 25, pensionSelfPay: 1265, medicalSelfPay: 520 },
      shanghai: { pensionMin: 15, medicalMin: 15, pensionSelfPay: 1400, medicalSelfPay: 580 },
      guangzhou: { pensionMin: 15, medicalMin: 25, pensionSelfPay: 1100, medicalSelfPay: 450 },
      shenzhen: { pensionMin: 15, medicalMin: 25, pensionSelfPay: 1000, medicalSelfPay: 420 },
      other: { pensionMin: 15, medicalMin: 25, pensionSelfPay: 0, medicalSelfPay: 0 }
    };
    const p = presets[city] || presets.other;
    this.setData({ ...p });
    this.saveAndCalc();
  },

  // 社保策略
  setSSStrategy(s) {
    this.setData({ ssStrategy: s });
    this.saveAndCalc();
  },

  // 住房类型
  setHouseType(t) {
    this.setData({ houseType: t });
    this.saveAndCalc();
  },

  // 子女
  setChild(p) {
    this.setData({ childPlan: p });
    this.saveAndCalc();
  },

  // 快速填充
  quickExpenses(total) {
    const housing = this.data.houseType === 'rent' ? (this.data.expRent || 0) :
      (this.data.houseType === 'mortgage' ? (this.data.expMortgage || 0) + (this.data.expProperty || 0) : 0);
    const rem = Math.max(total - housing, 0);
    this.setData({
      expFood: Math.round(rem * 0.35),
      expTransport: Math.round(rem * 0.10),
      expPet: Math.round(rem * 0.10),
      expEntertain: Math.round(rem * 0.15),
      expInsurance: Math.round(rem * 0.10),
      expOther: Math.round(rem * 0.20)
    });
    this.saveAndCalc();
  },

  quickMinExp(ratio) {
    this.setData({
      expQHousing: Math.round((this.data.expRent || this.data.expMortgage || 0) * ratio),
      expQFood: Math.round((this.data.expFood || 0) * ratio),
      expQTransport: Math.round((this.data.expTransport || 0) * ratio),
      expQPet: Math.round((this.data.expPet || 0) * ratio),
      expQEntertain: Math.round((this.data.expEntertain || 0) * ratio),
      expQInsurance: Math.round((this.data.expInsurance || 0) * ratio),
      expQOther: Math.round((this.data.expOther || 0) * ratio)
    });
    this.saveAndCalc();
  },

  quickAssets(total) {
    this.setData({
      assetCash: Math.round(total * 0.2),
      assetDeposit: Math.round(total * 0.4),
      assetFund: Math.round(total * 0.2),
      assetStock: Math.round(total * 0.2)
    });
    this.saveAndCalc();
  },

  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const val = parseFloat(e.detail.value) || 0;
    this.setData({ [field]: val });
    this.saveAndCalc();
  }
});
