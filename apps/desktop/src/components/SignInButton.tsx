import { Button } from "@cap/ui-solid";

import type { ComponentProps } from "solid-js";

export function SignInButton(
	props: Omit<ComponentProps<typeof Button>, "onClick">,
) {
	return (
		<Button
			size="md"
			class="flex grow justify-center items-center"
			{...props}
			variant="gray"
			disabled
			onClick={() => {}}
		>
			{props.children ?? "本地版 · 无需登录"}
		</Button>
	);
}
