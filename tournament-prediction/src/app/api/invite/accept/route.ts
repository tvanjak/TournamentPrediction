import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

export async function POST(req: Request) {
  const { userId, token } = await req.json();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const invite = await prisma.invites.findUnique({ where: { token } });

  if (!invite || invite.expires_at < new Date() || invite.accepted) {
    return new NextResponse("Invalid or expired invite", { status: 400 });
  }

  // Check if already in group
  const exists = await prisma.user_group_members.findFirst({
    where: {
      user_group_id: invite.group_id,
      user_id: userId,
    },
  });

  if (!exists) {
    await prisma.user_group_members.create({
      data: {
        user_group_id: invite.group_id,
        user_id: userId
      },
    });
  }

  await prisma.invites.update({
    where: { token },
    data: { accepted: true },
  });

  return NextResponse.json({ success: true });
}
