// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

function initPlatformClass() {
	import("@tauri-apps/plugin-os")
		.then(({ type }) => {
			const osType = type();
			document.documentElement.classList.add(`platform-${osType}`);
		})
		.catch((error) => {
			console.error("获取系统类型失败：", error);
		});
}

async function initApp() {
	if (
		import.meta.env.DEV &&
		import.meta.env.VITE_SOLID_DEVTOOLS &&
		window.location.pathname.startsWith("/editor")
	) {
		const { attachDevtoolsOverlay } = await import("@solid-devtools/overlay");
		attachDevtoolsOverlay();
	}

	const app = document.getElementById("app");
	if (!app) throw new Error("未找到应用根元素");

	mount(() => <StartClient />, app);
	initPlatformClass();
}

void initApp();
