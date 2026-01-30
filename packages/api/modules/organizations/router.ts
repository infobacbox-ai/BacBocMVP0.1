import { createLogoUploadUrl } from "./procedures/create-logo-upload-url";
import { generateOrganizationSlug } from "./procedures/generate-organization-slug";
import { getInvitation } from "./procedures/get-invitation";
import { getOrganization } from "./procedures/get-organization";

export const organizationsRouter = {
	generateSlug: generateOrganizationSlug,
	createLogoUploadUrl,
	getInvitation,
	getOrganization,
};
