// 汉化版：商业授权已随免费版附带，无需单独购买
export default function Page() {
	return (
		<div class="cap-settings-page flex relative flex-col gap-3 items-center p-4 mx-auto h-full custom-scroll">
			<div class="flex justify-center items-center w-full h-screen">
				<div class="flex flex-col items-center p-6 mx-auto space-y-3 w-full max-w-md text-white rounded-3xl border bg-gray-2 border-gray-3">
					<div class="flex flex-col gap-2 items-center">
						<h3 class="text-2xl font-medium text-gray-12">商业授权</h3>
					</div>
					<p class="text-center text-gray-11">
						本免费版已包含商业授权，可放心用于个人及商业用途。
					</p>
					<div class="flex flex-col gap-1 items-center w-full py-2 rounded-xl bg-gray-3">
						<span class="text-sm text-gray-11">授权状态</span>
						<span class="text-lg font-semibold text-green-500">
							已激活（免费版内置）
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
