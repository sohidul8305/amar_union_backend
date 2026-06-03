const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hz6ypdj.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");

    const db = client.db('amar_union_db');
    
    // সব কালেকশন
    const WarishCollection = db.collection('warish');
    const PowerOfAttorneyCollection = db.collection('power_of_attorney');
    const DeathCertificateCollection = db.collection('death_certificates');
    const LandlessCertificateCollection = db.collection('landless_certificates');
    const TradeLicenseCollection = db.collection('trade_licenses');   // নতুন

    // ==================== 1. ওয়ারিশ সনদ ====================
    app.post('/api/warish', async (req, res) => {
      try {
        const warishData = req.body;
        const finalData = {
          ...warishData,
          warishId: 'WRS' + Math.floor(100000 + Math.random() * 900000),
          status: 'Pending',
          submittedAt: new Date()
        };
        const result = await WarishCollection.insertOne(finalData);
        res.status(201).send({ success: true, result, warishId: finalData.warishId });
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });

    // ==================== 2. পাওয়ার অফ অ্যাটর্নি ====================
    app.post('/api/power-of-attorney', async (req, res) => {
      try {
        const poaData = req.body;
        const finalData = {
          ...poaData,
          poaId: 'POA' + Math.floor(100000 + Math.random() * 900000),
          status: 'Pending',
          submittedAt: new Date()
        };
        const result = await PowerOfAttorneyCollection.insertOne(finalData);
        res.status(201).send({ success: true, result, poaId: finalData.poaId });
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });

    // ==================== 3. মৃত্যু সনদ ====================
    app.post('/api/death-certificate', async (req, res) => {
      try {
        const deathData = req.body;
        const finalData = {
          ...deathData,
          deathCertId: 'DTH' + Math.floor(100000 + Math.random() * 900000),
          status: 'Pending',
          submittedAt: new Date()
        };
        const result = await DeathCertificateCollection.insertOne(finalData);
        res.status(201).send({ success: true, result, deathCertId: finalData.deathCertId });
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });

    // ==================== 4. ভূমিহীন সনদ ====================
    app.post('/api/landless-certificate', async (req, res) => {
      try {
        const landlessData = req.body;
        const finalData = {
          ...landlessData,
          landlessId: 'LND' + Math.floor(100000 + Math.random() * 900000),
          status: 'Pending',
          submittedAt: new Date()
        };
        const result = await LandlessCertificateCollection.insertOne(finalData);
        res.status(201).send({ success: true, result, landlessId: finalData.landlessId });
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });

    // ==================== 5. ট্রেড লাইসেন্স (নতুন) ====================
    app.post('/license', async (req, res) => {
      try {
        const licenseData = req.body;
        console.log("Trade License Data:", licenseData);

        // ইউনিক আইডি ও মেটাডেটা যোগ
        const finalData = {
          ...licenseData,
          applicationId: 'TL' + Math.floor(100000 + Math.random() * 900000), // frontend এ applicationId চাচ্ছে
          status: 'Pending',
          submittedAt: new Date()
        };

        const result = await TradeLicenseCollection.insertOne(finalData);
        
        res.status(201).send({
          success: true,
          result,
          applicationId: finalData.applicationId   // frontend এটা দেখবে
        });
      } catch (error) {
        console.error("Trade License insertion error:", error);
        res.status(500).send({
          success: false,
          message: "Database insertion failed",
          error: error.message
        });
      }
    });

    // পিং টেস্ট
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB & all endpoints ready!");

  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
}

run().catch(console.dir);

// রুট রাউট
app.get('/', (req, res) => {
  res.send('Amar Union Server is Running');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});