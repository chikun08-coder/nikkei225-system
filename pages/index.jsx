"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Area, Line, Cell, LineChart, PieChart, Pie } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Shield, Zap, Activity, BarChart3, Building2, Flame, Eye, Layers, Wind, ChevronDown, ChevronUp, Clock, Play, Calendar, Sun, Moon, Sunrise, Sunset, Award, Database, Plus, Trash2, Save, Square } from 'lucide-react';

// ===== 実データ（2026年1月17日 修正版） =====
const realMarketData = {
  market: {
    date: '2026年1月17日（金）',
    updateTime: '07:38',
    nikkei225: 53936.17,
    nikkeiChange: -174.33,
    nikkeiChangePercent: -0.32,
    nikkeiHigh: 54130.60,
    nikkeiLow: 53706.79,
    nikkeiOpen: 54071.28,
    futures: 54060, // 大証日中清算値
    futuresNight: 53720, // 夜間終値
    futuresChange: -340, // CME vs 大証日中
    cme: 53720, // CME終値（大証日中比-340円）
    sgx: 53705, // SGX（大証日中比-355円）
    usdjpy: 158.10,
    topix: 3658.68,
    vix: 16.2,
    nyDow: 49359.33,
    nyDowChange: -83.11,
    sp500: 6114.63,
    nasdaq: 23515.39,
  },

  technical: {
    rsi14: 73.149,
    macd: 480.460,
    stochK: 89.2,
    stochD: 85.6,
    adx: 28.5,
    atr14: 485,
    ma5: 53345.88,
    ma20: 52890.45,
    ma50: 51829.10,
    ma200: 50604.13,
    bbUpper: 54850,
    bbMiddle: 52890,
    bbLower: 50930,
    pivotR3: 55120,
    pivotR2: 54528,
    pivotR1: 54232,
    pivotP: 53654.83,
    pivotS1: 53358,
    pivotS2: 52780,
    pivotS3: 52188,
  },

  weeklyPrices: [
    { date: '01/09', open: 50339, high: 52523, low: 50245, close: 51939, change: +1600 },
    { date: '01/10', open: 51939, high: 52012, low: 51580, close: 51755, change: -184 },
    { date: '01/13', open: 51755, high: 53680, low: 52890, close: 53549, change: +1794 },
    { date: '01/14', open: 53549, high: 54341, low: 53820, close: 54110, change: +561 },
    { date: '01/15', open: 54110, high: 54285, low: 53890, close: 54110, change: 0 },
    { date: '01/16', open: 54071, high: 54130, low: 53706, close: 53936, change: -174 },
  ],

  foreignDaily: {
    goldman: { name: 'ゴールドマン', shortName: 'GS', weeklyOI: -8104, todayVol: 1037, callSell: -632, putSell: 4, stance: '売り', stanceScore: -2, color: '#ef4444', comment: '売り仕掛け継続。C54000大量売り', strategy: 'ショートポジション維持' },
    morganMUFG: { name: 'モルガンMUFG', shortName: 'MS', weeklyOI: 0, todayVol: 2321, callSell: 0, putSell: 0, stance: '様子見', stanceScore: 0, color: '#64748b', comment: '方向感なし。日銀会合待ち', strategy: 'ニュートラル' },
    abn: { name: 'ABNアムロ', shortName: 'ABN', weeklyOI: +924, todayVol: 19123, callSell: -827, putSell: -113, stance: '中立', stanceScore: 0, color: '#f97316', comment: '出来高トップ。ボラ狙いか', strategy: 'デルタニュートラル' },
    societe: { name: 'ソシエテG', shortName: 'SG', weeklyOI: +3205, todayVol: 13057, callSell: -85, putSell: -53, stance: 'やや買い', stanceScore: +1, color: '#3b82f6', comment: '買い継続も慎重', strategy: 'ロング維持' },
    barclays: { name: 'バークレイズ', shortName: 'BARC', weeklyOI: +8650, todayVol: 5684, callSell: -300, putSell: -175, stance: '買い', stanceScore: +2, color: '#8b5cf6', comment: '大幅買い越し。上目線継続', strategy: 'ロング積み増し' },
    jpmorgan: { name: 'JPモルガン', shortName: 'JPM', weeklyOI: +9653, todayVol: 2475, callSell: -6, putSell: -109, stance: '買い', stanceScore: +2, color: '#22c55e', comment: '野村に追随。強気維持', strategy: 'ロングホールド' },
    nomura: { name: '野村', shortName: 'NMR', weeklyOI: +14018, todayVol: 1279, callSell: -75, putSell: 0, stance: '強気買い', stanceScore: +3, color: '#10b981', comment: '最大買い越し。主導権握る', strategy: '押し目買い継続' },
    citi: { name: 'シティ', shortName: 'CITI', weeklyOI: 0, todayVol: 0, callSell: 0, putSell: 0, stance: '様子見', stanceScore: 0, color: '#94a3b8', comment: '取引なし', strategy: '---' },
  },

  optionData: {
    callConcentration: [
      { strike: 54000, oi: 85420, iv: 16.8, foreignSell: 12500 },
      { strike: 54500, oi: 62300, iv: 17.2, foreignSell: 8900 },
      { strike: 55000, oi: 95800, iv: 22.5, foreignSell: 18200 },
    ],
    putConcentration: [
      { strike: 53000, oi: 78650, iv: 19.5 },
      { strike: 53500, oi: 55200, iv: 18.2 },
    ],
    atmIV: 17.5,
    ivPeak: { strike: 55000, iv: 22.5 },
    ivVacuum: { strike: 54000, iv: 16.8 },
    pcRatio: 1.15,
  },

  boardData: {
    nightSession: 'thin', // thin, normal, thick
    priceJump: true,
    sgxCmeLead: true,
    daySession: 'normal',
  },

  externalEnv: {
    yenWeak: 'strong', // strong, medium, weak
    usIndex: 'strong',
    vixLevel: 'low', // low, medium, high
    topixWeakNikkeiStrong: true,
  },

  newsEvents: [
    { time: '06:00', event: 'CME終値 53,720円（大証比-340円）', impact: 'negative', importance: 'high' },
    { time: '08:50', event: '日銀ETF売却開始報道', impact: 'negative', importance: 'medium' },
    { time: '09:30', event: '中国GDP発表', impact: 'neutral', importance: 'high' },
    { time: '21:00', event: '米小売売上高', impact: 'neutral', importance: 'high' },
  ],
};

// ===== 詳細な踏み上げ発火判定（11項目完全版） =====
const calculateDetailedFireAnalysis = (data) => {
  const { market, foreignDaily, optionData, boardData, externalEnv, technical } = data;
  
  // 1. 外資手口スコア（0〜5）
  const foreignAnalysis = (() => {
    let score = 0;
    let details = [];
    
    // 各社の売り偏り
    const gsCallSell = foreignDaily.goldman.callSell < -500;
    const abnCallSell = foreignDaily.abn.callSell < -500;
    
    if (gsCallSell) {
      score += 2;
      details.push(`GS: C売${foreignDaily.goldman.callSell}枚`);
    }
    if (abnCallSell) {
      score += 1;
      details.push(`ABN: C売${foreignDaily.abn.callSell}枚`);
    }
    
    const totalBuyOI = Object.values(foreignDaily).reduce((sum, t) => sum + (t.weeklyOI > 0 ? t.weeklyOI : 0), 0);
    if (totalBuyOI > 30000) {
      score += 2;
      details.push(`買越計: +${totalBuyOI.toLocaleString()}枚`);
    } else if (totalBuyOI > 15000) {
      score += 1;
      details.push(`買越計: +${totalBuyOI.toLocaleString()}枚`);
    }
    
    return { 
      score: Math.min(5, score), 
      details,
      concentration: '54,500〜55,000円',
    };
  })();

  // 2. IVスコア（0〜5）
  const ivAnalysis = (() => {
    let score = 0;
    let details = [];
    
    details.push(`ATM IV: ${optionData.atmIV}%`);
    if (optionData.atmIV < 18) {
      score += 2;
    }
    
    details.push(`IVピーク: ${optionData.ivPeak.strike}円 (${optionData.ivPeak.iv}%)`);
    if (optionData.ivPeak.iv > 20) {
      score += 1;
    }
    
    details.push(`IV低下ゾーン: ${optionData.ivVacuum.strike}円 (${optionData.ivVacuum.iv}%)`);
    if (optionData.ivVacuum.iv < 17) {
      score += 2;
    }
    
    const ivShape = optionData.ivPeak.iv - optionData.ivVacuum.iv > 5 ? 'YES' : 'NO';
    details.push(`IV異常形状: ${ivShape}`);
    
    return { score: Math.min(5, score), details, shape: ivShape };
  })();

  // 3. 板スコア（0〜5）
  const boardAnalysis = (() => {
    let score = 0;
    let details = [];
    
    const nightLabel = boardData.nightSession === 'thin' ? '薄い' : boardData.nightSession === 'normal' ? '普通' : '厚い';
    details.push(`夜間の板: ${nightLabel}`);
    if (boardData.nightSession === 'thin') score += 2;
    
    details.push(`値が飛ぶ: ${boardData.priceJump ? 'YES' : 'NO'}`);
    if (boardData.priceJump) score += 1;
    
    details.push(`SGX/CME先導: ${boardData.sgxCmeLead ? 'YES' : 'NO'}`);
    if (boardData.sgxCmeLead) score += 1;
    
    const dayLabel = boardData.daySession === 'thin' ? '薄い' : boardData.daySession === 'normal' ? '普通' : '厚い';
    details.push(`日中の板: ${dayLabel}`);
    if (boardData.daySession === 'thin') score += 1;
    
    return { score: Math.min(5, score), details };
  })();

  // 4. 価格地形スコア（0〜5）
  const terrainAnalysis = (() => {
    let score = 0;
    let details = [];
    const currentPrice = market.nikkei225;
    
    // 売り溜まり（踏み上げ起点）
    const nearestCall = optionData.callConcentration[0];
    details.push(`売り溜まり: ${nearestCall.strike.toLocaleString()}円 (${nearestCall.oi.toLocaleString()}枚)`);
    
    // 真空地帯
    const vacuumZone = `${optionData.ivVacuum.strike.toLocaleString()}〜${(optionData.ivVacuum.strike + 500).toLocaleString()}円`;
    details.push(`真空地帯: ${vacuumZone}`);
    
    // 距離判定
    const distance = nearestCall.strike - currentPrice;
    if (distance < 300 && distance > 0) {
      score += 3;
      details.push(`現在地形: 真空地帯接近`);
    } else if (distance < 600) {
      score += 2;
      details.push(`現在地形: 上昇余地あり`);
    } else {
      score += 1;
      details.push(`現在地形: 抵抗帯手前`);
    }
    
    details.push(`最終ターゲット: 55,000円`);
    
    return { 
      score: Math.min(5, score), 
      details,
      sellZone: nearestCall.strike,
      vacuumZone,
      target: 55000,
    };
  })();

  // 5. 外部環境スコア（0〜5）
  const externalAnalysis = (() => {
    let score = 0;
    let details = [];
    
    const yenLabel = externalEnv.yenWeak === 'strong' ? '強' : externalEnv.yenWeak === 'medium' ? '中' : '弱';
    details.push(`円安: ${yenLabel} (${market.usdjpy}円)`);
    if (externalEnv.yenWeak === 'strong') score += 1;
    
    const usLabel = externalEnv.usIndex === 'strong' ? '強' : externalEnv.usIndex === 'medium' ? '中' : '弱';
    details.push(`米国指数: ${usLabel}`);
    if (externalEnv.usIndex === 'strong') score += 1;
    
    const vixLabel = externalEnv.vixLevel === 'low' ? '低' : externalEnv.vixLevel === 'medium' ? '中' : '高';
    details.push(`VIX: ${vixLabel} (${market.vix})`);
    if (externalEnv.vixLevel === 'low') score += 1;
    
    details.push(`TOPIX弱・日経強: ${externalEnv.topixWeakNikkeiStrong ? 'YES' : 'NO'}`);
    if (externalEnv.topixWeakNikkeiStrong) score += 2;
    
    return { score: Math.min(5, score), details };
  })();

  // 6. 夜間静けさ
  const nightAnalysis = (() => {
    const score = boardData.nightSession === 'thin' ? 2 : boardData.nightSession === 'normal' ? 1 : 0;
    return { 
      score, 
      details: [`夜間: ${boardData.nightSession === 'thin' ? '静か（仕掛けやすい）' : '通常'}`],
    };
  })();

  const totalScore = foreignAnalysis.score + ivAnalysis.score + boardAnalysis.score + 
                     terrainAnalysis.score + externalAnalysis.score + nightAnalysis.score;

  // 7. コール売り危険度（0〜5）
  const callDangerAnalysis = (() => {
    let score = 0;
    let checks = [];
    const currentPrice = market.nikkei225;
    const nearestCall = optionData.callConcentration[0];
    
    const priceClose = Math.abs(nearestCall.strike - currentPrice) < 200;
    checks.push({ item: '価格接近（±200円）', value: priceClose ? 1 : 0 });
    if (priceClose) score += 1;
    
    const ivLow = nearestCall.iv < optionData.atmIV;
    checks.push({ item: '売りストライクIV低下', value: ivLow ? 1 : 0 });
    if (ivLow) score += 1;
    
    const foreignConcentrate = nearestCall.foreignSell > 10000;
    checks.push({ item: '外資売り集中', value: foreignConcentrate ? 1 : 0 });
    if (foreignConcentrate) score += 1;
    
    checks.push({ item: '板薄・値が飛ぶ', value: boardData.priceJump ? 1 : 0 });
    if (boardData.priceJump) score += 1;
    
    const inVacuum = optionData.ivVacuum.strike > currentPrice;
    checks.push({ item: '真空地帯に突入', value: inVacuum ? 1 : 0 });
    if (inVacuum) score += 1;
    
    const rollAction = score <= 1 ? '維持' : score <= 3 ? '半分ロール' : '全量ロール';
    const rollTarget = '55,500円';
    
    return { score: Math.min(5, score), checks, rollAction, rollTarget };
  })();

  // 8. 先物ヘッジスコア（0〜6）
  const hedgeAnalysis = (() => {
    let score = 0;
    let details = [];
    
    if (terrainAnalysis.score >= 3) {
      score += 2;
      details.push('地形: 真空（+2）');
    } else if (terrainAnalysis.score >= 2) {
      score += 1;
      details.push('地形: 上昇（+1）');
    } else {
      details.push('地形: レンジ（+0）');
    }
    
    if (callDangerAnalysis.score >= 4) {
      score += 2;
      details.push('コール危険度: 高（+2）');
    } else if (callDangerAnalysis.score >= 2) {
      score += 1;
      details.push('コール危険度: 中（+1）');
    } else {
      details.push('コール危険度: 低（+0）');
    }
    
    if (externalEnv.yenWeak === 'strong' && externalEnv.usIndex === 'strong') {
      score += 1;
      details.push('円安＋米国強（+1）');
    }
    if (externalEnv.vixLevel === 'low') {
      score += 1;
      details.push('VIX低（+1）');
    }
    
    const hedgeRatio = score <= 1 ? '0.3〜0.4' : score <= 3 ? '0.5〜0.6' : score <= 5 ? '0.7〜0.8' : '1.0';
    
    return { score: Math.min(6, score), details, hedgeRatio };
  })();

  // 発火判定
  const fireLevel = totalScore <= 6 ? '静穏' :
                    totalScore <= 12 ? '弱点形成' :
                    totalScore <= 18 ? '準備' :
                    totalScore <= 23 ? '寸前' : '★発火★';

  const fireColor = totalScore <= 6 ? '#22c55e' :
                    totalScore <= 12 ? '#84cc16' :
                    totalScore <= 18 ? '#eab308' :
                    totalScore <= 23 ? '#f97316' : '#ef4444';

  // 10. 最終アクション
  const finalAction = {
    roll: callDangerAnalysis.rollAction,
    rollTarget: callDangerAnalysis.rollTarget,
    hedge: `mini ${hedgeAnalysis.hedgeRatio}`,
    put: 'IV割高なし → 維持',
    strategy: totalScore >= 19 ? '踏み上げ警戒。コールは早めにロール。先物買い継続。' :
              totalScore >= 13 ? '上昇基調。ヘッジを厚めに。押し目買い狙い。' :
              '様子見。次の材料待ち。',
  };

  // 11. 地形変化メモ
  const terrainMemo = {
    foreignPattern: 'GSがコール売り継続。55,000円に大量売りポジション。',
    ivCurve: `${optionData.ivPeak.strike}円がピーク。${optionData.ivVacuum.strike}円が真空地帯。`,
    vacuumMove: '54,000〜54,500円はIV低く、値が走りやすい。',
    squeezeSign: '外資買い越し継続、円安進行、VIX低下。条件は揃いつつある。',
  };

  return {
    scores: {
      foreign: foreignAnalysis,
      iv: ivAnalysis,
      board: boardAnalysis,
      terrain: terrainAnalysis,
      external: externalAnalysis,
      night: nightAnalysis,
    },
    totalScore,
    maxScore: 30,
    fireLevel,
    fireColor,
    callDanger: callDangerAnalysis,
    hedge: hedgeAnalysis,
    finalAction,
    terrainMemo,
  };
};

// ===== 4スロット判定（見送りなし版） =====
const calculateSlotAnalysis = (data, slotType) => {
  const { market, technical, foreignDaily, optionData } = data;
  
  const foreignNetScore = Object.values(foreignDaily).reduce((sum, t) => sum + t.stanceScore, 0);
  
  let analysis = {
    slotType,
    direction: 'long', // 必ず long or short
    confidence: 50,
    stopLoss: 300,
    expectedRange: { high: 0, low: 0 },
    entryPrice: null,
    targetPrice: null,
    reasons: [],
    warnings: [],
  };

  let score = 0; // プラスなら買い、マイナスなら売り
  
  // ===== B. オプション手口連動 =====
  const currentPrice = market.futuresNight;
  
  // コール売り集中価格との距離
  const nearestCall = optionData.callConcentration[0]; // 54,000円
  const distanceToCall = nearestCall.strike - currentPrice;
  
  if (distanceToCall > 0 && distanceToCall < 300) {
    // コール売り集中に接近 → 上抜け期待（踏み上げ）
    score += 2;
    analysis.reasons.push(`コール売り${nearestCall.strike.toLocaleString()}円まで${distanceToCall}円 → 上抜け期待`);
  } else if (distanceToCall > 0 && distanceToCall < 500) {
    score += 1;
    analysis.reasons.push(`コール売り${nearestCall.strike.toLocaleString()}円に接近中（${distanceToCall}円）`);
  }
  
  // プット売り集中価格との距離
  const nearestPut = optionData.putConcentration[0]; // 53,000円
  const distanceToPut = currentPrice - nearestPut.strike;
  
  if (distanceToPut > 0 && distanceToPut < 300) {
    // プット売り集中に接近 → 下抜け警戒
    score -= 2;
    analysis.warnings.push(`プット売り${nearestPut.strike.toLocaleString()}円まで${distanceToPut}円 → 下抜け警戒`);
  } else if (distanceToPut > 0 && distanceToPut < 500) {
    score -= 1;
    analysis.warnings.push(`プット売り${nearestPut.strike.toLocaleString()}円に接近中（${distanceToPut}円）`);
  }

  switch (slotType) {
    case 'A':
      const gapFromClose = market.cme - market.futures;
      analysis.expectedRange = { 
        high: market.futuresNight + Math.round(technical.atr14 * 0.5), 
        low: market.futuresNight - Math.round(technical.atr14 * 0.5) 
      };
      analysis.stopLoss = technical.atr14 > 400 ? 400 : 300;
      
      // 判定ロジック
      if (gapFromClose < -200) {
        score -= 2;
        analysis.reasons.push(`CME ${market.cme.toLocaleString()}円（大証比${gapFromClose}円）→ ギャップダウン`);
      } else if (gapFromClose > 200) {
        score += 2;
        analysis.reasons.push(`CME ${market.cme.toLocaleString()}円（大証比+${gapFromClose}円）→ ギャップアップ`);
      } else {
        analysis.reasons.push(`CME ${market.cme.toLocaleString()}円（乖離${gapFromClose}円）→ 小幅`);
      }
      
      if (foreignNetScore >= 5) {
        score += 2;
        analysis.reasons.push(`外資建玉：買い優勢（野村+14,018、JPM+9,653）`);
      } else if (foreignNetScore <= -3) {
        score -= 2;
        analysis.reasons.push(`外資建玉：売り優勢`);
      } else {
        analysis.reasons.push(`外資建玉：中立（スコア${foreignNetScore}）`);
      }
      
      if (technical.rsi14 > 70) {
        score -= 1;
        analysis.warnings.push(`RSI ${technical.rsi14.toFixed(1)}：買われすぎ圏`);
      } else if (technical.rsi14 < 30) {
        score += 1;
        analysis.reasons.push(`RSI ${technical.rsi14.toFixed(1)}：売られすぎ圏`);
      }
      
      if (technical.macd > 0) {
        score += 1;
        analysis.reasons.push(`MACD +${technical.macd.toFixed(0)}：買いシグナル`);
      } else {
        score -= 1;
        analysis.reasons.push(`MACD ${technical.macd.toFixed(0)}：売りシグナル`);
      }
      
      if (market.vix < 18) {
        score += 1;
        analysis.reasons.push(`VIX ${market.vix}：低ボラ環境`);
      } else if (market.vix > 25) {
        score -= 1;
        analysis.warnings.push(`VIX ${market.vix}：高ボラ注意`);
      }
      
      analysis.warnings.push(`日銀ETF売却報道 → 需給悪化懸念`);
      analysis.warnings.push(`中国GDP発表（09:30）→ 急変動リスク`);
      break;

    case 'B':
      analysis.stopLoss = 300;
      const morningDirection = market.nikkei225 > (market.nikkeiHigh + market.nikkeiLow) / 2 ? 'up' : 'down';
      
      if (morningDirection === 'up') {
        score += 2;
        analysis.reasons.push(`前場：上昇方向で推移`);
      } else {
        score -= 2;
        analysis.reasons.push(`前場：下落方向で推移`);
      }
      
      if (market.nikkeiChange > 0) {
        score += 1;
        analysis.reasons.push(`日経：+${market.nikkeiChange.toFixed(0)}円`);
      } else {
        score -= 1;
        analysis.reasons.push(`日経：${market.nikkeiChange.toFixed(0)}円`);
      }
      
      analysis.expectedRange = { high: market.futuresNight + 200, low: market.futuresNight - 200 };
      break;

    case 'C':
      analysis.stopLoss = 350;
      
      if (market.nikkeiChange > 100) {
        score += 1;
        analysis.reasons.push(`日中：+${market.nikkeiChange.toFixed(0)}円で引け`);
      } else if (market.nikkeiChange < -100) {
        score -= 1;
        analysis.reasons.push(`日中：${market.nikkeiChange.toFixed(0)}円で引け`);
      }
      
      if (market.usdjpy > 157) {
        score += 1;
        analysis.reasons.push(`円安継続（${market.usdjpy}円）`);
      } else if (market.usdjpy < 150) {
        score -= 1;
        analysis.reasons.push(`円高進行（${market.usdjpy}円）`);
      }
      
      analysis.expectedRange = { high: market.futuresNight + 300, low: market.futuresNight - 300 };
      break;

    case 'D':
      analysis.stopLoss = 450;
      
      if (market.nyDowChange > 0) {
        score += 1;
        analysis.reasons.push(`NYダウ：+${market.nyDowChange.toFixed(0)}`);
      } else {
        score -= 1;
        analysis.reasons.push(`NYダウ：${market.nyDowChange.toFixed(0)}`);
      }
      
      if (market.vix < 18) {
        score += 1;
        analysis.reasons.push(`低VIX環境`);
      } else if (market.vix > 25) {
        score -= 1;
        analysis.warnings.push(`高VIX注意`);
      }
      
      if (foreignNetScore >= 5) {
        score += 1;
        analysis.reasons.push(`外資買い越し → 下値サポート`);
      }
      
      analysis.expectedRange = { high: market.futuresNight + 400, low: market.futuresNight - 400 };
      analysis.warnings.push(`米小売売上高（21:00）`);
      break;
  }

  // 見送りなし：必ず買いか売りを決定
  analysis.direction = score >= 0 ? 'long' : 'short';
  analysis.confidence = Math.min(90, Math.max(35, 50 + Math.abs(score) * 8));
  
  if (analysis.direction === 'long') {
    analysis.entryPrice = market.cme;
    analysis.targetPrice = technical.pivotR1;
  } else {
    analysis.entryPrice = market.cme;
    analysis.targetPrice = technical.pivotS1;
  }
  
  analysis.reasons.push(`判定スコア: ${score >= 0 ? '+' : ''}${score} → ${analysis.direction === 'long' ? '買い' : '売り'}`);

  return analysis;
};

// メインコンポーネント
export default function Nikkei225SystemTrading() {
  const [activeTab, setActiveTab] = useState('slots');
  const [data, setData] = useState(realMarketData);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedSlot, setExpandedSlot] = useState('A');
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(realMarketData.market.updateTime);
  
  // 実績データ（persistent storage）
  const [tradeRecords, setTradeRecords] = useState([]);
  
  // B+C連動: 進行中のトレード（エントリー済み・決済待ち）
  const [pendingTrade, setPendingTrade] = useState(null);
  
  // 新規トレード入力
  const [newTrade, setNewTrade] = useState({
    date: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
    slot: 'A',
    direction: 'long',
    entry: '',
    pnl: '', // 損益（マイナス可）
  });

  // 永続ストレージから読み込み（localStorage版）
  useEffect(() => {
    const loadRecords = () => {
      try {
        const stored = localStorage.getItem('nikkei-trade-records');
        if (stored) {
          setTradeRecords(JSON.parse(stored));
        } else {
          // 初期サンプルデータ
          setTradeRecords([
            { id: 1, date: '2026/01/13', slot: 'A', direction: 'long', entry: 52800, exit: 53200, pnl: +400, result: 'win' },
            { id: 2, date: '2026/01/13', slot: 'D', direction: 'long', entry: 53100, exit: 53450, pnl: +350, result: 'win' },
            { id: 3, date: '2026/01/14', slot: 'A', direction: 'long', entry: 53550, exit: 53850, pnl: +300, result: 'win' },
            { id: 4, date: '2026/01/14', slot: 'B', direction: 'long', entry: 53900, exit: 53650, pnl: -250, result: 'lose' },
            { id: 5, date: '2026/01/15', slot: 'A', direction: 'short', entry: 54100, exit: 53850, pnl: +250, result: 'win' },
            { id: 6, date: '2026/01/15', slot: 'D', direction: 'long', entry: 53900, exit: 53600, pnl: -300, result: 'lose' },
            { id: 7, date: '2026/01/16', slot: 'A', direction: 'short', entry: 54050, exit: 53750, pnl: +300, result: 'win' },
          ]);
        }
      } catch (error) {
        console.log('Storage error, starting fresh');
      }
      
      // pending tradeも読み込み
      try {
        const pending = localStorage.getItem('nikkei-pending-trade');
        if (pending) {
          setPendingTrade(JSON.parse(pending));
        }
      } catch (error) {
        console.log('No pending trade');
      }
      
      setIsLoading(false);
    };
    loadRecords();
  }, []);

  // 永続ストレージに保存（localStorage版）
  useEffect(() => {
    if (!isLoading && tradeRecords.length > 0) {
      try {
        localStorage.setItem('nikkei-trade-records', JSON.stringify(tradeRecords));
      } catch (error) {
        console.error('Failed to save records:', error);
      }
    }
  }, [tradeRecords, isLoading]);

  // pending tradeの保存（localStorage版）
  useEffect(() => {
    if (!isLoading) {
      try {
        if (pendingTrade) {
          localStorage.setItem('nikkei-pending-trade', JSON.stringify(pendingTrade));
        } else {
          localStorage.removeItem('nikkei-pending-trade');
        }
      } catch (error) {
        console.error('Failed to save pending trade:', error);
      }
    }
  }, [pendingTrade, isLoading]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fireAnalysis = calculateDetailedFireAnalysis(data);
  
  const slots = {
    A: calculateSlotAnalysis(data, 'A'),
    B: calculateSlotAnalysis(data, 'B'),
    C: calculateSlotAnalysis(data, 'C'),
    D: calculateSlotAnalysis(data, 'D'),
  };

  const slotMeta = {
    A: { name: '寄り付き', icon: Sunrise, judge: '07:00〜07:35', trade: '08:45〜11:30', color: '#f97316' },
    B: { name: '後場', icon: Sun, judge: '12:00〜12:20', trade: '12:30〜15:45', color: '#eab308' },
    C: { name: '夕方', icon: Sunset, judge: '15:55〜16:45', trade: '17:00〜20:00', color: '#8b5cf6' },
    D: { name: 'ナイト', icon: Moon, judge: '20:30', trade: '21:00〜06:00', color: '#3b82f6' },
  };

  // 実績計算
  const calculateStats = () => {
    const total = tradeRecords.length;
    const wins = tradeRecords.filter(r => r.result === 'win').length;
    const totalPnl = tradeRecords.reduce((sum, r) => sum + r.pnl, 0);
    const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
    
    const bySlot = {};
    ['A', 'B', 'C', 'D'].forEach(slot => {
      const slotRecords = tradeRecords.filter(r => r.slot === slot);
      const slotWins = slotRecords.filter(r => r.result === 'win').length;
      bySlot[slot] = {
        total: slotRecords.length,
        wins: slotWins,
        pnl: slotRecords.reduce((sum, r) => sum + r.pnl, 0),
        winRate: slotRecords.length > 0 ? ((slotWins / slotRecords.length) * 100).toFixed(0) : 0,
      };
    });
    
    return { total, wins, totalPnl, winRate, bySlot };
  };
  
  const stats = calculateStats();

  // トレード追加
  const addTrade = () => {
    if (!newTrade.entry || newTrade.pnl === '') return;
    
    const entry = parseInt(newTrade.entry);
    const pnl = parseInt(newTrade.pnl);
    
    // 決済価格を自動計算
    const exit = newTrade.direction === 'long' 
      ? entry + pnl 
      : entry - pnl;
    
    const record = {
      id: Date.now(),
      date: newTrade.date,
      slot: newTrade.slot,
      direction: newTrade.direction,
      entry,
      exit,
      pnl,
      result: pnl > 0 ? 'win' : 'lose',
    };
    
    setTradeRecords([...tradeRecords, record]);
    setNewTrade({ ...newTrade, entry: '', pnl: '' });
  };

  // トレード削除
  const deleteTrade = (id) => {
    setTradeRecords(tradeRecords.filter(r => r.id !== id));
  };

  // ===== B+C連動: ワンタップ機能 =====
  
  // 判定に基づいてエントリー（現在価格で）
  const quickEntry = (slot, direction) => {
    const entryPrice = data.market.futuresNight; // 最新の先物価格
    setPendingTrade({
      id: Date.now(),
      date: new Date().toLocaleDateString('ja-JP').replace(/\//g, '/'),
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      slot,
      direction,
      entry: entryPrice,
    });
  };

  // 決済（損益入力）
  const quickExit = (pnlAmount) => {
    if (!pendingTrade) return;
    
    const exit = pendingTrade.direction === 'long' 
      ? pendingTrade.entry + pnlAmount 
      : pendingTrade.entry - pnlAmount;
    
    const record = {
      id: pendingTrade.id,
      date: pendingTrade.date,
      slot: pendingTrade.slot,
      direction: pendingTrade.direction,
      entry: pendingTrade.entry,
      exit,
      pnl: pnlAmount,
      result: pnlAmount > 0 ? 'win' : 'lose',
    };
    
    setTradeRecords([...tradeRecords, record]);
    setPendingTrade(null);
  };

  // 決済（価格入力）
  const quickExitByPrice = (exitPrice) => {
    if (!pendingTrade || !exitPrice) return;
    
    const pnl = pendingTrade.direction === 'long' 
      ? exitPrice - pendingTrade.entry 
      : pendingTrade.entry - exitPrice;
    
    const record = {
      id: pendingTrade.id,
      date: pendingTrade.date,
      slot: pendingTrade.slot,
      direction: pendingTrade.direction,
      entry: pendingTrade.entry,
      exit: exitPrice,
      pnl,
      result: pnl > 0 ? 'win' : 'lose',
    };
    
    setTradeRecords([...tradeRecords, record]);
    setPendingTrade(null);
  };

  // キャンセル
  const cancelPending = () => {
    setPendingTrade(null);
  };

  // ===== 最新データ取得（APIルート経由） =====
  const fetchLatestData = async () => {
    setIsFetchingData(true);
    
    try {
      const response = await fetch('/api/fetch-market', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        const parsed = result.data;
        
        // データを更新
        setData(prevData => ({
          ...prevData,
          market: {
            ...prevData.market,
            futuresNight: parsed.futuresNight || prevData.market.futuresNight,
            cme: parsed.cme || prevData.market.cme,
            usdjpy: parsed.usdjpy || prevData.market.usdjpy,
            vix: parsed.vix || prevData.market.vix,
            nikkei225: parsed.nikkei225 || prevData.market.nikkei225,
            updateTime: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
          }
        }));
        
        setLastUpdated(new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
      } else {
        alert('データの取得に失敗しました');
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
      alert('データ取得に失敗しました。しばらくしてから再試行してください。');
    } finally {
      setIsFetchingData(false);
    }
  };

  // ===== 外資手口・オプションデータ取得（20時更新用） =====
  const [isFetchingInstitutional, setIsFetchingInstitutional] = useState(false);
  const [institutionalUpdated, setInstitutionalUpdated] = useState('--:--');

  // ===== 今週のイベント =====
  const [isFetchingNews, setIsFetchingNews] = useState(false);
  const now = new Date();
  const todayStr = `${now.getMonth() + 1}/${now.getDate()}`; // 動的に今日の日付
  
  const [weeklyEvents, setWeeklyEvents] = useState([
    {
      date: '1/17',
      day: '金',
      events: [
        { time: '08:45', text: '日経225先物 寄り付き', importance: 'high', flag: '🇯🇵' },
        { time: '23:15', text: '米12月鉱工業生産', importance: 'medium', flag: '🇺🇸' },
        { time: '24:00', text: '米1月NAHB住宅市場指数', importance: 'low', flag: '🇺🇸' },
      ]
    },
    {
      date: '1/20',
      day: '月',
      events: [
        { time: '08:50', text: '11月機械受注', importance: 'medium', flag: '🇯🇵' },
        { time: '11:00', text: '中国10-12月期GDP ⚡', importance: 'high', flag: '🇨🇳' },
        { time: '11:00', text: '中国12月鉱工業生産・小売売上高', importance: 'high', flag: '🇨🇳' },
        { time: null, text: 'ダボス会議（〜1/24）', importance: 'medium', flag: '🌍' },
        { time: '18:30', text: 'IMF世界経済見通し発表', importance: 'high', flag: '🌍' },
        { time: null, text: '🔴 米休場（キング牧師誕生日）→ 薄商い注意', importance: 'high', flag: '🇺🇸' },
        { time: null, text: 'トランプ大統領就任式', importance: 'high', flag: '🇺🇸' },
      ]
    },
    {
      date: '1/21',
      day: '火',
      events: [
        { time: null, text: '柏崎刈羽原発6号機 再稼働', importance: 'low', flag: '🇯🇵' },
        { time: '19:00', text: '独1月ZEW景況感指数', importance: 'medium', flag: '🇩🇪' },
        { time: null, text: 'トランプ政権 政策発表に注目', importance: 'high', flag: '⚠️' },
      ]
    },
    {
      date: '1/22',
      day: '水',
      events: [
        { time: null, text: '🔴 日銀金融政策決定会合（〜1/23）', importance: 'high', flag: '🇯🇵' },
        { time: '08:50', text: '12月貿易統計', importance: 'medium', flag: '🇯🇵' },
        { time: '22:30', text: '米12月住宅着工件数', importance: 'medium', flag: '🇺🇸' },
      ]
    },
    {
      date: '1/23',
      day: '木',
      events: [
        { time: '08:30', text: '12月全国CPI ⚡', importance: 'high', flag: '🇯🇵' },
        { time: '12:00頃', text: '🔴 日銀金融政策発表 → 利上げ観測', importance: 'high', flag: '🇯🇵' },
        { time: '15:30', text: '🔴 植田日銀総裁 記者会見', importance: 'high', flag: '🇯🇵' },
        { time: null, text: '通常国会召集（冒頭解散の可能性）', importance: 'high', flag: '⚠️' },
        { time: '22:30', text: '米新規失業保険申請件数', importance: 'medium', flag: '🇺🇸' },
      ]
    },
    {
      date: '1/24',
      day: '金',
      events: [
        { time: '23:45', text: '米1月製造業PMI', importance: 'medium', flag: '🇺🇸' },
        { time: '23:45', text: '米1月サービス業PMI', importance: 'medium', flag: '🇺🇸' },
        { time: '24:00', text: '米12月中古住宅販売件数', importance: 'low', flag: '🇺🇸' },
      ]
    },
  ]);

  // ニュース取得関数（APIルート経由）
  const fetchNewsData = async () => {
    setIsFetchingNews(true);
    
    try {
      const response = await fetch('/api/fetch-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        setWeeklyEvents(result.data);
      }
    } catch (error) {
      console.error('ニュース取得エラー:', error);
    } finally {
      setIsFetchingNews(false);
    }
  };

  // 外資手口取得関数（APIルート経由）
  const fetchInstitutionalData = async () => {
    setIsFetchingInstitutional(true);
    
    try {
      const response = await fetch('/api/fetch-institutional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        const parsed = result.data;
        
        // 外資データを更新
        if (parsed.foreignDaily) {
          setData(prevData => {
            const newForeignDaily = { ...prevData.foreignDaily };
            
            Object.keys(parsed.foreignDaily).forEach(key => {
              if (newForeignDaily[key]) {
                newForeignDaily[key] = {
                  ...newForeignDaily[key],
                  weeklyOI: parsed.foreignDaily[key].weeklyOI ?? newForeignDaily[key].weeklyOI,
                  todayVol: parsed.foreignDaily[key].todayVol ?? newForeignDaily[key].todayVol,
                  callSell: parsed.foreignDaily[key].callSell ?? newForeignDaily[key].callSell,
                  putSell: parsed.foreignDaily[key].putSell ?? newForeignDaily[key].putSell,
                  comment: parsed.foreignDaily[key].comment ?? newForeignDaily[key].comment,
                  // スタンス再計算
                  stance: parsed.foreignDaily[key].weeklyOI > 5000 ? '買い' :
                          parsed.foreignDaily[key].weeklyOI > 0 ? 'やや買い' :
                          parsed.foreignDaily[key].weeklyOI > -5000 ? 'やや売り' : '売り',
                  stanceScore: parsed.foreignDaily[key].weeklyOI > 10000 ? 3 :
                               parsed.foreignDaily[key].weeklyOI > 5000 ? 2 :
                               parsed.foreignDaily[key].weeklyOI > 0 ? 1 :
                               parsed.foreignDaily[key].weeklyOI > -5000 ? -1 :
                               parsed.foreignDaily[key].weeklyOI > -10000 ? -2 : -3,
                };
              }
            });
            
            return {
              ...prevData,
              foreignDaily: newForeignDaily,
              optionData: parsed.optionData ? {
                ...prevData.optionData,
                callConcentration: parsed.optionData.callConcentration || prevData.optionData.callConcentration,
                putConcentration: parsed.optionData.putConcentration || prevData.optionData.putConcentration,
                atmIV: parsed.optionData.atmIV || prevData.optionData.atmIV,
              } : prevData.optionData,
            };
          });
        }
        
        setInstitutionalUpdated(new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (error) {
      console.error('外資データ取得エラー:', error);
      alert('外資データ取得に失敗しました。しばらくしてから再試行してください。');
    } finally {
      setIsFetchingInstitutional(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0f1a 0%, #111827 100%)',
      color: '#e2e8f0',
      fontFamily: "'Noto Sans JP', -apple-system, sans-serif",
      padding: '8px',
      maxWidth: '100vw',
      overflowX: 'hidden',
    }}>
      {/* ヘッダー */}
      <header style={{
        textAlign: 'center',
        marginBottom: '10px',
        padding: '10px 8px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.1))',
        borderRadius: '12px',
        border: '1px solid rgba(59, 130, 246, 0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <h1 style={{
            fontSize: '13px',
            fontWeight: '800',
            background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            🎯 日経225先物ミニ システムトレード
          </h1>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#60a5fa', fontFamily: 'monospace' }}>
            {currentTime.toLocaleTimeString('ja-JP')}
          </div>
        </div>
        
        {/* 市況 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', fontSize: '10px' }}>
          {[
            { label: '日経225', value: data.market.nikkei225.toLocaleString(), change: data.market.nikkeiChange },
            { label: '225先物', value: data.market.futuresNight.toLocaleString(), change: data.market.futuresChange },
            { label: 'CME', value: data.market.cme.toLocaleString(), change: null },
            { label: 'ドル円', value: data.market.usdjpy.toFixed(2), change: null },
            { label: 'VIX', value: data.market.vix.toFixed(1), change: null },
          ].map((item, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div style={{ color: '#64748b', fontSize: '8px' }}>{item.label}</div>
              <div style={{ fontWeight: '700' }}>{item.value}</div>
              {item.change !== null && (
                <div style={{ color: item.change >= 0 ? '#22c55e' : '#ef4444', fontSize: '8px' }}>
                  {item.change >= 0 ? '+' : ''}{item.change}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* 最新データ取得ボタン */}
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <button
            onClick={fetchLatestData}
            disabled={isFetchingData}
            style={{
              padding: '6px 12px',
              background: isFetchingData 
                ? 'rgba(100, 116, 139, 0.3)' 
                : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontWeight: '600',
              fontSize: '10px',
              cursor: isFetchingData ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {isFetchingData ? (
              <>⏳ 取得中...</>
            ) : (
              <>🔄 最新データ取得</>
            )}
          </button>
          <span style={{ fontSize: '8px', color: '#64748b' }}>
            更新: {lastUpdated}
          </span>
        </div>
      </header>

      {/* タブ */}
      <div style={{
        display: 'flex',
        gap: '2px',
        marginBottom: '10px',
        background: 'rgba(30, 41, 59, 0.5)',
        padding: '3px',
        borderRadius: '8px',
        overflowX: 'auto',
      }}>
        {[
          { id: 'slots', label: '⏰ スロット' },
          { id: 'fire', label: '🔥 踏み上げ' },
          { id: 'traders', label: '🏦 各社' },
          { id: 'record', label: '📈 実績' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              minWidth: '70px',
              padding: '7px 4px',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: activeTab === tab.id ? 'white' : '#94a3b8',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '10px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== 4スロットタブ ===== */}
      {activeTab === 'slots' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* スロット概要 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
            {Object.entries(slots).map(([key, slot]) => {
              const meta = slotMeta[key];
              const Icon = meta.icon;
              return (
                <div
                  key={key}
                  onClick={() => setExpandedSlot(key)}
                  style={{
                    padding: '8px 4px',
                    background: expandedSlot === key ? `${meta.color}20` : 'rgba(30, 41, 59, 0.8)',
                    borderRadius: '8px',
                    border: `2px solid ${expandedSlot === key ? meta.color : 'transparent'}`,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <Icon size={14} color={meta.color} />
                  <div style={{ fontSize: '9px', fontWeight: '600', marginTop: '2px' }}>{meta.name}</div>
                  <div style={{
                    marginTop: '4px',
                    padding: '2px 4px',
                    background: slot.direction === 'long' ? '#22c55e30' : '#ef444430',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '700',
                    color: slot.direction === 'long' ? '#22c55e' : '#ef4444',
                  }}>
                    {slot.direction === 'long' ? '買い' : '売り'}
                  </div>
                  <div style={{ fontSize: '8px', color: '#64748b', marginTop: '2px' }}>{slot.confidence}%</div>
                </div>
              );
            })}
          </div>

          {/* 選択スロット詳細 */}
          {expandedSlot && (
            <div style={{
              background: 'rgba(30, 41, 59, 0.9)',
              padding: '12px',
              borderRadius: '10px',
              border: `2px solid ${slotMeta[expandedSlot].color}60`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700' }}>
                    スロット{expandedSlot}：{slotMeta[expandedSlot].name}
                  </div>
                  <div style={{ fontSize: '9px', color: '#64748b' }}>
                    判定 {slotMeta[expandedSlot].judge} ｜ 運用 {slotMeta[expandedSlot].trade}
                  </div>
                </div>
                <div style={{
                  padding: '6px 14px',
                  background: slots[expandedSlot].direction === 'long' ? '#22c55e' : '#ef4444',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '14px',
                }}>
                  {slots[expandedSlot].direction === 'long' ? '買い' : '売り'}
                </div>
              </div>

              {/* ワンタップエントリーボタン */}
              {!pendingTrade ? (
                <button
                  onClick={() => quickEntry(expandedSlot, slots[expandedSlot].direction)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '10px',
                    background: slots[expandedSlot].direction === 'long' 
                      ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Play size={14} />
                  この判定でエントリー（{data.market.futuresNight.toLocaleString()}円）
                </button>
              ) : (
                <div style={{
                  padding: '8px',
                  marginBottom: '10px',
                  background: 'rgba(234, 179, 8, 0.2)',
                  border: '1px solid rgba(234, 179, 8, 0.5)',
                  borderRadius: '8px',
                  fontSize: '10px',
                  color: '#eab308',
                  textAlign: 'center',
                }}>
                  ⏳ ポジション保有中（{pendingTrade.slot} {pendingTrade.direction === 'long' ? '買い' : '売り'} @ {pendingTrade.entry.toLocaleString()}）
                  → 実績タブで決済
                </div>
              )}

              {/* 数値 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '8px', color: '#64748b' }}>確信度</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: slotMeta[expandedSlot].color }}>
                    {slots[expandedSlot].confidence}%
                  </div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '8px', color: '#64748b' }}>逆指値</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444' }}>
                    {slots[expandedSlot].stopLoss}円
                  </div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '8px', color: '#64748b' }}>想定レンジ</div>
                  <div style={{ fontSize: '10px', fontWeight: '600' }}>
                    <span style={{ color: '#22c55e' }}>{slots[expandedSlot].expectedRange.high.toLocaleString()}</span>
                    <span style={{ color: '#64748b' }}> 〜 </span>
                    <span style={{ color: '#ef4444' }}>{slots[expandedSlot].expectedRange.low.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 判定根拠 */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px', borderRadius: '6px', marginBottom: '6px' }}>
                <div style={{ fontSize: '9px', fontWeight: '600', color: '#60a5fa', marginBottom: '4px' }}>
                  📊 判定根拠
                </div>
                {slots[expandedSlot].reasons.map((r, i) => (
                  <div key={i} style={{ fontSize: '9px', color: '#94a3b8', padding: '1px 0', borderLeft: '2px solid #3b82f6', paddingLeft: '6px', marginBottom: '2px' }}>
                    {r}
                  </div>
                ))}
              </div>

              {/* 警戒 */}
              {slots[expandedSlot].warnings.length > 0 && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '6px', border: '1px solid #ef444440' }}>
                  <div style={{ fontSize: '9px', fontWeight: '600', color: '#ef4444', marginBottom: '4px' }}>⚠️ 警戒</div>
                  {slots[expandedSlot].warnings.map((w, i) => (
                    <div key={i} style={{ fontSize: '9px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={8} /> {w}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 今週の主なニュース・イベント */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.9)',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            marginTop: '8px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#60a5fa' }}>
                📅 今週の主なイベント
              </div>
              <button
                onClick={fetchNewsData}
                disabled={isFetchingNews}
                style={{
                  padding: '4px 8px',
                  background: isFetchingNews ? 'rgba(100, 116, 139, 0.3)' : 'rgba(59, 130, 246, 0.3)',
                  border: '1px solid rgba(59, 130, 246, 0.5)',
                  borderRadius: '4px',
                  color: '#60a5fa',
                  fontSize: '8px',
                  cursor: isFetchingNews ? 'not-allowed' : 'pointer',
                }}
              >
                {isFetchingNews ? '⏳' : '🔄 更新'}
              </button>
            </div>
            
            {weeklyEvents.map((dayEvents, dayIdx) => {
              const isToday = dayEvents.date === todayStr;
              return (
                <div key={dayIdx} style={{
                  marginBottom: '8px',
                  padding: isToday ? '8px' : '6px',
                  background: isToday ? 'rgba(234, 179, 8, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '6px',
                  border: isToday ? '2px solid rgba(234, 179, 8, 0.5)' : '1px solid transparent',
                }}>
                  <div style={{ 
                    fontSize: isToday ? '11px' : '10px', 
                    fontWeight: '700', 
                    color: isToday ? '#eab308' : '#94a3b8',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    {isToday && <span>⭐</span>}
                    {dayEvents.date}（{dayEvents.day}）
                    {isToday && <span style={{ fontSize: '9px', background: '#eab308', color: '#000', padding: '1px 4px', borderRadius: '3px' }}>TODAY</span>}
                  </div>
                  {dayEvents.events.map((event, eventIdx) => (
                    <div key={eventIdx} style={{
                      fontSize: '9px',
                      color: isToday ? '#fef3c7' : '#64748b',
                      padding: '2px 0',
                      paddingLeft: '8px',
                      borderLeft: `2px solid ${event.importance === 'high' ? '#ef4444' : event.importance === 'medium' ? '#eab308' : '#3b82f6'}`,
                      marginBottom: '2px',
                    }}>
                      {event.flag && <span style={{ marginRight: '4px' }}>{event.flag}</span>}
                      {event.time && <span style={{ color: isToday ? '#fcd34d' : '#94a3b8' }}>[{event.time}] </span>}
                      {event.text}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== 踏み上げ発火判定タブ（11項目完全版） ===== */}
      {activeTab === 'fire' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* 外資手口更新ボタン */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px',
            background: 'rgba(234, 179, 8, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(234, 179, 8, 0.3)',
          }}>
            <button
              onClick={fetchInstitutionalData}
              disabled={isFetchingInstitutional}
              style={{
                padding: '6px 12px',
                background: isFetchingInstitutional 
                  ? 'rgba(100, 116, 139, 0.3)' 
                  : 'linear-gradient(135deg, #eab308, #f97316)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontWeight: '600',
                fontSize: '10px',
                cursor: isFetchingInstitutional ? 'not-allowed' : 'pointer',
              }}
            >
              {isFetchingInstitutional ? '⏳ 取得中...' : '🏦 外資手口を更新（20時）'}
            </button>
            <span style={{ fontSize: '8px', color: '#eab308' }}>
              更新: {institutionalUpdated}
            </span>
          </div>
          
          {/* 総合スコア */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.9)',
            padding: '12px',
            borderRadius: '12px',
            border: `2px solid ${fireAnalysis.fireColor}60`,
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <Flame size={20} color={fireAnalysis.fireColor} />
              <span style={{ fontSize: '14px', fontWeight: '700' }}>踏み上げ発火判定</span>
            </div>
            <div style={{ fontSize: '40px', fontWeight: '800', color: fireAnalysis.fireColor }}>
              {fireAnalysis.totalScore}
            </div>
            <div style={{ color: '#64748b', fontSize: '10px' }}>/ {fireAnalysis.maxScore}点</div>
            <div style={{
              marginTop: '8px',
              padding: '4px 12px',
              background: `${fireAnalysis.fireColor}30`,
              borderRadius: '16px',
              display: 'inline-block',
              color: fireAnalysis.fireColor,
              fontWeight: '700',
              fontSize: '12px',
            }}>
              {fireAnalysis.fireLevel}
            </div>
            <div style={{ marginTop: '6px', fontSize: '9px', color: '#64748b' }}>
              0〜6:静穏 / 7〜12:弱点形成 / 13〜18:準備 / 19〜23:寸前 / 24〜30:★発火★
            </div>
          </div>

          {/* 6項目スコア */}
          {[
            { key: 'foreign', label: '1. 外資手口', max: 5 },
            { key: 'iv', label: '2. IV分析', max: 5 },
            { key: 'board', label: '3. 板情報', max: 5 },
            { key: 'terrain', label: '4. 価格地形', max: 5 },
            { key: 'external', label: '5. 外部環境', max: 5 },
            { key: 'night', label: '6. 夜間静けさ', max: 2 },
          ].map((item) => {
            const scoreData = fireAnalysis.scores[item.key];
            const pct = (scoreData.score / item.max) * 100;
            return (
              <div key={item.key} style={{
                background: 'rgba(30, 41, 59, 0.8)',
                padding: '10px',
                borderRadius: '8px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: pct > 60 ? '#ef4444' : pct > 30 ? '#eab308' : '#22c55e' }}>
                    {scoreData.score}/{item.max}
                  </span>
                </div>
                <div style={{ height: '4px', background: '#1e293b', borderRadius: '2px', marginBottom: '6px' }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: pct > 60 ? '#ef4444' : pct > 30 ? '#eab308' : '#22c55e',
                    borderRadius: '2px',
                  }} />
                </div>
                <div style={{ fontSize: '8px', color: '#64748b' }}>
                  {scoreData.details.join(' / ')}
                </div>
              </div>
            );
          })}

          {/* 7. コール売り危険度 */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600' }}>7. コール売り危険度</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: fireAnalysis.callDanger.score >= 4 ? '#ef4444' : fireAnalysis.callDanger.score >= 2 ? '#eab308' : '#22c55e' }}>
                {fireAnalysis.callDanger.score}/5
              </span>
            </div>
            <div style={{ fontSize: '8px', marginBottom: '6px' }}>
              {fireAnalysis.callDanger.checks.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: c.value ? '#eab308' : '#475569', padding: '1px 0' }}>
                  <span>□ {c.item}</span>
                  <span>{c.value}/1</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '9px' }}>
              <span style={{ color: '#64748b' }}>ロール判定:</span>
              <span style={{ color: fireAnalysis.callDanger.rollAction === '全量ロール' ? '#ef4444' : fireAnalysis.callDanger.rollAction === '半分ロール' ? '#eab308' : '#22c55e', fontWeight: '600' }}>
                {fireAnalysis.callDanger.rollAction}
              </span>
              <span style={{ color: '#64748b' }}>→ {fireAnalysis.callDanger.rollTarget}</span>
            </div>
          </div>

          {/* 8. 先物ヘッジ */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600' }}>8. 先物ヘッジ判定</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#60a5fa' }}>
                {fireAnalysis.hedge.score}/6
              </span>
            </div>
            <div style={{ fontSize: '8px', color: '#64748b', marginBottom: '4px' }}>
              {fireAnalysis.hedge.details.join(' / ')}
            </div>
            <div style={{ fontSize: '9px' }}>
              <span style={{ color: '#64748b' }}>最適ヘッジ:</span>
              <span style={{ color: '#60a5fa', fontWeight: '600', marginLeft: '4px' }}>mini {fireAnalysis.hedge.hedgeRatio}</span>
            </div>
          </div>

          {/* 10. 最終アクション */}
          <div style={{
            background: `linear-gradient(135deg, ${fireAnalysis.fireColor}15, ${fireAnalysis.fireColor}05)`,
            padding: '12px',
            borderRadius: '10px',
            border: `2px solid ${fireAnalysis.fireColor}`,
          }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: fireAnalysis.fireColor, marginBottom: '8px', textAlign: 'center' }}>
              📌 今日の最終アクション
            </div>
            <div style={{ fontSize: '10px', lineHeight: 1.7 }}>
              <p><strong>■ ロール:</strong> {fireAnalysis.finalAction.roll}（→ {fireAnalysis.finalAction.rollTarget}）</p>
              <p><strong>■ ヘッジ:</strong> {fireAnalysis.finalAction.hedge}</p>
              <p><strong>■ プット:</strong> {fireAnalysis.finalAction.put}</p>
              <p><strong>■ 戦略:</strong> {fireAnalysis.finalAction.strategy}</p>
            </div>
          </div>

          {/* 11. 地形変化メモ */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(234, 179, 8, 0.3)',
          }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#eab308', marginBottom: '6px' }}>
              11. 地形変化メモ
            </div>
            <div style={{ fontSize: '9px', color: '#94a3b8', lineHeight: 1.6 }}>
              <p><strong>外資の癖:</strong> {fireAnalysis.terrainMemo.foreignPattern}</p>
              <p><strong>IVカーブ:</strong> {fireAnalysis.terrainMemo.ivCurve}</p>
              <p><strong>真空地帯:</strong> {fireAnalysis.terrainMemo.vacuumMove}</p>
              <p><strong>踏み上げ兆候:</strong> {fireAnalysis.terrainMemo.squeezeSign}</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== 各社タブ ===== */}
      {activeTab === 'traders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          
          {/* 外資手口更新ボタン */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px',
            background: 'rgba(234, 179, 8, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(234, 179, 8, 0.3)',
          }}>
            <span style={{ fontSize: '9px', color: '#94a3b8' }}>📊 週次建玉 + オプション手口</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={fetchInstitutionalData}
                disabled={isFetchingInstitutional}
                style={{
                  padding: '5px 10px',
                  background: isFetchingInstitutional 
                    ? 'rgba(100, 116, 139, 0.3)' 
                    : 'linear-gradient(135deg, #eab308, #f97316)',
                  border: 'none',
                  borderRadius: '5px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '9px',
                  cursor: isFetchingInstitutional ? 'not-allowed' : 'pointer',
                }}
              >
                {isFetchingInstitutional ? '⏳' : '🔄 更新'}
              </button>
              <span style={{ fontSize: '8px', color: '#eab308' }}>{institutionalUpdated}</span>
            </div>
          </div>
          
          {Object.entries(data.foreignDaily).map(([key, trader]) => (
            <div key={key} style={{
              background: 'rgba(30, 41, 59, 0.8)',
              padding: '10px',
              borderRadius: '8px',
              border: `1px solid ${trader.color}40`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={12} color={trader.color} />
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '600' }}>{trader.name}</div>
                    <div style={{ fontSize: '8px', color: trader.color }}>{trader.stance}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: trader.weeklyOI >= 0 ? '#22c55e' : '#ef4444' }}>
                    建玉: {trader.weeklyOI >= 0 ? '+' : ''}{trader.weeklyOI.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '8px', color: '#64748b' }}>
                    C売: {trader.callSell} / P売: {trader.putSell}
                  </div>
                </div>
              </div>
              {/* 詳細：コメント・戦略 */}
              <div style={{ 
                background: 'rgba(15, 23, 42, 0.5)', 
                padding: '6px 8px', 
                borderRadius: '4px',
                borderLeft: `3px solid ${trader.color}`,
              }}>
                <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '2px' }}>
                  💬 {trader.comment}
                </div>
                <div style={{ fontSize: '8px', color: '#64748b' }}>
                  📌 戦略: <span style={{ color: trader.color }}>{trader.strategy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== 実績タブ ===== */}
      {activeTab === 'record' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* 進行中のポジション（B+C連動） */}
          {pendingTrade && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(234, 179, 8, 0.05))',
              padding: '12px',
              borderRadius: '10px',
              border: '2px solid rgba(234, 179, 8, 0.5)',
            }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#eab308', marginBottom: '8px', textAlign: 'center' }}>
                ⏳ ポジション保有中
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '8px', color: '#64748b' }}>日付</div>
                  <div style={{ fontSize: '11px', fontWeight: '600' }}>{pendingTrade.date}</div>
                </div>
                <div>
                  <div style={{ fontSize: '8px', color: '#64748b' }}>スロット</div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: slotMeta[pendingTrade.slot].color }}>
                    {pendingTrade.slot}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '8px', color: '#64748b' }}>方向</div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: pendingTrade.direction === 'long' ? '#22c55e' : '#ef4444' }}>
                    {pendingTrade.direction === 'long' ? '買い' : '売り'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '8px', color: '#64748b' }}>エントリー</div>
                  <div style={{ fontSize: '11px', fontWeight: '700' }}>{pendingTrade.entry.toLocaleString()}</div>
                </div>
              </div>
              
              {/* ワンタップ決済ボタン */}
              <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '6px', textAlign: 'center' }}>
                ワンタップ決済（損益）
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '8px' }}>
                {[+300, +200, +100, +50].map((pnl) => (
                  <button
                    key={pnl}
                    onClick={() => quickExit(pnl)}
                    style={{
                      padding: '8px 4px',
                      background: 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid rgba(34, 197, 94, 0.5)',
                      borderRadius: '6px',
                      color: '#22c55e',
                      fontWeight: '700',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    +{pnl}
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '10px' }}>
                {[-50, -100, -200, -300].map((pnl) => (
                  <button
                    key={pnl}
                    onClick={() => quickExit(pnl)}
                    style={{
                      padding: '8px 4px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.5)',
                      borderRadius: '6px',
                      color: '#ef4444',
                      fontWeight: '700',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    {pnl}
                  </button>
                ))}
              </div>
              
              {/* 価格で決済 */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="number"
                  placeholder="決済価格"
                  id="exitPriceInput"
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    background: '#1e293b',
                    color: 'white',
                    border: '1px solid #374151',
                    fontSize: '11px',
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('exitPriceInput');
                    if (input && input.value) {
                      quickExitByPrice(parseInt(input.value));
                      input.value = '';
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    background: '#3b82f6',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                >
                  価格で決済
                </button>
                <button
                  onClick={cancelPending}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(100, 116, 139, 0.3)',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    color: '#94a3b8',
                    fontWeight: '600',
                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          )}
          
          {/* 総合成績 */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05))',
            padding: '12px',
            borderRadius: '10px',
            border: '2px solid rgba(34, 197, 94, 0.4)',
          }}>
            <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '10px', textAlign: 'center' }}>
              📈 ミニ1枚 実績サマリー
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '8px', color: '#64748b' }}>総取引</div>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{stats.total}</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', color: '#64748b' }}>勝率</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#22c55e' }}>{stats.winRate}%</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', color: '#64748b' }}>勝敗</div>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>
                  <span style={{ color: '#22c55e' }}>{stats.wins}W</span>
                  <span style={{ color: '#64748b' }}> - </span>
                  <span style={{ color: '#ef4444' }}>{stats.total - stats.wins}L</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '8px', color: '#64748b' }}>損益</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: stats.totalPnl >= 0 ? '#22c55e' : '#ef4444' }}>
                  {stats.totalPnl >= 0 ? '+' : ''}{stats.totalPnl.toLocaleString()}円
                </div>
              </div>
            </div>
            <div style={{ marginTop: '8px', fontSize: '9px', color: '#64748b', textAlign: 'center' }}>
              ※ ミニ1枚 = 10円で100円損益
            </div>
          </div>

          {/* スロット別成績 */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '10px',
            borderRadius: '8px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px' }}>スロット別成績</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {['A', 'B', 'C', 'D'].map((slot) => (
                <div key={slot} style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  padding: '8px',
                  borderRadius: '6px',
                  textAlign: 'center',
                  borderTop: `3px solid ${slotMeta[slot].color}`,
                }}>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: slotMeta[slot].color }}>{slot}</div>
                  <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>{stats.bySlot[slot].total}戦</div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: parseFloat(stats.bySlot[slot].winRate) >= 50 ? '#22c55e' : '#ef4444' }}>
                    {stats.bySlot[slot].winRate}%
                  </div>
                  <div style={{ fontSize: '9px', color: stats.bySlot[slot].pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                    {stats.bySlot[slot].pnl >= 0 ? '+' : ''}{stats.bySlot[slot].pnl}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 判定根拠分析（プロンプト改善用） */}
          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#a78bfa', marginBottom: '8px' }}>
              🧠 判定根拠分析（プロンプト改善用）
            </div>
            <div style={{ fontSize: '9px', color: '#94a3b8', lineHeight: 1.6 }}>
              {(() => {
                const longTrades = tradeRecords.filter(r => r.direction === 'long');
                const shortTrades = tradeRecords.filter(r => r.direction === 'short');
                const longWins = longTrades.filter(r => r.result === 'win').length;
                const shortWins = shortTrades.filter(r => r.result === 'win').length;
                const longWinRate = longTrades.length > 0 ? ((longWins / longTrades.length) * 100).toFixed(0) : 0;
                const shortWinRate = shortTrades.length > 0 ? ((shortWins / shortTrades.length) * 100).toFixed(0) : 0;
                const avgWin = tradeRecords.filter(r => r.pnl > 0).reduce((sum, r) => sum + r.pnl, 0) / (stats.wins || 1);
                const avgLoss = Math.abs(tradeRecords.filter(r => r.pnl < 0).reduce((sum, r) => sum + r.pnl, 0)) / ((stats.total - stats.wins) || 1);
                const pf = avgLoss > 0 ? ((avgWin * stats.wins) / (avgLoss * (stats.total - stats.wins))).toFixed(2) : '∞';
                
                return (
                  <>
                    <p><strong>買い判定:</strong> {longTrades.length}回 → 勝率 {longWinRate}%</p>
                    <p><strong>売り判定:</strong> {shortTrades.length}回 → 勝率 {shortWinRate}%</p>
                    <p><strong>平均利益:</strong> +{avgWin.toFixed(0)}円 / <strong>平均損失:</strong> -{avgLoss.toFixed(0)}円</p>
                    <p><strong>プロフィットファクター:</strong> {pf}</p>
                    <div style={{ marginTop: '6px', padding: '6px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '4px' }}>
                      <strong>💡 改善ヒント:</strong>
                      {parseFloat(longWinRate) > parseFloat(shortWinRate) ? 
                        ' 買い判定の精度が高い。売り判定の閾値を厳しくする検討。' :
                        parseFloat(shortWinRate) > parseFloat(longWinRate) ?
                        ' 売り判定の精度が高い。買い判定の条件を見直す。' :
                        ' 買い・売りともに同等。データ蓄積で傾向把握へ。'
                      }
                      {avgLoss > avgWin && ' ストップロスの幅を狭める検討。'}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* トレード追加 */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '10px',
            borderRadius: '8px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px' }}>➕ トレード追加</div>
            
            {/* 日付選択 */}
            <div style={{ marginBottom: '6px' }}>
              <input
                type="date"
                value={newTrade.date.replace(/\//g, '-')}
                onChange={(e) => setNewTrade({ ...newTrade, date: e.target.value.replace(/-/g, '/') })}
                style={{ 
                  width: '100%',
                  padding: '6px', 
                  borderRadius: '4px', 
                  background: '#1e293b', 
                  color: 'white', 
                  border: 'none', 
                  fontSize: '10px',
                }}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginBottom: '8px' }}>
              <select
                value={newTrade.slot}
                onChange={(e) => setNewTrade({ ...newTrade, slot: e.target.value })}
                style={{ padding: '6px', borderRadius: '4px', background: '#1e293b', color: 'white', border: 'none', fontSize: '10px' }}
              >
                <option value="A">スロットA</option>
                <option value="B">スロットB</option>
                <option value="C">スロットC</option>
                <option value="D">スロットD</option>
              </select>
              <select
                value={newTrade.direction}
                onChange={(e) => setNewTrade({ ...newTrade, direction: e.target.value })}
                style={{ padding: '6px', borderRadius: '4px', background: '#1e293b', color: 'white', border: 'none', fontSize: '10px' }}
              >
                <option value="long">買い</option>
                <option value="short">売り</option>
              </select>
              <input
                type="number"
                placeholder="エントリー価格"
                value={newTrade.entry}
                onChange={(e) => setNewTrade({ ...newTrade, entry: e.target.value })}
                style={{ padding: '6px', borderRadius: '4px', background: '#1e293b', color: 'white', border: 'none', fontSize: '10px' }}
              />
              <input
                type="number"
                placeholder="損益（例: 300 or -150）"
                value={newTrade.pnl}
                onChange={(e) => setNewTrade({ ...newTrade, pnl: e.target.value })}
                style={{ padding: '6px', borderRadius: '4px', background: '#1e293b', color: 'white', border: 'none', fontSize: '10px' }}
              />
            </div>
            <button
              onClick={addTrade}
              style={{
                width: '100%',
                padding: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontWeight: '600',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              <Plus size={12} style={{ marginRight: '4px' }} />
              追加
            </button>
          </div>

          {/* 履歴 */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            padding: '10px',
            borderRadius: '8px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600' }}>📋 取引履歴（直近）</div>
              <button
                onClick={() => {
                  if (confirm('全データをリセットしますか？')) {
                    setTradeRecords([]);
                  }
                }}
                style={{
                  padding: '3px 6px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '4px',
                  color: '#ef4444',
                  fontSize: '8px',
                  cursor: 'pointer',
                }}
              >
                リセット
              </button>
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {tradeRecords.slice(-10).reverse().map((record) => (
                <div key={record.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px',
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  fontSize: '9px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#64748b' }}>{record.date}</span>
                    <span style={{
                      padding: '1px 4px',
                      background: slotMeta[record.slot].color + '30',
                      color: slotMeta[record.slot].color,
                      borderRadius: '2px',
                      fontWeight: '600',
                    }}>
                      {record.slot}
                    </span>
                    <span style={{ color: record.direction === 'long' ? '#22c55e' : '#ef4444' }}>
                      {record.direction === 'long' ? '買' : '売'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#64748b' }}>{record.entry}→{record.exit}</span>
                    <span style={{
                      fontWeight: '700',
                      color: record.pnl >= 0 ? '#22c55e' : '#ef4444',
                    }}>
                      {record.pnl >= 0 ? '+' : ''}{record.pnl}
                    </span>
                    <button
                      onClick={() => deleteTrade(record.id)}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              ))}
              {tradeRecords.length === 0 && (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '20px', fontSize: '10px' }}>
                  まだ取引記録がありません
                </div>
              )}
            </div>
          </div>

          {/* データ永続化の説明 */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            padding: '8px',
            borderRadius: '6px',
            fontSize: '8px',
            color: '#60a5fa',
          }}>
            💾 データは自動保存されます。ブラウザを閉じても実績は保持されます。
          </div>
        </div>
      )}

      {/* フッター */}
      <footer style={{
        marginTop: '12px',
        padding: '8px',
        textAlign: 'center',
        color: '#475569',
        fontSize: '8px',
        borderTop: '1px solid #1e293b',
      }}>
        <p>⚠️ 投資は自己責任。AIは数値を「探す」「比較する」「文章に落とす」のみ。</p>
        <p>入る／入らないの最終判断はあなたが行ってください。</p>
      </footer>
    </div>
  );
}
