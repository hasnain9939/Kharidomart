import { NextRequest } from "next/server";
import { POST as createOrderHandler } from "@/app/api/create-order/route";

export async function POST(req: NextRequest) {
  return createOrderHandler(req);
}
