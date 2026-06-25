// FIRE 计算引擎 — 从 Web 版移植，纯逻辑无 DOM 依赖
module.exports = {
  // 输入：userData 对象，返回计算结果
  calculate(userData) {
    const d = userData;
    const age = d.currentYear - d.birthYear;
    if (age <= 0 || age > 120) return null;

    const penY = d.pensionYears || 0, medY = d.medicalYears || 0;
    const penMin = d.pensionMin || 15, medMin = d.medicalMin || 25;
    const penSelf = d.pensionSelfPay || 0, medSelf = d.medicalSelfPay || 0;
    const ssStrategy = d.ssStrategy || 'min';

    // 当前自缴社保
    let ssSelfNow = 0;
    if (penY < penMin) ssSelfNow += penSelf;
    if (medY < medMin) ssSelfNow += medSelf;
    if (ssStrategy === 'retire') ssSelfNow = penSelf + medSelf;

    // 总自缴成本
    let ssTotalCost = 0;
    if (ssStrategy === 'retire') {
      ssTotalCost = Math.max(60 - age, 0) * (penSelf + medSelf) * 12;
    } else {
      let pR = Math.max(penMin - penY, 0), mR = Math.max(medMin - medY, 0);
      ssTotalCost += Math.min(pR, mR) * (penSelf + medSelf) * 12;
      pR -= Math.min(pR, mR); mR -= Math.min(Math.max(penMin - penY, 0), Math.max(medMin - medY, 0));
      if (mR > 0) ssTotalCost += mR * medSelf * 12;
    }

    const income = d.incomePost || 0;
    const currentMonthly = (d.expHousing || 0) + (d.expFood || 0) + (d.expTransport || 0) + (d.expPet || 0) + (d.expEntertain || 0) + (d.expInsurance || 0) + (d.expOther || 0);
    const currentAnnual = currentMonthly * 12;
    const minMonthly = (d.expQHousing || 0) + (d.expQFood || 0) + (d.expQTransport || 0) + (d.expQPet || 0) + (d.expQEntertain || 0) + (d.expQInsurance || 0) + (d.expQOther || 0) + ssSelfNow;
    const minAnnual = minMonthly * 12;

    const totalAssets = (d.assetCash || 0) + (d.assetDeposit || 0) + (d.assetFund || 0) + (d.assetStock || 0) + (d.assetPension || 0);
    const ret = (d.assetReturn || 2) / 100;

    // 房贷
    let mgPrincipal = 0, mgMonthly = 0, mgYears = 0;
    if (d.houseType === 'mortgage') {
      mgMonthly = d.expMortgage || 0;
      mgYears = d.mortgageYearsLeft || 0;
      if (mgMonthly > 0 && mgYears > 0) mgPrincipal = mgMonthly * 12 * mgYears * 0.85;
    }

    const effectiveMinAnnual = minAnnual - ssSelfNow * 12;
    const longTermAnnual = effectiveMinAnnual - mgMonthly * 12;
    const fire = Math.max(longTermAnnual, 0) * 25 + mgPrincipal;
    const investableAssets = Math.max(totalAssets - mgPrincipal, 0);
    const fi = fire > 0 ? Math.min(investableAssets / fire * 100, 100) : 0;

    const annualSavings = Math.max(income - currentAnnual, 0);
    const quitYears = minAnnual > 0 ? totalAssets / minAnnual : 999;
    const gap = Math.max(fire - investableAssets, 0);
    const yearsToFire = annualSavings > 0 ? gap / annualSavings : 999;

    const penToMin = Math.max(penMin - penY, 0);
    const medToMin = Math.max(medMin - medY, 0);

    // 情景推演
    const scenarios = [];
    for (const ta of [age, 35, 40, 45, 50, 55, 60]) {
      if (ta < age) continue;
      const wy = ta - age;
      let a = totalAssets;
      for (let i = 0; i < wy; i++) a = a * (1 + ret) + annualSavings;
      const surv = minAnnual > 0 ? a / minAnnual : 999;
      const fiAt = fire > 0 ? Math.min((a - mgPrincipal) / fire * 100, 100) : 0;
      scenarios.push({
        label: ta === age ? '现在就不工作' : `坚持到${ta}岁`,
        age: ta, assets: a, survival: surv,
        pen: penY + wy, med: medY + wy, fi: fiAt, ok: fiAt >= 100
      });
    }

    // 资产预测
    const projYears = 35;
    const labels = [], cw = [], qn = [], q35 = [], q40 = [];
    for (let y = 0; y <= projYears; y++) {
      labels.push((age + y) + '岁');
      // 继续工作
      let aw = totalAssets;
      for (let i = 0; i < y; i++) aw = aw * (1 + ret) + annualSavings;
      cw.push(aw / 10000);
      // 现在就停
      let aq = totalAssets;
      for (let i = 0; i < y; i++) {
        let expY = minAnnual;
        if (i < mgYears) expY += mgMonthly * 12;
        aq = aq * (1 + ret) - expY;
      }
      qn.push(Math.max(aq / 10000, 0));
      // 35岁停
      const w35 = Math.max(35 - age, 0);
      let a35 = totalAssets;
      for (let i = 0; i < y; i++) {
        if (i < w35) a35 = a35 * (1 + ret) + annualSavings;
        else { let e = minAnnual; if (i - w35 < mgYears) e += mgMonthly * 12; a35 = a35 * (1 + ret) - e; }
      }
      q35.push(Math.max(a35 / 10000, 0));
      // 40岁停
      const w40 = Math.max(40 - age, 0);
      let a40 = totalAssets;
      for (let i = 0; i < y; i++) {
        if (i < w40) a40 = a40 * (1 + ret) + annualSavings;
        else { let e = minAnnual; if (i - w40 < mgYears) e += mgMonthly * 12; a40 = a40 * (1 + ret) - e; }
      }
      q40.push(Math.max(a40 / 10000, 0));
    }

    // 安全垫
    const pY = [1, 2, 3, 5, 8, 10];
    const sMo = pY.map(y => (annualSavings * y / minAnnual) * 12);

    return {
      age, penY, medY, penMin, medMin, penToMin, medToMin,
      ssSelfNow, ssTotalCost, income, currentMonthly, minMonthly,
      totalAssets, investableAssets, annualSavings, fire, fi,
      gap, yearsToFire, quitYears, ret, mgPrincipal,
      scenarios, labels, cw, qn, q35, q40, pY, sMo
    };
  }
};
