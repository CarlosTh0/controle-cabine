import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check route
  app.get("/api/health", async (req, res) => {
    try {
      // Consulta simples: busca 1 viagem
      await db.select().from(schema.trips).limit(1);
      res.json({ status: "ok" });
    } catch (err) {
      res.status(500).json({ status: "error", error: (err as Error).message });
    }
  });

  // Rotas REST para trips
  app.get("/api/trips", async (req, res) => {
    try {
      const trips = await db.select().from(schema.trips);
      res.json(trips);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post("/api/trips", async (req, res) => {
    try {
      const trip = req.body;
      const [created] = await db.insert(schema.trips).values(trip).returning();
      res.status(201).json(created);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  // PATCH (e PUT) para trips - id numérico
  app.patch("/api/trips/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updated = await db.update(schema.trips).set(req.body).where(eq(schema.trips.id, id)).returning();
      res.json(updated[0]);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });
  app.put("/api/trips/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updated = await db.update(schema.trips).set(req.body).where(eq(schema.trips.id, id)).returning();
      res.json(updated[0]);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });
  app.delete("/api/trips/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.delete(schema.trips).where(eq(schema.trips.id, id));
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  // Rotas REST para preBoxes
  app.get("/api/preboxes", async (req, res) => {
    try {
      const preboxes = await db.select().from(schema.preBoxes);
      res.json(preboxes);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post("/api/preboxes", async (req, res) => {
    try {
      const prebox = req.body;
      const [created] = await db.insert(schema.preBoxes).values(prebox).returning();
      res.status(201).json(created);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  // PATCH (e PUT) para preBoxes - id numérico
  app.patch("/api/preboxes/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updated = await db.update(schema.preBoxes).set(req.body).where(eq(schema.preBoxes.id, id)).returning();
      res.json(updated[0]);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });
  app.put("/api/preboxes/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updated = await db.update(schema.preBoxes).set(req.body).where(eq(schema.preBoxes.id, id)).returning();
      res.json(updated[0]);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });
  app.delete("/api/preboxes/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.delete(schema.preBoxes).where(eq(schema.preBoxes.id, id));
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}

// ATENÇÃO: Para usar IDs alfanuméricos (ex: 'V1234'), altere o schema do banco e do Drizzle para que o campo id seja string/varchar, não serial/number.
