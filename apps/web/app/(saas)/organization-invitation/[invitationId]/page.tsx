import { getOrganizationById } from "@repo/database";
import { getInvitation } from "@saas/auth/lib/server";
import { OrganizationInvitationModal } from "@saas/organizations/components/OrganizationInvitationModal";
import { AuthWrapper } from "@saas/shared/components/AuthWrapper";
import { redirect } from "next/navigation";

export default async function OrganizationInvitationPage({
	params,
}: {
	params: Promise<{ invitationId: string }>;
}) {
	const { invitationId } = await params;

	const invitation = await getInvitation(invitationId);

	if (!invitation) {
		redirect("/app");
	}

	const organization = await getOrganizationById(invitation.organizationId);

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
