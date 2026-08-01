import { Button } from "@cap/ui-solid";
import { useNavigate } from "@solidjs/router";
import { onMount } from "solid-js";

// 汉化版：已移除付费升级，此页面自动跳转回主页
export default function Page() {
	const navigate = useNavigate();

	onMount(() => {
		navigate("/", { replace: true });
	});

	return (
		<div class="flex flex-col items-center justify-center w-full h-screen gap-4 p-6 bg-gray-1">
			<div class="flex flex-col items-center gap-2">
				<h1 class="text-3xl font-semibold text-gray-12">全部功能已解锁</h1>
				<p class="text-gray-11">
					本版本为完全免费版，所有 Pro 功能（云存储、无水印、高清录制等）均已开放。
				</p>
			</div>
			<Button onClick={() => navigate("/", { replace: true })}>
				返回主页
			</Button>
		</div>
	);
}
