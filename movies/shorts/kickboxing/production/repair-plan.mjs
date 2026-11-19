/** Fixed 90-frame packet boundaries preserve the frames reviewed in the earlier cuts. */
const supportPlan = {
  previousBundle: "7b4d2183dd4666a9ed11722b8e75d177d6e25c578cfbed6026237ab7391a93c6",
  previousPicture: "110f2777435191d765a79de5b2e4c256a0adb63ff2fb80b88311ca411515ecbf",
  ranges: [[1800, 2520], [2880, 3060], [3510, 3960], [4320, 5400]],
};

const attentionPlan = {
  previousBundle: "aa9599bd16ddc3159f13ec2695a89a9a5d49437c899565e2787577f590a074bd",
  previousPicture: "a2c05a9b2f4c41f199f65739330b56f5796f2301e74b37b972d11ef0106f34ce",
  ranges: [[1890, 2430], [2880, 3060], [3510, 3960], [4410, 4590], [4680, 5400]],
  previousPlan: supportPlan,
};

export const repairPlan = process.env.ROUND_REPAIR_STAGE === "attention" ? attentionPlan : supportPlan;

const overlaps = (plan, start, end) => plan.ranges.some(([first, last]) => start < last && end > first);

export function needsRepairDraw(start, end) {
  return overlaps(repairPlan, start, end);
}

export function retainedBundle(start, end) {
  let plan = repairPlan;
  while (plan.previousPlan && !overlaps(plan.previousPlan, start, end)) plan = plan.previousPlan;
  return plan.previousBundle;
}
