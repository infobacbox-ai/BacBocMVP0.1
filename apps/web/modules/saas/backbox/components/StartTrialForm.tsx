"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BACKBOX_VALIDATION, ERROR_CODES } from "@repo/shared";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation } from "@tanstack/react-query";
import { Alert, AlertTitle } from "@ui/components/alert";
import { Button } from "@ui/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import { Textarea } from "@ui/components/textarea";
import { cn } from "@ui/lib";
import { AlertCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { extractApiError } from "../lib/extract-api-error";

interface StartTrialFormProps {
	accessState: "TRIAL_AVAILABLE" | "PAID";
}

export function StartTrialForm({
	accessState: _accessState,
}: StartTrialFormProps) {
	const t = useTranslations();
	const router = useRouter();

	const formSchema = z.object({
		sourceText: z
			.string()
			.min(
				BACKBOX_VALIDATION.SOURCE_TEXT_MIN_LENGTH,
				t("backbox.start.errors.sourceTextRequired"),
			)
			.max(
				BACKBOX_VALIDATION.SOURCE_TEXT_MAX_LENGTH,
				t("backbox.start.errors.sourceTextTooLong", {
					max: BACKBOX_VALIDATION.SOURCE_TEXT_MAX_LENGTH,
				}),
			),
		title: z
			.string()
			.max(
				BACKBOX_VALIDATION.TITLE_MAX_LENGTH,
				t("backbox.start.errors.titleTooLong", {
					max: BACKBOX_VALIDATION.TITLE_MAX_LENGTH,
				}),
			)
			.optional()
			.or(z.literal("")),
	});

	type FormValues = z.infer<typeof formSchema>;

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			sourceText: "",
			title: "",
		},
	});

	const sourceText = form.watch("sourceText");
	const charCount = sourceText.length;
	const maxChars = BACKBOX_VALIDATION.SOURCE_TEXT_MAX_LENGTH;
	const warningThreshold = Math.floor(maxChars * 0.9); // 90% = 27000 chars
	const isWarning = charCount >= warningThreshold && charCount <= maxChars;
	const isError = charCount > maxChars;

	const [lastErrorCode, setLastErrorCode] = useState<string | null>(null);

	const startTrialMutation = useMutation(
		orpc.backbox.startTrialProject.mutationOptions(),
	);

	const onSubmit = form.handleSubmit(async (values) => {
		setLastErrorCode(null);
		try {
			const result = await startTrialMutation.mutateAsync({
				sourceText: values.sourceText,
				title: values.title || undefined,
			});

			router.push(`/backbox/project/${result.projectId}`);
		} catch (error) {
			const apiError = extractApiError(error);
			const errorCode = apiError?.errorCode;

			setLastErrorCode(errorCode ?? null);

			if (errorCode === ERROR_CODES.QUOTA_REACHED) {
				form.setError("root", {
					message: t("backbox.start.errors.trialUsed"),
				});
			} else {
				form.setError("root", {
					message: t("backbox.start.errors.submitFailed"),
				});
			}
		}
	});

	const rootError = form.formState.errors.root;
	const isQuotaReached =
		rootError && lastErrorCode === ERROR_CODES.QUOTA_REACHED;

	return (
		<Form {...form}>
			<form
				onSubmit={onSubmit}
				className="flex flex-col items-stretch gap-4"
			>
				{rootError && (
					<Alert variant="error" role="alert">
						<AlertCircleIcon />
						<AlertTitle className="flex items-center gap-2">
							{rootError.message}
							{isQuotaReached && (
								<Link
									href="/pricing"
									className="underline hover:no-underline"
								>
									{t("backbox.start.errors.upgradeLink")}
								</Link>
							)}
						</AlertTitle>
					</Alert>
				)}

				<FormField
					control={form.control}
					name="sourceText"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								{t("backbox.start.form.sourceText.label")}
							</FormLabel>
							<FormControl>
								<Textarea
									{...field}
									rows={10}
									placeholder={t(
										"backbox.start.form.sourceText.placeholder",
									)}
								/>
							</FormControl>
							<div className="flex items-center justify-between">
								<FormMessage />
								<span
									className={cn(
										"text-xs text-muted-foreground",
										isWarning && "text-warning",
										isError && "text-destructive",
									)}
								>
									{charCount.toLocaleString()} /{" "}
									{maxChars.toLocaleString()}
								</span>
							</div>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								{t("backbox.start.form.title.label")}
							</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder={t(
										"backbox.start.form.title.placeholder",
									)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					loading={startTrialMutation.isPending}
					className="w-full"
				>
					{t("backbox.start.form.submit")}
				</Button>
			</form>
		</Form>
	);
}
