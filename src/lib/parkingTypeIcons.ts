import { Car, Motorbike, ParkingCircle, type LucideIcon } from "lucide-react";
import type { ParkingType } from "@/types/parking";

/** One place mapping a `Parking.type` to its lucide symbol + label — shared by the admin form's picker, the Owner Portal's display, and the public availability summary, so none of them can drift apart or show the wrong icon for a bike space. */
export const PARKING_TYPE_MAP: Record<ParkingType, { icon: LucideIcon; label: string }> = {
  car: { icon: Car, label: "Car" },
  bike: { icon: Motorbike, label: "Bike" },
  "reserved-visitor": { icon: ParkingCircle, label: "Reserved / Visitor" },
};
