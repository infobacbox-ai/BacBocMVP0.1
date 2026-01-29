import { ORPCError } from "@orpc/client";
import { getOrganizationById } from "@repo/database";
import { z } from "zod";
import { publicProcedure } from "../../../orpc/procedures";

export const getOrganization = publicProcedure
	.route({
		method: "GET",
		path: "/organizations/:id",
		tags: ["Organizations"],
		summary: "Get organization by ID",
		description:
			"Retrieve an organization by its ID with members and invitations",
	})
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ input: { id } }) => {
		const organization = await getOrganizationById(id);

		if (!organization) {
			throw new ORPCError("NOT_FOUND", {
				message: "Organization not found",
			});
		}

		return organization;
	});
