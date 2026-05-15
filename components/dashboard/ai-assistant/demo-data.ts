import type { Recommendation } from "./types"

export const demoRecommendations: Recommendation[] = [
  {
    id: "rec_001",
    type: "opportunity",
    title: "Summer Sale may have room to scale",
    entityType: "Campaign",
    entityName: "Summer Sale",
    whatHappened:
      "ROAS has held above target for 7 consecutive days while spend remains stable and below the expected saturation point.",
    evidence: [
      { label: "ROAS", value: "3.2x", comparison: "vs target 2.5x", trend: "positive" },
      { label: "CPA", value: "$41", comparison: "vs target $50", trend: "positive" },
      { label: "Spend", value: "$420/day", comparison: "stable for 7 days", trend: "neutral" },
      { label: "Revenue", value: "+18%", comparison: "week over week", trend: "positive" },
    ],
    whyItMatters:
      "This campaign is performing efficiently and may have room to scale, which could increase revenue without degrading unit economics.",
    recommendedAction: "Review the Summer Sale budget recommendation in the Action Center.",
    estimatedImpact: {
      revenue: "+$2,400/week (modeled)",
      margin: "+$900/week (modeled)",
    },
    riskGuardrail:
      "If reviewed, watch CPA. Flag if CPA rises above $50 for 2 consecutive days after any change.",
    confidence: "High",
    timeWindow: "Last 7 days vs previous 7 days",
    actions: [
      { label: "View evidence", action: "view_evidence" },
      { label: "Review recommendation", action: "review_recommendation" },
      { label: "Open in Action Center", action: "open_in_action_center" },
    ],
    approvedAction: {
      type: "increase_budget",
      platform: "meta",
      objectType: "campaign",
      objectName: "Summer Sale",
      currentValueLabel: "$420/day",
      proposedValueLabel: "$500/day",
      budget: { current: 420, proposed: 500, unit: "daily", currency: "USD" },
      reason:
        "ROAS has held above target for 7 consecutive days and CPA is 18% below target — the campaign appears to have headroom before saturation.",
      evidence: [
        { label: "ROAS", value: "3.2x", comparison: "vs target 2.5x", trend: "positive" },
        { label: "CPA", value: "$41", comparison: "vs target $50", trend: "positive" },
        { label: "Revenue WoW", value: "+18%", comparison: "stable spend", trend: "positive" },
        { label: "Confidence", value: "92%", comparison: "high", trend: "positive" },
      ],
      riskWatchout:
        "Watch CPA. Roll back if CPA rises above $50 for 2 consecutive days after the change.",
      confidence: 92,
      hints: {
        parentChildHierarchy: true,
        positiveContributionMargin: true,
        recentRevenue: true,
      },
    },
  },
  {
    id: "rec_002",
    type: "warning",
    title: "Broad Audience 18-24 underperforming",
    entityType: "Ad Set",
    entityName: "Broad Audience 18-24",
    whatHappened:
      "CPA has remained above target for 5 consecutive days and ROAS recovery has not materialized despite stable spend.",
    evidence: [
      { label: "CPA", value: "$58", comparison: "vs target $45", trend: "negative" },
      { label: "ROAS", value: "1.6x", comparison: "vs target 2.2x", trend: "negative" },
      { label: "Spend", value: "$310", comparison: "over 5 days", trend: "neutral" },
      { label: "CTR", value: "1.8%", comparison: "flat", trend: "neutral" },
    ],
    whyItMatters:
      "This ad set is dragging overall campaign efficiency. Continued spend without improvement would erode contribution margin.",
    recommendedAction:
      "Review whether to reduce or reallocate spend from this ad set to higher-performing segments.",
    estimatedImpact: {
      spend: "Up to $62/day at risk",
      margin: "Up to +$180/week if rebalanced",
    },
    riskGuardrail:
      "Reach may drop if reduced. Watch overall campaign reach against an 80% baseline before any change.",
    confidence: "Medium",
    timeWindow: "Last 5 days",
    actions: [
      { label: "View evidence", action: "view_evidence" },
      { label: "Review recommendation", action: "review_recommendation" },
      { label: "Ignore", action: "ignore" },
    ],
    approvedAction: {
      type: "pause",
      platform: "meta",
      objectType: "ad_set",
      objectName: "Broad Audience 18-24",
      currentValueLabel: "Active · $60/day",
      proposedValueLabel: "Paused",
      reason:
        "CPA is 29% above target and ROAS has not recovered after 5 days of stable spend. Pausing this ad set frees budget for higher-performing siblings.",
      evidence: [
        { label: "CPA", value: "$58", comparison: "vs target $45", trend: "negative" },
        { label: "ROAS", value: "1.6x", comparison: "vs target 2.5x", trend: "negative" },
        { label: "Spend", value: "$310", comparison: "over 5 days", trend: "neutral" },
        { label: "Confidence", value: "87%", comparison: "high", trend: "positive" },
      ],
      riskWatchout:
        "Sibling ad sets may absorb learning-phase resets. Watch the parent campaign's blended CPA for 48 hours after pause.",
      confidence: 87,
      hints: { parentChildHierarchy: true },
    },
  },
  {
    id: "rec_003",
    type: "watch",
    title: "Watch Google Search efficiency",
    entityType: "Channel",
    entityName: "Google Search",
    whatHappened:
      "Search costs are rising while revenue efficiency is softening. CPC increased 11% week over week and ROAS is down 9%.",
    evidence: [
      { label: "CPC", value: "+11%", comparison: "week over week", trend: "negative" },
      { label: "ROAS", value: "-9%", comparison: "week over week", trend: "negative" },
      { label: "Spend", value: "stable", comparison: "no change", trend: "neutral" },
      { label: "Conv. Rate", value: "-2.1%", comparison: "slightly down", trend: "negative" },
    ],
    whyItMatters:
      "If this trend continues, Google Search may become unprofitable within 2-3 weeks. Early review can prevent margin erosion.",
    recommendedAction: "Monitor for 3 more days before considering budget changes.",
    estimatedImpact: {
      margin: "At risk: -$400/week if trend continues",
    },
    riskGuardrail:
      "Escalate to a warning if ROAS drops below 3.5x or CPC increases another 5%.",
    confidence: "Medium",
    timeWindow: "Week over week",
    actions: [
      { label: "View evidence", action: "view_evidence" },
      { label: "Review recommendation", action: "review_recommendation" },
    ],
  },
  {
    id: "rec_004",
    type: "warning",
    title: "Carousel Product Grid is fatiguing",
    entityType: "Creative",
    entityName: "Carousel Product Grid",
    whatHappened:
      "CTR is down 25% over 14 days while frequency has crossed 4.0. Contribution margin has declined for 5 consecutive days.",
    evidence: [
      { label: "CTR", value: "1.2%", comparison: "down from 1.6%", trend: "negative" },
      { label: "Frequency", value: "4.2", comparison: "vs target ≤ 3.0", trend: "negative" },
      { label: "Cont. margin", value: "$1,340", comparison: "down 36% in 14 days", trend: "negative" },
      { label: "ROAS", value: "2.75x", comparison: "vs target 3.0x", trend: "negative" },
    ],
    whyItMatters:
      "Creative fatigue typically compounds. Without a refresh, contribution margin from this creative may turn negative within 7 days.",
    recommendedAction:
      "Refresh the creative or rotate it down before adding spend. Consider testing similar UGC variants that are scaling on this account.",
    estimatedImpact: {
      margin: "Up to +$1,200/week if refreshed",
      spend: "$2,840 currently committed",
    },
    riskGuardrail:
      "Watch CTR and contribution margin for the next 3 days. Pause if margin turns negative.",
    confidence: "High",
    timeWindow: "Last 14 days",
    actions: [
      { label: "View evidence", action: "view_evidence" },
      { label: "Review recommendation", action: "review_recommendation" },
      { label: "Open in Action Center", action: "open_in_action_center" },
    ],
  },
  {
    id: "rec_005",
    type: "critical",
    title: "Trail Runner refund rate is 3× store average",
    entityType: "Product",
    entityName: "Trail Runner",
    whatHappened:
      "Refund rate has risen to 8.4%, more than 3× the store average of 2.6%. This has compressed contribution margin to 18.8%, well below the catalog median.",
    evidence: [
      { label: "Refund rate", value: "8.4%", comparison: "vs store avg 2.6%", trend: "negative" },
      { label: "Cont. margin %", value: "18.8%", comparison: "vs catalog median 32%", trend: "negative" },
      { label: "Return rate", value: "9.6%", comparison: "elevated", trend: "negative" },
      { label: "Ad spend", value: "$4,720", comparison: "currently active", trend: "neutral" },
    ],
    whyItMatters:
      "If refunds continue at this rate, contribution margin on this product will turn negative when factoring in return logistics and reverse shipping.",
    recommendedAction:
      "Review sizing accuracy or product description before continuing spend. Consider pausing acquisition spend on this SKU until refunds normalize.",
    estimatedImpact: {
      margin: "Up to +$1,400/week if refunds normalize",
    },
    riskGuardrail:
      "If refund rate stays above 5% for 7 more days, escalate to a hard pause.",
    confidence: "High",
    timeWindow: "Last 30 days",
    actions: [
      { label: "View evidence", action: "view_evidence" },
      { label: "Review recommendation", action: "review_recommendation" },
      { label: "Open in Action Center", action: "open_in_action_center" },
    ],
  },
  {
    id: "rec_006",
    type: "watch",
    title: "Recent PMax cohort payback is slow",
    entityType: "Cohort",
    entityName: "Recent PMax cohort",
    whatHappened:
      "A recent cohort, acquired primarily through Google PMax, has reached 78 days post-acquisition with payback still incomplete vs. the 45-day target.",
    evidence: [
      { label: "Payback", value: "78 days", comparison: "vs target 45 days", trend: "negative" },
      { label: "Repeat rate", value: "18%", comparison: "vs 12-mo avg 26%", trend: "negative" },
      { label: "CAC", value: "$38.40", comparison: "elevated", trend: "negative" },
      { label: "Cont. margin/customer", value: "$8.20", comparison: "below cohort median", trend: "negative" },
    ],
    whyItMatters:
      "PMax acquisition may be drawing in lower-intent customers. Slow payback ties up working capital and reduces flexibility for next month's acquisition.",
    recommendedAction:
      "Review attribution risk on PMax in the Attribution tab and consider rebalancing acquisition mix toward channels with healthier cohort behavior.",
    estimatedImpact: {
      margin: "Cohort behavior unlikely to improve retroactively; future cohorts can be reshaped",
    },
    riskGuardrail:
      "Re-evaluate after the next 14 days of cohort data. Compare to a Meta-acquired control cohort.",
    confidence: "Medium",
    timeWindow: "Last 90 days post-acquisition",
    actions: [
      { label: "View evidence", action: "view_evidence" },
      { label: "Review recommendation", action: "review_recommendation" },
    ],
  },
  {
    id: "rec_007",
    type: "warning",
    title: "Google PMax revenue is overstated",
    entityType: "Channel",
    entityName: "Google PMax",
    whatHappened:
      "Platform-reported revenue from Google PMax is 2.3× the Shopify Blended view. Most overlap is with branded search and shopping demand that would have converted anyway.",
    evidence: [
      { label: "Platform reported", value: "$21,800", comparison: "self-reported", trend: "neutral" },
      { label: "Shopify Blended", value: "$9,400", comparison: "blended measurement source", trend: "neutral" },
      { label: "Overstatement", value: "+$12,400", comparison: "double-count risk", trend: "negative" },
      { label: "Blended ROAS", value: "2.24x", comparison: "vs target 2.5x", trend: "negative" },
    ],
    whyItMatters:
      "If PMax budget is allocated based on platform-reported ROAS, the channel may be over-funded relative to its true incremental contribution.",
    recommendedAction:
      "Reduce PMax budget or treat as a fulfillment channel for warm demand. Review Attribution tab to confirm directional read.",
    estimatedImpact: {
      spend: "Up to $1,200/week reallocation opportunity",
    },
    riskGuardrail:
      "Watch for branded search lift if PMax is reduced. Roll back if branded search drops more than 10%.",
    confidence: "Medium",
    timeWindow: "Last 30 days",
    actions: [
      { label: "View evidence", action: "view_evidence" },
      { label: "Review recommendation", action: "review_recommendation" },
      { label: "Open in Action Center", action: "open_in_action_center" },
    ],
  },
  // Phase 3 — Goal pacing
  {
    id: "rec_008",
    type: "warning",
    title: "Current month revenue goal is pacing 7% behind",
    entityType: "Goal",
    entityName: "Current month revenue · $480,000",
    whatHappened:
      "Daily run-rate is $14,200 vs. the $15,300 needed to hit goal. Pace gap has widened over the last 5 days, mostly driven by softer Meta Prospecting and Email performance.",
    evidence: [
      { label: "Pacing", value: "-7%", comparison: "vs goal", trend: "negative" },
      { label: "Forecast EOM", value: "$446,400", comparison: "vs goal $480,000", trend: "negative" },
      { label: "Required daily", value: "$15,300", comparison: "current $14,200", trend: "negative" },
      { label: "Days remaining", value: "9", comparison: "in current month", trend: "neutral" },
    ],
    whyItMatters:
      "If the current pace continues, the current month will miss the revenue goal by approximately $33,600. Closing the gap requires either a spend lift or a margin/conversion improvement.",
    recommendedAction:
      "Review the closing-the-gap scenario in the Forecasts tab and consider scaling Meta Retargeting or extending Summer Sale spend.",
    estimatedImpact: {
      revenue: "Up to +$33,600 to recover the goal gap",
      spend: "+$8,000-$12,000 spend lift required at current ROAS",
    },
    riskGuardrail:
      "Cap incremental spend if blended CAC rises above $42 or if ROAS on scaled campaigns drops below 2.0x.",
    confidence: "High",
    timeWindow: "Month-to-date",
    actions: [
      { label: "View evidence", action: "view_evidence" },
      { label: "Review recommendation", action: "review_recommendation" },
      { label: "Open in Forecasts", action: "open_in_action_center" },
    ],
  },
  // Phase 3 — Forecast / break-even
  {
    id: "rec_009",
    type: "watch",
    title: "Forecast suggests current quarter contribution margin will dip below 35%",
    entityType: "Forecast",
    entityName: "Current quarter forecast",
    whatHappened:
      "Pace forecast indicates contribution margin will trend toward 33.8% this quarter if current ad mix and refund rates persist, vs. a 35% guardrail.",
    evidence: [
      { label: "CM% forecast", value: "33.8%", comparison: "vs guardrail 35%", trend: "negative" },
      { label: "Driver: refunds", value: "+0.6pt", comparison: "Trail Runner SKU", trend: "negative" },
      { label: "Driver: PMax", value: "+0.4pt drag", comparison: "vs incremental", trend: "negative" },
      { label: "Break-even ROAS", value: "1.85x", comparison: "current blended 2.24x", trend: "neutral" },
    ],
    whyItMatters:
      "Contribution margin under 35% would compress quarterly profit by an estimated $24-30k and reduce reinvestment headroom.",
    recommendedAction:
      "Review the scenario planner: pausing Trail Runner spend and reducing PMax by 25% recovers approximately 0.7pt of margin in the model.",
    estimatedImpact: {
      margin: "Up to +0.7pt CM% recovery",
    },
    riskGuardrail:
      "Hold any acquisition channel cuts to a 14-day review window. Reverse if revenue drops more than 8%.",
    confidence: "Medium",
    timeWindow: "Current quarter forecast horizon",
    actions: [
      { label: "View evidence", action: "view_evidence" },
      { label: "Review recommendation", action: "review_recommendation" },
      { label: "Open in Forecasts", action: "open_in_action_center" },
    ],
  },
  // Phase 3 — Brief / digest summary
  {
    id: "rec_010",
    type: "watch",
    title: "3 alerts triggered in the last 24 hours",
    entityType: "Brief",
    entityName: "Daily brief · today",
    whatHappened:
      "Alerts fired for: current month revenue pacing behind, Trail Runner refund spike, and Google PMax overstatement. All three converge on current-quarter margin risk.",
    evidence: [
      { label: "Alerts active", value: "3", comparison: "across 3 categories", trend: "negative" },
      { label: "Goals at risk", value: "1 of 4", comparison: "current month revenue", trend: "negative" },
      { label: "Open actions", value: "5", comparison: "in Action Center", trend: "neutral" },
      { label: "Last digest sent", value: "8:00 AM", comparison: "today", trend: "neutral" },
    ],
    whyItMatters:
      "These alerts are correlated — addressing the Trail Runner refund issue and reducing PMax should help recover both the margin guardrail and the revenue pace.",
    recommendedAction:
      "Open the Action Center and prioritize Reviewing on these three items. Daily brief and weekly digest already sent to subscribers.",
    estimatedImpact: {
      margin: "Up to +0.7pt CM% recovery",
      revenue: "Up to +$33,600 toward the goal gap",
    },
    riskGuardrail:
      "Avoid taking action on more than two correlated levers in the same week — overlap can mask which change drove results.",
    confidence: "Medium",
    timeWindow: "Last 24 hours",
    actions: [
      { label: "View evidence", action: "view_evidence" },
      { label: "Open in Action Center", action: "open_in_action_center" },
    ],
  },
  // Phase 3B — Inventory-aware
  {
    id: "rec_011",
    type: "warning",
    title: "Premium Cotton Tee will stock out in 11 days at current pace",
    entityType: "Inventory",
    entityName: "Premium Cotton Tee · 420 units on hand",
    whatHappened:
      "Sales velocity is 38 units/day; inventory on hand is 420 units. At this pace the SKU stocks out before the next replenishment. Meta and Google are still actively driving demand to it.",
    evidence: [
      { label: "Days of inventory", value: "11", comparison: "vs 30+ healthy", trend: "negative" },
      { label: "Velocity", value: "38/day", comparison: "stable last 14d", trend: "neutral" },
      { label: "Active spend on SKU", value: "$9,940", comparison: "this month", trend: "neutral" },
      { label: "Revenue at risk", value: "$24,100", comparison: "if SKU sells out", trend: "negative" },
    ],
    whyItMatters:
      "Spending to drive demand to a SKU that's about to stock out wastes ad budget and creates a poor customer experience. CM at risk is roughly $7,260.",
    recommendedAction:
      "Review the reorder timing in Inventory and consider pausing or reallocating the $9,940 in active spend until inventory recovers.",
    estimatedImpact: {
      margin: "Protect ~$7,260 in contribution margin",
      spend: "Reallocate up to $9,940 to in-stock SKUs",
    },
    riskGuardrail:
      "Don't shut off all spend on the SKU — keep brand campaigns live to avoid a sudden visibility drop when stock returns.",
    confidence: "High",
    timeWindow: "Next 14 days",
    actions: [
      { label: "View evidence", action: "view_evidence" },
      { label: "Review recommendation", action: "review_recommendation" },
      { label: "Open in Action Center", action: "open_in_action_center" },
    ],
  },
  // Phase 3B — Subscription
  {
    id: "rec_012",
    type: "watch",
    title: "Recent subscription cohort is dropping off in month 2",
    entityType: "Subscription",
    entityName: "Recent subscription cohort",
    whatHappened:
      "Month-2 retention for the most recent cohort is tracking 79.2% vs the 85% goal. The dominant cancel reason is \"changed my mind\" within the first 24 hours of the second renewal.",
    evidence: [
      { label: "M2 retention", value: "79.2%", comparison: "vs 85% goal", trend: "negative" },
      { label: "Same-day cancels", value: "14.8%", comparison: "vs 8% benchmark", trend: "negative" },
      { label: "Top cancel reason", value: "Changed my mind", comparison: "32% of cancels", trend: "neutral" },
      { label: "Annualized revenue at risk", value: "$8,400", comparison: "vs hitting goal", trend: "negative" },
    ],
    whyItMatters:
      "Subscription LTV is highly sensitive to month-2 retention. Recovering 5pt translates into roughly $8,400/month in renewal revenue at the current cohort size.",
    recommendedAction:
      "Inspect cancel reasons in Subscription view and trial a soft-skip flow on the second renewal for indecisive subscribers.",
    estimatedImpact: {
      revenue: "Up to +$8,400/month in renewal revenue",
    },
    riskGuardrail:
      "Pilot soft-skip on a 50% holdout for 4 weeks. Reverse if churn doesn't improve or refund rate ticks up.",
    confidence: "Medium",
    timeWindow: "Recent cohort, M2 window",
    actions: [
      { label: "View evidence", action: "view_evidence" },
      { label: "Review recommendation", action: "review_recommendation" },
      { label: "Open in Cohorts", action: "open_in_action_center" },
    ],
  },
  // Phase 3B — Benchmark
  {
    id: "rec_013",
    type: "watch",
    title: "Refund rate is running above category benchmark",
    entityType: "Benchmark",
    entityName: "Apparel + Footwear · $1M-$5M tier",
    whatHappened:
      "Storewide refund rate is 3.4% vs a 2.6% benchmark for similar Apparel + Footwear catalogs at this revenue tier. Trail Runner is the largest contributor.",
    evidence: [
      { label: "Refund rate", value: "3.4%", comparison: "vs 2.6% benchmark", trend: "negative" },
      { label: "Trail Runner refunds", value: "8.4%", comparison: "vs 3.0% category median", trend: "negative" },
      { label: "Returns mix", value: "Sizing 62%", comparison: "of total returns", trend: "neutral" },
      { label: "Margin drag", value: "-0.4pt", comparison: "from elevated refunds", trend: "negative" },
    ],
    whyItMatters:
      "Benchmark drift signals a structural issue rather than a one-off — usually sizing, fit, or product description. Sustained drift will keep compressing margin.",
    recommendedAction:
      "Review Trail Runner sizing copy and product images. Consider pausing acquisition spend on Trail Runner until refund rate trends back below 5%.",
    estimatedImpact: {
      margin: "Up to +0.4pt margin recovery if refunds normalize",
    },
    riskGuardrail:
      "Don't change product copy and pause spend in the same week — you won't be able to attribute the recovery.",
    confidence: "Medium",
    timeWindow: "Trailing 30 days",
    actions: [
      { label: "View evidence", action: "view_evidence" },
      { label: "Review recommendation", action: "review_recommendation" },
      { label: "Open in Products", action: "open_in_action_center" },
    ],
  },
  // Phase 3B — Agency / Multi-store
  {
    id: "rec_014",
    type: "critical",
    title: "Bayside Home is the only store in critical health this week",
    entityType: "Store",
    entityName: "Bayside Home · Home category",
    whatHappened:
      "Bayside Home is down 4.6% MoM on revenue, has 9 open actions, and 2 goals at risk. Its CM% is 26.2% vs portfolio average of 32.4%.",
    evidence: [
      { label: "MoM revenue", value: "-4.6%", comparison: "vs portfolio +4.6% avg", trend: "negative" },
      { label: "CM%", value: "26.2%", comparison: "vs 32.4% portfolio avg", trend: "negative" },
      { label: "Open actions", value: "9", comparison: "highest in portfolio", trend: "negative" },
      { label: "Refund rate", value: "6.7%", comparison: "vs 3.8% portfolio avg", trend: "negative" },
    ],
    whyItMatters:
      "Compounding signals (margin, refunds, declining revenue) suggest a structural issue, not a one-week dip. Without intervention, the goals at risk likely miss.",
    recommendedAction:
      "Open Bayside Home in Optilytics and prioritize the 9 open actions. Loop in Sam P. for an account review and align on which two levers to pull this week.",
    estimatedImpact: {
      revenue: "Stabilize $196k/mo run-rate",
      margin: "Up to +1.5pt CM% recovery if refunds and CAC normalize",
    },
    riskGuardrail:
      "Avoid simultaneous spend cuts and product changes. Pick one structural lever per week to keep attribution clean.",
    confidence: "High",
    timeWindow: "This week",
    actions: [
      { label: "View evidence", action: "view_evidence" },
      { label: "Open store", action: "open_in_action_center" },
    ],
  },
]
