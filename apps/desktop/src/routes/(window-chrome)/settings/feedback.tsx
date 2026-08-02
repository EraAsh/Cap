import { Button } from "@cap/ui-solid";
import { action, useAction, useSubmission } from "@solidjs/router";
import { getVersion } from "@tauri-apps/api/app";
import { type OsType, type as ostype } from "@tauri-apps/plugin-os";
import * as shell from "@tauri-apps/plugin-shell";
import { createResource, createSignal, For, Show } from "solid-js";
import toast from "solid-toast";

import { commands, type SystemDiagnostics } from "~/utils/tauri";
import { apiClient, protectedHeaders } from "~/utils/web-api";
import { Section, SettingsPageContent } from "./Setting";

const getFeedbackOs = (): Extract<OsType, "macos" | "windows" | "linux"> => {
	const os = ostype();
	if (os === "macos" || os === "windows" || os === "linux") return os;
	throw new Error(`Unsupported OS for feedback submission: ${os}`);
};

const sendFeedbackAction = action(async (feedback: string) => {
	const response = await apiClient.desktop.submitFeedback({
		body: { feedback, os: getFeedbackOs(), version: await getVersion() },
		headers: await protectedHeaders(),
	});

	if (response.status !== 200) throw new Error("提交反馈失败");
	return response.body;
});

async function fetchDiagnostics(): Promise<SystemDiagnostics | null> {
	try {
		return await commands.getSystemDiagnostics();
	} catch (e) {
		console.error("获取诊断信息失败：", e);
		return null;
	}
}

export default function FeedbackTab() {
	const [feedback, setFeedback] = createSignal("");
	const [uploadingLogs, setUploadingLogs] = createSignal(false);
	const [diagnostics] = createResource(fetchDiagnostics);

	const submission = useSubmission(sendFeedbackAction);
	const sendFeedback = useAction(sendFeedbackAction);

	const handleUploadLogs = async () => {
		setUploadingLogs(true);
		try {
			await commands.uploadLogs();
			toast.success("日志上传成功");
		} catch (error) {
			toast.error("上传日志失败");
			console.error("上传日志失败：", error);
		} finally {
			setUploadingLogs(false);
		}
	};

	return (
		<div class="cap-settings-page flex flex-col w-full h-full custom-scroll">
			<SettingsPageContent>
				<Section
					title="反馈"
					description="提交反馈或报告错误，帮助改进 Cap。我们会立即处理"
				>
					<form
						class="space-y-4"
						onSubmit={(e) => {
							e.preventDefault();
							sendFeedback(feedback());
						}}
					>
						<fieldset disabled={submission.pending}>
							<div>
								<textarea
									value={feedback()}
									onInput={(e) => setFeedback(e.currentTarget.value)}
									placeholder="告诉我们您对 Cap 的看法..."
									required
									minLength={10}
									class="p-2 w-full h-32 text-[13px] rounded-md border transition-colors duration-200 resize-none bg-gray-2 placeholder:text-gray-10 border-gray-3 text-primary focus:outline-hidden focus:ring-1 focus:ring-gray-8 hover:border-gray-6"
								/>
							</div>

							{submission.error && (
								<p class="mt-2 text-sm text-red-400">
									{submission.error.toString()}
								</p>
							)}

							{submission.result?.success && (
								<p class="text-sm text-primary">Thank you for your feedback!</p>
							)}

							<Button
								type="submit"
								size="md"
								variant="dark"
								disabled={feedback().trim().length < 4}
								class="mt-2"
							>
								{submission.pending ? "Submitting..." : "提交反馈"}
							</Button>
						</fieldset>
					</form>
				</Section>

				<Section
					title="加入社区"
					description="有问题、想分享想法或随便聊聊？加入 Cap Discord 社区"
				>
					<Button
						onClick={() => shell.open("https://cap.link/discord")}
						size="md"
						variant="gray"
					>
						Join Discord
					</Button>
				</Section>

				<Section
					title="调试信息"
					description="上传日志以帮助我们诊断 Cap 的问题，不含任何个人信息"
				>
					<Button
						onClick={handleUploadLogs}
						size="md"
						variant="gray"
						disabled={uploadingLogs()}
					>
						{uploadingLogs() ? "Uploading..." : "上传日志"}
					</Button>
				</Section>

				<Section title="系统信息">
					<Show
						when={!diagnostics.loading && diagnostics()}
						fallback={
							<p class="text-xs leading-relaxed text-gray-10">
								Loading system information...
							</p>
						}
					>
						{(diag) => {
							const d = diag() as Record<string, unknown>;
							const osVersion =
								"macosVersion" in d
									? (d.macosVersion as { displayName: string } | null)
									: "windowsVersion" in d
										? (d.windowsVersion as { displayName: string } | null)
										: "linuxVersion" in d
											? (d.linuxVersion as { displayName: string } | null)
											: null;
							const captureSupported =
								"screenCaptureSupported" in d
									? (d.screenCaptureSupported as boolean)
									: "graphicsCaptureSupported" in d
										? (d.graphicsCaptureSupported as boolean)
										: false;
							return (
								<div class="space-y-3 text-sm">
									<Show when={osVersion}>
										{(ver) => (
											<div class="space-y-1">
												<p class="text-gray-11 font-medium">Operating System</p>
												<p class="text-gray-10 bg-gray-2 px-2 py-1.5 rounded-sm font-mono text-xs">
													{ver().displayName}
												</p>
											</div>
										)}
									</Show>

									<div class="space-y-1">
										<p class="text-gray-11 font-medium">Capture Support</p>
										<div class="flex gap-2 flex-wrap">
											<span
												class={`px-2 py-1 rounded text-xs ${
													captureSupported
														? "bg-green-500/20 text-green-400"
														: "bg-red-500/20 text-red-400"
												}`}
											>
												Screen Capture: {captureSupported ? "受支持" : "不支持"}
											</span>
										</div>
									</div>

									<Show when={(d.availableEncoders as string[])?.length > 0}>
										<div class="space-y-1">
											<p class="text-gray-11 font-medium">Available Encoders</p>
											<div class="flex gap-1.5 flex-wrap">
												<For each={d.availableEncoders as string[]}>
													{(encoder) => (
														<span class="px-2 py-1 bg-gray-2 rounded-sm text-xs text-gray-10 font-mono">
															{encoder}
														</span>
													)}
												</For>
											</div>
										</div>
									</Show>
								</div>
							);
						}}
					</Show>
				</Section>
			</SettingsPageContent>
		</div>
	);
}
