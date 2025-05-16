import { pgTable, text, serial, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define status enum
export const preBoxStatusEnum = pgEnum('pre_box_status', ['LIVRE', 'VIAGEM', 'BLOQUEADO']);

// Pre-Box table
export const preBoxes = pgTable("pre_boxes", {
  id: serial("id").primaryKey(),
  boxId: text("box_id").notNull().unique(), // The actual PRE-BOX number (50-55, 300-356)
  status: preBoxStatusEnum("status").notNull().default('LIVRE'),
  tripId: text("trip_id"),
});

// Trips table
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  tripId: text("trip_id").notNull().unique(), // The V1234 format ID
  date: text("date").notNull(),
  time: text("time").notNull(),
  oldTrip: text("old_trip"),
  preBox: text("pre_box").notNull(),
  boxD: text("box_d").notNull(),
  quantity: text("quantity").notNull(),
  shift: text("shift").notNull(),
  region: text("region").notNull(),
  status: text("status").notNull(),
  manifestDate: text("manifest_date").notNull(),
});

// Schemas for validation
export const insertPreBoxSchema = createInsertSchema(preBoxes);

export const insertTripSchema = createInsertSchema(trips);

// Types
export type InsertPreBox = z.infer<typeof insertPreBoxSchema>;
export type PreBox = typeof preBoxes.$inferSelect;

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;

// Custom types for frontend use
export type PreBoxStatus = "LIVRE" | "VIAGEM" | "BLOQUEADO";

export type PreBoxDisplay = {
  id: string;
  status: PreBoxStatus;
  tripId?: string;
};

export type TripDisplay = {
  id: string;
  date: string;
  time: string;
  oldTrip: string;
  preBox: string;
  boxD: string;
  quantity: string;
  shift: string;
  region: string;
  status: string;
  manifestDate: string;
};

// User type definition
export interface User {
  id: number;
  username: string;
  password: string;
}
