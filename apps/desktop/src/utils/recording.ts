import { emit } from "@tauri-apps/api/event";
import * as dialog from "@tauri-apps/plugin-dialog";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import type { createOptionsQuery } from "./queries";
import { commands, type RecordingAction, type RecordingMode } from "./tauri";

export function handleRecordingResult(
	result: Promise<RecordingAction>,
	setOptions: ReturnType<typeof createOptionsQuery>["setOptions"] | undefined,
) {
	return result
		.then(async (result) => {
			if (result === "Started") return;
			if (result === "InvalidAuthentication") {
				const buttons = setOptions
					? {
							yes: "登录",
							no: "切换到工作室模式",
							cancel: "取消",
						}
					: {
							ok: "登录",
							cancel: "取消",
						};

				const result = await dialog.message(
					"开始即时录制需要先登录。请登录或切换到工作室模式。",
					{
						title: "需要登录",
						buttons,
					},
				);

				if (result === buttons.yes || result === buttons.ok)
					emit("start-sign-in");
				else if (result === buttons.no && setOptions) {
					setOptions({ mode: "studio" });
					commands.setRecordingMode("studio");
				}
			} else if (result === "UpgradeRequired") commands.showWindow("Upgrade");
			else
				await dialog.message(`Error: ${result}`, {
					title: "开始录制出错",
				});
		})
		.catch((err) =>
			dialog.message(err, {
				title: "开始录制出错",
				kind: "error",
			}),
		);
}

export async function openRecordingFolder(
	projectPath: string,
	mode: RecordingMode,
) {
	const path = projectPath.replace(/[/\\]+$/, "");

	const openedContent =
		mode === "instant" &&
		(await commands.openFilePath(`${path}/content`).then(
			() => true,
			() => false,
		));

	if (openedContent) return;

	await revealItemInDir(`${path}/`);
}
