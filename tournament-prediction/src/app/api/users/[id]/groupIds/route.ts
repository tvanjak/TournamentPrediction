import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client"; // Adjust path if needed

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      console.error("No id provided in request params.");
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Log id for debugging
    console.log("Fetching group IDs for id:", id);

    // Query the database to find the user's group IDs
    const userGroups = await prisma.user_group_members.findMany({
      where: { user_id: parseInt(id) },
      select: { user_group_id: true },
    });

    if (userGroups.length === 0) {
      console.error(`No groups found for id: ${id}`);
      return new NextResponse("User is not a member of any groups", { status: 404 });
    }

    // Extract group IDs
    const groupIds = userGroups.map((group) => group.user_group_id);

    // Return the group IDs as JSON
    return NextResponse.json({ groupIds });
  } catch (error) {
    console.error("[GET_GROUP_IDS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
