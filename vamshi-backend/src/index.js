const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Simple in-memory rates store (persist with DB later if required)
let RATES = {
  Shirt: 500,
  Kurta: 700,
  "Short Kurta": 650,
  Safari: 900,
  Sherwani: 2500,
  Suit: 3000,
  Jacket: 1500,
  "Open Sherwani": 2700,
  Pant: 600,
  Vijar: 600,
  Jeans: 800,
};

// GET rates
app.get("/api/rates", (req, res) => {
  res.json(RATES);
});

// PUT rates (admin)
app.put("/api/rates", (req, res) => {
  const payload = req.body || {};
  // update only provided keys
  Object.keys(payload).forEach((k) => {
    if (payload[k] != null) RATES[k] = Number(payload[k]) || 0;
  });
  res.json(RATES);
});


// ✅ Health check (useful for testing from browser/curl)
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1;`;
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    console.error("❌ Health check error:", err);
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

// ✅ Helper to get next 5-digit sequential customer code
async function getNextCustomerCode() {
  const lastCustomer = await prisma.customer.findFirst({
    orderBy: { customerCode: "desc" },
  });

  if (!lastCustomer) return "10001";

  const lastCodeNum = parseInt(lastCustomer.customerCode, 10);
  const nextCode = (lastCodeNum + 1).toString().padStart(5, "0");
  return nextCode;
}

// ✅ Resolve customer by either numeric DB id or 5-digit code
async function resolveCustomer(identifier) {
  if (!identifier) return null;

  // If all digits, try numeric id first
  if (/^\d+$/.test(identifier)) {
    const idNum = parseInt(identifier, 10);
    const byId = await prisma.customer.findUnique({ where: { id: idNum } });
    if (byId) return byId;
  }

  // Then try by customerCode (string)
  return await prisma.customer.findUnique({ where: { customerCode: identifier.toString() } });
}

// ✅ Create a new customer
app.post("/api/customers", async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    const newCode = await getNextCustomerCode();

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        customerCode: newCode,
      },
    });

    res.json(customer);
  } catch (error) {
    console.error("❌ Error creating customer:", error);
    res.status(500).json({ error: "Failed to create customer" });
  }
});

// ✅ List/search customers (SQLite-safe)
app.get("/api/customers", async (req, res) => {
  const q = (req.query.q || "").toString().trim();

  try {
    const where = q
      ? {
          OR: [
            // Note: SQLite doesn't support mode: "insensitive"
            { name: { contains: q } },
            { customerCode: { contains: q } },
          ],
        }
      : {}; // no filter if q empty

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(customers);
  } catch (err) {
    console.error("❌ Error fetching customers:", err);
    res.status(500).json({ error: err.message || "Failed to fetch customers" });
  }
});

// ✅ Get a single customer by id or code
app.get("/api/customers/:id", async (req, res) => {
  try {
    const customer = await resolveCustomer(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (err) {
    console.error("❌ Error getting customer:", err);
    res.status(500).json({ error: "Failed to get customer" });
  }
});

// ✅ Get all measurements for a customer
app.get("/api/customers/:id/measurements", async (req, res) => {
  try {
    const customer = await resolveCustomer(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const list = await prisma.measurement.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(list);
  } catch (err) {
    console.error("❌ Error getting measurements:", err);
    res.status(500).json({ error: "Failed to get measurements" });
  }
});

// ✅ Save measurements (top/bottom)

app.post("/api/customers/:id/measurements", async (req, res) => {
  try {
    const customer = await resolveCustomer(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    // Expected body: { type, data = {}, comments, quantity, groupId, deliveryDate? }
    const { type, data = {}, comments, quantity, groupId, deliveryDate } = req.body;

    // Keep groupId and deliveryDate inside data JSON
    const dataToStore = { ...data };
    if (groupId) dataToStore.groupId = groupId;
    if (deliveryDate) dataToStore.deliveryDate = deliveryDate;

    const measurement = await prisma.measurement.create({
      data: {
        customerId: customer.id,
        type: (type || "").toString().toLowerCase(),
        data: dataToStore,
        comments,
        quantity,
      },
    });

    res.json(measurement);
  } catch (err) {
    console.error("❌ Error saving measurement:", err);
    res.status(500).json({ error: "Failed to save measurement" });
  }
});


// ✅ Delete a customer (and their measurements)
app.delete("/api/customers/:id", async (req, res) => {
  try {
    const customer = await resolveCustomer(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    await prisma.measurement.deleteMany({ where: { customerId: customer.id } });
    await prisma.customer.delete({ where: { id: customer.id } });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting customer:", err);
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

app.post("/api/customers/:id/orders", async (req, res) => {
  try {
    const customer = await resolveCustomer(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const { garments = [] } = req.body;

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        garments: {
          create: garments.map((g) => ({
            type: g.type,
            quantity: g.quantity || 1,
            status: "RECEIVED",
          })),
        },
      },
      include: { garments: true },
    });

    res.json(order);
  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        garments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.patch("/api/garments/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const garment = await prisma.garment.update({
      where: { id: Number(req.params.id) },
      data: { status },
    });

    res.json(garment);
  } catch (err) {
    console.error("❌ Error updating garment status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        customer: true,
        garments: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("❌ Error fetching order:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

app.get("/api/orders/phone/:phone", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        customer: {
          phone: req.params.phone,
        },
      },
      include: {
        customer: true,
        garments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching customer orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

//Updating status of order  
  app.patch("/api/orders/:id/status", async (req, res) => {
     const { status } = req.body;

     const order = await prisma.order.update({
        where: { id: Number(req.params.id) },
       data: { status }
     });

     res.json(order);
    });
  

app.patch("/api/orders/:id/bill", async (req, res) => {
  try {
    const { paidAmount, deliveryDate } = req.body;

    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: {
        paidAmount: Number(paidAmount || 0),
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      },
    });

    res.json(order);
  } catch (err) {
    console.error("❌ Error saving bill:", err);
    res.status(500).json({ error: "Failed to save bill" });
  }
});


// ✅ List measurements with grouping logic
app.get("/api/measurements", async (req, res) => {
  const q = (req.query.q || "").toString().trim();

  try {
    // Get measurements that belong to customers matching q (if any)
    // The `where` uses a nested customer filter so we get all matching measurements.
    const where = q
      ? {
          OR: [
            { customer: { name: { contains: q } } },
            { customer: { phone: { contains: q } } },
            { customer: { customerCode: { contains: q } } },
          ],
        }
      : {};

    // fetch all matching measurements with customer data
    const list = await prisma.measurement.findMany({
      where,
      include: { customer: true },
      orderBy: { createdAt: "asc" }, // order oldest -> newest to make pairing predictable
    });

    // Step A: group by explicit groupId found in measurement.data.groupId
    const groupedById = {};
    const ungrouped = [];

    for (const m of list) {
      const groupId = m.data && typeof m.data === "object" ? m.data.groupId : undefined;
      if (groupId) {
        if (!groupedById[groupId]) groupedById[groupId] = [];
        groupedById[groupId].push(m);
      } else {
        // push to ungrouped for sequential pairing later
        ungrouped.push(m);
      }
    }

    // Build result sets from explicit groups (preserve chronological order inside each group)
    const resultSets = [];

    for (const gid of Object.keys(groupedById)) {
      const arr = groupedById[gid].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      // convert to a set object: try to find top and bottom entries
      const set = { groupId: gid, createdAt: arr[0].createdAt, top: null, bottom: null, raw: arr };
      for (const m of arr) {
        const t = (m.type || "").toString().toLowerCase();
        if (t.includes("top") || t === "shirt" || t === "kurta" || t === "sherwani" || t === "jacket" || t === "open sherwani") {
          set.top = m;
        } else {
          // treat everything else as bottom (pant/jeans/vijar)
          set.bottom = set.bottom ? [set.bottom, m] : m; // allow multiple bottoms if they exist
        }
      }
      resultSets.push(set);
    }

    // Step B: pair remaining ungrouped measurements sequentially into top/bottom sets
    // We'll go through ungrouped array (already in ascending time) and form pairs:
    // strategy: accumulate consecutive measurements, create sets of two (bottom+top or top+bottom)
    for (let i = 0; i < ungrouped.length; ) {
      const a = ungrouped[i];
      const b = ungrouped[i + 1];
      const set = { groupId: null, createdAt: a.createdAt, top: null, bottom: null, raw: [] };
      // classify a
      const ta = (a.type || "").toString().toLowerCase();
      if (ta.includes("top") || ta === "shirt" || ta === "kurta" || ta === "sherwani" || ta === "jacket") {
        set.top = a;
      } else {
        set.bottom = a;
      }
      set.raw.push(a);

      if (b) {
        const tb = (b.type || "").toString().toLowerCase();
        if ((set.top && (tb.includes("top") || tb === "shirt" || tb === "kurta")) ||
            (set.bottom && !(tb.includes("top") || tb === "shirt" || tb === "kurta"))) {
          // if same side, we'll still attach as additional item: prefer pairing different types;
          // but fallback: if both same, assign second as top if top empty else bottom
        }
        // prefer putting b into the missing slot
        if (!set.top && (tb.includes("top") || tb === "shirt" || tb === "kurta" || tb === "sherwani" || tb === "jacket")) {
          set.top = b;
        } else if (!set.bottom) {
          set.bottom = b;
        } else {
          // both slots filled, leave b for next iteration as new set start
        }
        set.raw.push(b);
        // increment by 2 if we consumed b else by 1
        i += 2;
      } else {
        i += 1;
      }
      resultSets.push(set);
    }

    // Sort result sets newest first for display convenience
    resultSets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Final response: an array of { groupId, createdAt, top, bottom, raw }
    res.json(resultSets);
  } catch (err) {
    console.error("❌ Error fetching measurements:", err);
    res.status(500).json({ error: "Failed to fetch measurements" });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
