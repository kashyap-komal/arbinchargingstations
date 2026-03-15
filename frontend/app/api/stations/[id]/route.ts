import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  CONNECTOR_TYPES,
  deleteStation,
  getStationById,
  STATION_STATUSES,
  updateStation,
} from "@/lib/stations";

export const runtime = "nodejs";

const stationSchema = z.object({
  stationName: z.string().trim().min(1),
  locationAddress: z.string().trim().min(1),
  pinCode: z.string().trim().min(3).max(10),
  connectorType: z.enum(CONNECTOR_TYPES),
  status: z.enum(STATION_STATUSES),
  image: z.string().trim().url().or(z.literal("")).optional(),
  locationLink: z.string().trim().url(),
});

function hasAdminAccess(request: NextRequest) {
  const adminKey = process.env.ADMIN_KEY ?? "admin123";
  return request.headers.get("x-admin-key") === adminKey;
}

function parseId(idParam: string) {
  const id = Number(idParam);
  return Number.isInteger(id) && id >= 1 ? id : null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) {
    return NextResponse.json({ error: "Invalid station id." }, { status: 400 });
  }

  try {
    const station = getStationById(id);
    if (!station) {
      return NextResponse.json({ error: "Station not found." }, { status: 404 });
    }
    return NextResponse.json({ station }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch station." },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) {
    return NextResponse.json({ error: "Invalid station id." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = stationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid station payload.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const station = updateStation(id, parsed.data);
    if (!station) {
      return NextResponse.json({ error: "Station not found." }, { status: 404 });
    }
    return NextResponse.json({ station }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to update station." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) {
    return NextResponse.json({ error: "Invalid station id." }, { status: 400 });
  }

  try {
    const deleted = deleteStation(id);
    if (!deleted) {
      return NextResponse.json({ error: "Station not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete station." },
      { status: 500 },
    );
  }
}
