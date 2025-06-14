export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { Resend } from "resend";
import GroupInvite from "@/emails/GroupInvite";
import { randomBytes } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { emails, userId, userGroupName, username } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0 || !userId || !userGroupName || !username) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create a new group
    const group = await prisma.user_groups.create({
      data: {
        name: userGroupName,
        created_by: userId,
      },
    });

    const groupId = group.id;

    // Add the creator as a member
    await prisma.user_group_members.create({
      data: {
        user_id: userId,
        user_group_id: groupId,
      },
    });

    // Send invites to each email
    for (const email of emails) {
      const token = randomBytes(32).toString("hex");

      // Save invite to DB
      await prisma.invites.create({
        data: {
          token,
          group_id: groupId,
          invited_by: userId,
          email: email,
          expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
        },
      });

      // Send email
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Group Invite',
        react: GroupInvite({
          inviterName: username,
          groupName: userGroupName,
          inviteLink: `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${token}`,
        }),
      });
    }

    return NextResponse.json({ success: true, groupId });
  } catch (err) {
    console.error("[GROUP_CREATION_ERROR]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
