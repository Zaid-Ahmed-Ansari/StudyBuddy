import dbConnect from "@/src/lib/dbConnect";
import  {StudyClubModel } from "@/src/model/StudyClub";
import { z } from "zod";

const partyNameSchema = z.object({
  name: z.string().min(3).max(50, "Party name too long"),
});

export async function GET(request: Request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const rawName = searchParams.get("partyName");

  if (!rawName) {
    return Response.json({ success: false, message: "Party name is required" }, { status: 400 });
  }

  const result = partyNameSchema.safeParse({ name: rawName });

  if (!result.success) {
    const nameError = result.error.format().name?._errors ?? [];
    return Response.json(
      { success: false, message: nameError.join(", ") || "Invalid name" },
      { status: 400 }
    );
  }

  const existingClub = await StudyClubModel.findOne({
  partyName: { $regex: `^${result.data.name}$`, $options: 'i' }
});
  if (existingClub) {
    return Response.json({ success:true, available: false, message: "Party name already exists" }, { status: 200 });
  }

  return Response.json({ success:true, available: true, message: "Party name is available" }, { status: 200 });
}
