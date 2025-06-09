import { prisma } from '@/lib/prisma-client';
import { NextResponse } from 'next/server';

import { Resend } from 'resend';
import GroupInvite from "@/emails/GroupInvite"
import { randomBytes } from "crypto";


const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const token = randomBytes(32).toString("hex");

        const { email, username, userId, userGroupId, userGroupName } = await request.json()

        await prisma.invites.create({
        data: {
            token,
            group_id: userGroupId,
            invited_by: userId,
            email: email,
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
        },
        });


        const response = await resend.emails.send({
            from: 'toni.vanjak@gmail.com',
            to: email,
            subject: 'Group Invite',
            react: GroupInvite({
                inviterName: username,
                groupName: userGroupName,
                inviteLink: `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${token}`,
            }),
        });
        console.log("Email sent response:", response);

        return NextResponse.json({ success: true }); // ✅ This is necessary
    } catch (err) {
        console.error("Email sending error:", err);
        return new NextResponse("Internal Server Error", { status: 500 }); // ✅ Also necessary
    }
}