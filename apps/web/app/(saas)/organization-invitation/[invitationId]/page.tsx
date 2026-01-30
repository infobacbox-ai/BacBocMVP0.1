import { auth } from "@repo/auth";
import { OrganizationInvitationModal } from "@saas/organizations/components/OrganizationInvitationModal";
import { AuthWrapper } from "@saas/shared/components/AuthWrapper";
import { orpcClient } from "@shared/lib/orpc-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function OrganizationInvitationPage({
	params,
}: {
	params: Promise<{ invitationId: string }>;
}) {
	const { invitationId } = await params;

	const invitation = await auth.api.getInvitation({
		query: {
			id: invitationId,
		},
		headers: await headers(),
	});

	if (!invitation) {
		redirect("/app");
	}

	const organization = await orpcClient.organizations.getOrganization({
		id: invitation.organizationId,
	});

	return (
		<AuthWrapper>
			<OrganizationInvitationModal
				organizationName={invitation.organizationName}
				organizationSlug={invitation.organizationSlug}
				logoUrl={organization?.logo || undefined}
				invitationId={invitationId}
			/>
		</AuthWrapper>
	);
}
