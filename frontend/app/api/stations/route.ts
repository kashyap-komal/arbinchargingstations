import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  CONNECTOR_TYPES,
  createStation,
  getAllStations,
  STATION_STATUSES,
} from "@/lib/stations";

export const runtime = "nodejs";

const stationSchema = z.object({
  stationName: z.string().trim().min(1),
  locationAddress: z.string().trim().min(1),
  pinCode: z.string().trim().min(3).max(10),
  connectorType: z.enum(CONNECTOR_TYPES),
  status: z.enum(STATION_STATUSES),
  image: z
    .string()
    .trim()
    .url()
    .or(z.literal(""))
    .optional(),
  locationLink: z.string().trim().url(),
});

function hasAdminAccess(request: NextRequest) {
  const adminKey = process.env.ADMIN_KEY ?? "admin123";
  const provided = request.headers.get("x-admin-key");
  return provided === adminKey;
}

export async function GET() {
  try {
    const stations = getAllStations();
    return NextResponse.json({ stations }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stations." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = stationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid station payload.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const station = createStation(parsed.data);
    return NextResponse.json({ station }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create station." }, { status: 500 });
  }
}
