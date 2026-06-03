const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// মঙ্গোডিবি ইউরিআই (URI)
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
    // ডেটাবেজ কানেক্ট করা
    await client.connect();

    const db = client.db('amar_union_db');
    
    // কালেকশন সমূহ
    const TradelicenseCollection = db.collection('license');
    const PremisesCollection = db.collection('premises');
    const WarishCollection = db.collection('warish');
    const FamilyCollection = db.collection('family_certificates'); // 💡 পারিবারিক সনদের জন্য আলাদা কালেকশন

    // ==========================================
    // ১. ট্রেড লাইসেন্স সাবমিট এপিআই
    // ==========================================
    app.post('/license', async (req, res) => {
      try {
        const license = req.body;
        const finalLicenseData = {
          ...license,
          applicationId: 'TRD' + Math.floor(100000 + Math.random() * 900000),
          status: 'Pending',
          submittedAt: new Date()
        };
        const result = await TradelicenseCollection.insertOne(finalLicenseData);
        res.status(201).send({ success: true, result, applicationId: finalLicenseData.applicationId });
      } catch (error) {
        res.status(500).send({ success: false, message: "Database insertion failed", error });
      }
    });

    // ==========================================
    // ২. প্রাঙ্গণ লাইসেন্স সাবমিট এপিআই
    // ==========================================
    app.post('/premises', async (req, res) => {
      try {
        const premisesData = req.body;
        const finalPremisesData = {
          ...premisesData,
          premisesId: 'PRM' + Math.floor(100000 + Math.random() * 900000),
          status: 'Pending',
          submittedAt: new Date()
        };
        const result = await PremisesCollection.insertOne(finalPremisesData);
        res.status(201).send({ success: true, result, premisesId: finalPremisesData.premisesId });
      } catch (error) {
        res.status(500).send({ success: false, message: "Database insertion failed", error });
      }
    });

    // ==========================================
    // ৩. ওয়ারিশ সনদপত্র সাবমিট এপিআই
    // ==========================================
    app.post('/warish', async (req, res) => {
      try {
        const warishData = req.body;
        const finalWarishData = {
          ...warishData,
          warishId: 'WRS' + Math.floor(100000 + Math.random() * 900000),
          status: 'Pending',
          submittedAt: new Date()
        };
        const result = await WarishCollection.insertOne(finalWarishData);
        res.status(201).send({ success: true, result, warishId: finalWarishData.warishId });
      } catch (error) {
        console.error("Warish error:", error);
        res.status(500).send({ success: false, message: "Database insertion failed", error });
      }
    });

    // ==========================================
    // ৪. পারিবারিক সনদপত্র সাবমিট এপিআই (নতুন যুক্ত)
    // ==========================================
    app.post('/family-certificate', async (req, res) => {
      try {
        const familyData = req.body;
        
        // ইউনিক আইডি জেনারেট ও মেটাডেটা সংযুক্তি
        const finalFamilyData = {
          ...familyData,
          familyCertificateId: 'FAM' + Math.floor(100000 + Math.random() * 900000),
          status: 'Pending',
          submittedAt: new Date()
        };

        const result = await FamilyCollection.insertOne(finalFamilyData);
        res.status(201).send({ 
          success: true, 
          result, 
          familyCertificateId: finalFamilyData.familyCertificateId 
        });
      } catch (error) {
        console.error("Family certificate application error:", error);
        res.status(500).send({ success: false, message: "Database insertion failed", error });
      }
    });

    // সফল কানেকশন চেক করার জন্য পিং কমান্ড
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Amar Union Server is Running');
});

app.listen(port, () => {
  console.log(`Amar Union Server listening on port ${port}`);
});