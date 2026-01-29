import { ORPCError } from "@orpc/client";
import { getInvitationById } from "@repo/database";
import { z } from "zod/v4";
import { publicProcedure } from "../../../orpc/procedures";

export const getInvitation = publicProcedure
	.route({
		method: "GET",
		path: "/organizations/invitations/:id",
		tags: ["Organizations"],
		summary: "Get invitation by ID",
		description: "Retrieve an organization invitation by its ID",
	})
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ input: { id } }) => {
		const invitation = await getInvitationById(id);

		if (!invitation) {
			throw new ORPCError("NOT_FOUND", {
				message: "Invitation not found",
			});
		}

		return invitation;
	});
