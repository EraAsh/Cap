import { Store } from "@tauri-apps/plugin-store";
import posthog from "posthog-js";
import { v4 as uuid } from "uuid";

const key = import.meta.env.VITE_POSTHOG_KEY as string;
const host = import.meta.env.VITE_POSTHOG_HOST as string;

let isPostHogInitialized = false;

let telemetryEnabledCache = true;

async function isTelemetryEnabled(): Promise<boolean> {
	try {
		const store = await Store.load("store");
		const settings =
			(await store.get<{ enableTelemetry?: boolean }>("general_settings")) ??
			null;
		telemetryEnabledCache = settings?.enableTelemetry !== false;
	} catch {
		// fall back to cached value; defaults to enabled
	}
	return telemetryEnabledCache;
}

if (key && host) {
	try {
		posthog.init(key, {
			api_host: host,
			capture_pageview: false,
			loaded: (_posthogInstance) => {
				isPostHogInitialized = true;
			},
		});
		console.log("PostHog initialization started");
	} catch (error) {
		console.error("初始化 PostHog 失败：", error);
	}
}

export function initAnonymousUser() {
	if (!key || !host) {
		console.warn("无法初始化匿名用户——缺少密钥或主机");
		return;
	}

	try {
		const anonymousId = localStorage.getItem("anonymous_id") ?? uuid();
		localStorage.setItem("anonymous_id", anonymousId);
		posthog.identify(anonymousId);
		console.log("匿名用户已识别：", anonymousId);
	} catch (error) {
		console.error("初始化匿名用户出错：", error);
	}
}

export function identifyUser(
	userId: string,
	properties?: Record<string, unknown>,
) {
	if (!key || !host) {
		console.warn("无法识别用户——缺少密钥或主机");
		return;
	}

	try {
		const currentId = posthog.get_distinct_id();
		const anonymousId = localStorage.getItem("anonymous_id");

		if (currentId !== userId) {
			if (anonymousId && currentId === anonymousId) {
				console.log(`Aliasing user ${userId} from anonymous ID ${anonymousId}`);
				posthog.alias(userId, anonymousId);
			}
			posthog.identify(userId);
			if (properties) {
				posthog.people.set(properties);
			}
			localStorage.removeItem("anonymous_id");
			console.log(`User identified: ${userId}`);
		} else {
			console.log(`User already identified as ${userId}`);
		}
	} catch (error) {
		console.error("识别用户出错：", error);
	}
}

export function trackEvent(
	eventName: string,
	properties?: Record<string, unknown>,
) {
	if (!key || !host) {
		console.warn(
			"PostHog event not captured - missing key or host:",
			eventName,
		);
		return;
	}

	if (!telemetryEnabledCache) {
		return;
	}

	void isTelemetryEnabled().then((enabled) => {
		if (!enabled) return;

		try {
			if (!isPostHogInitialized) {
				console.warn(
					`PostHog not initialized yet, queuing event: ${eventName}`,
				);
				setTimeout(() => {
					console.log(`Retrying event ${eventName} after delay`);
					trackEvent(eventName, properties);
				}, 1000);
				return;
			}

			const eventProperties = { ...properties, platform: "desktop" };
			console.log(`Capturing event ${eventName}:`, eventProperties);
			posthog.capture(eventName, eventProperties);
		} catch (error) {
			console.error(`Error capturing event ${eventName}:`, error);
		}
	});
}

void isTelemetryEnabled();
