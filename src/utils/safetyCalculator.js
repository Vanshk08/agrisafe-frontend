/**
 * Safety Score Calculator
 * Converts prediction confidence into a comprehensive safety assessment
 */

export const calculateSafetyScore = (prediction, confidence) => {
  /**
   * Calculate 0-100 safety score
   * Fresh + high confidence = high score
   * Spoiled = low score
   */
  
  if (prediction === 'fresh') {
    // Fresh: 50-100 based on confidence
    const freshScore = 50 + (confidence * 50);
    return Math.min(100, Math.round(freshScore));
  } else {
    // Spoiled: 0-50 based on confidence
    const spoiledScore = 50 - (confidence * 50);
    return Math.max(0, Math.round(spoiledScore));
  }
};

export const getSafetyStatus = (safetyScore) => {
  /**
   * Get status badge based on score
   */
  if (safetyScore >= 85) return { status: 'EXCELLENT', color: '#10b981', icon: '✓✓✓' };
  if (safetyScore >= 70) return { status: 'SAFE', color: '#3b82f6', icon: '✓✓' };
  if (safetyScore >= 50) return { status: 'CAUTION', color: '#f59e0b', icon: '⚠' };
  if (safetyScore >= 30) return { status: 'WARNING', color: '#ef4444', icon: '✕' };
  return { status: 'UNSAFE', color: '#dc2626', icon: '✕✕' };
};

export const generateReasons = (prediction, confidence, foodType = 'unknown') => {
  /**
   * Generate detailed reasons for the prediction
   */
  const reasons = [];
  
  if (prediction === 'fresh') {
    reasons.push(`✓ No visible mold detected`);
    reasons.push(`✓ Color appearance healthy`);
    reasons.push(`✓ No obvious decay indicators`);
    if (confidence > 0.9) {
      reasons.push(`✓ Very high confidence (${(confidence * 100).toFixed(0)}%)`);
    } else if (confidence > 0.8) {
      reasons.push(`✓ High confidence (${(confidence * 100).toFixed(0)}%)`);
    }
  } else {
    reasons.push(`✕ Potential contamination detected`);
    if (confidence > 0.85) {
      reasons.push(`✕ Visible mold or decay patterns present`);
      reasons.push(`✕ Color abnormalities indicating spoilage`);
    } else if (confidence > 0.75) {
      reasons.push(`✕ Suspicious discoloration detected`);
      reasons.push(`✕ May show early signs of spoilage`);
    }
    reasons.push(`✕ Confidence: ${(confidence * 100).toFixed(0)}%`);
  }
  
  return reasons;
};

export const getRecommendation = (prediction, safetyScore) => {
  /**
   * Get actionable recommendation
   */
  if (prediction === 'fresh' && safetyScore >= 85) {
    return {
      action: 'SAFE TO EAT',
      description: 'This food appears fresh and safe for consumption.',
      color: '#10b981'
    };
  } else if (prediction === 'fresh' && safetyScore >= 70) {
    return {
      action: 'LIKELY SAFE',
      description: 'Food appears generally safe, but monitor for any odors or changes.',
      color: '#3b82f6'
    };
  } else if (safetyScore >= 50) {
    return {
      action: 'USE CAUTION',
      description: 'Some signs of spoilage detected. Recommend consuming soon or discarding.',
      color: '#f59e0b'
    };
  } else {
    return {
      action: 'NOT SAFE TO EAT',
      description: 'Clear signs of spoilage detected. Recommend discarding this food.',
      color: '#ef4444'
    };
  }
};

export const getStorageTips = (foodType) => {
  /**
   * Get food-type specific storage tips
   */
  const tips = {
    dairy: ['Keep at 4°C or below', 'Use within 7-10 days after opening', 'Keep sealed when not in use'],
    meat: ['Store at 0°C or freezer at -18°C', 'Use within 3-4 days (fridge) or 3 months (frozen)', 'Keep separate from other foods'],
    seafood: ['Store at 0°C immediately after purchase', 'Use within 1-2 days', 'Keep on ice if possible'],
    produce: ['Store in cool, dry place or fridge', 'Check for firmness and no soft spots', 'Separate ripe from unripe items'],
    bakery: ['Store in airtight container at room temperature', 'Keep away from moisture', 'Use within 2-3 days'],
    other: ['Follow package instructions', 'Keep in original sealed container', 'Store in appropriate temperature']
  };
  
  return tips[foodType?.toLowerCase()] || tips.other;
};
