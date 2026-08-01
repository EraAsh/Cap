// 本文件为汉化版：已移除所有订阅/付费逻辑，全部 Pro 功能默认解锁
export const getProPlanId = (_billingCycle: "yearly" | "monthly") => {
	return "";
};

export function isUserOnProPlan(): boolean {
	// 汉化版：所有用户均视为 Pro，解锁全部功能
	return true;
}
