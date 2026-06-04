const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hz6ypdj.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true } });

async function run() {
  try {
    await client.connect();
    const db = client.db('amar_union_db');

    // সব কালেকশন
    const FamilyCertificateCollection = db.collection('family_certificates');
    const WarishCollection = db.collection('warish');
    const CitizenshipCollection = db.collection('citizenship_certificates');
    const SuccessorCollection = db.collection('successor_certificates');
    const PowerOfAttorneyCollection = db.collection('power_of_attorney');
    const DeathCertificateCollection = db.collection('death_certificates');
    const LandlessCertificateCollection = db.collection('landless_certificates');
    const TradeLicenseCollection = db.collection('trade_licenses');
    const PremisesCollection = db.collection('premises');

    // ------------------- ইউজারের সব আবেদন -------------------
    app.get('/api/my-applications/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email: email };
        const allApps = [
          ...(await FamilyCertificateCollection.find(query).toArray()).map(a => ({ id: a.familyCertificateId, type: 'পারিবারিক সনদ', date: a.submittedAt, status: a.status || 'Pending' })),
          ...(await WarishCollection.find(query).toArray()).map(a => ({ id: a.warishId, type: 'ওয়ারিশ সনদ', date: a.submittedAt, status: a.status || 'Pending' })),
          ...(await CitizenshipCollection.find(query).toArray()).map(a => ({ id: a.citizenshipId, type: 'নাগরিকত্ব সনদ', date: a.submittedAt, status: a.status || 'Pending' })),
          ...(await SuccessorCollection.find(query).toArray()).map(a => ({ id: a.successorId, type: 'উত্তরাধিকারী সনদ', date: a.submittedAt, status: a.status || 'Pending' })),
          ...(await PowerOfAttorneyCollection.find(query).toArray()).map(a => ({ id: a.poaId, type: 'পাওয়ার অফ অ্যাটর্নি', date: a.submittedAt, status: a.status || 'Pending' })),
          ...(await DeathCertificateCollection.find(query).toArray()).map(a => ({ id: a.deathCertId, type: 'মৃত্যু সনদ', date: a.submittedAt, status: a.status || 'Pending' })),
          ...(await LandlessCertificateCollection.find(query).toArray()).map(a => ({ id: a.landlessId, type: 'ভূমিহীন সনদ', date: a.submittedAt, status: a.status || 'Pending' })),
          ...(await TradeLicenseCollection.find(query).toArray()).map(a => ({ id: a.applicationId, type: 'ট্রেড লাইসেন্স', date: a.submittedAt, status: a.status || 'Pending' })),
          ...(await PremisesCollection.find(query).toArray()).map(a => ({ id: a.premisesId, type: 'প্রাঙ্গণ লাইসেন্স', date: a.submittedAt, status: a.status || 'Pending' }))
        ];
        allApps.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.send(allApps);
      } catch (error) { res.status(500).send({ success: false, message: error.message }); }
    });

    // ------------------- ১. পারিবারিক সনদ -------------------
    app.post('/api/family-certificate', async (req, res) => {
      try {
        const data = req.body;
        const finalData = { ...data, familyCertificateId: 'FAM' + Date.now(), status: 'Pending', submittedAt: new Date() };
        const result = await FamilyCertificateCollection.insertOne(finalData);
        res.status(201).send({ success: true, result, familyCertificateId: finalData.familyCertificateId });
      } catch (error) { res.status(500).send({ success: false, message: error.message }); }
    });

    // ------------------- ২. ওয়ারিশ সনদ -------------------
// ------------------- ২. ওয়ারিশ সনদ -------------------
app.post('/api/warish', async (req, res) => {
  try {
    const data = req.body;
    
    // ফ্রন্টএন্ড থেকে আসা applicantInfo এর ইমেইলটি রুট লেভেলে 'email' নামে সেট করা হচ্ছে
    const finalData = { 
      ...data, 
      email: data.email || data.applicantInfo?.applicantEmail, // সেফটি চেক
      warishId: 'WRS' + Date.now(), 
      status: 'Pending', 
      submittedAt: new Date() 
    };
    
    const result = await WarishCollection.insertOne(finalData);
    res.status(201).send({ success: true, result, warishId: finalData.warishId });
  } catch (error) { 
    res.status(500).send({ success: false, message: error.message });
  }
});

    // ------------------- ৩. নাগরিকত্ব সনদ -------------------
    app.post('/api/citizenship-certificate', async (req, res) => {
      try {
        const data = req.body;
        const finalData = { ...data, citizenshipId: 'CTZ' + Date.now(), status: 'Pending', submittedAt: new Date() };
        const result = await CitizenshipCollection.insertOne(finalData);
        res.status(201).send({ success: true, result, citizenshipId: finalData.citizenshipId });
      } catch (error) { res.status(500).send({ success: false, message: error.message }); }
    });

    // ------------------- ৪. উত্তরাধিকারী সনদ -------------------
    app.post('/api/successor-certificate', async (req, res) => {
      try {
        const data = req.body;
        const finalData = { ...data, successorId: 'SUC' + Date.now(), status: 'Pending', submittedAt: new Date() };
        const result = await SuccessorCollection.insertOne(finalData);
        res.status(201).send({ success: true, result, successorId: finalData.successorId });
      } catch (error) { res.status(500).send({ success: false, message: error.message }); }
    });

    // ------------------- ৫. পাওয়ার অফ অ্যাটর্নি -------------------
    app.post('/api/power-of-attorney', async (req, res) => {
      try {
        const data = req.body;
        const finalData = { ...data, poaId: 'POA' + Date.now(), status: 'Pending', submittedAt: new Date() };
        const result = await PowerOfAttorneyCollection.insertOne(finalData);
        res.status(201).send({ success: true, result, poaId: finalData.poaId });
      } catch (error) { res.status(500).send({ success: false, message: error.message }); }
    });

    // ------------------- ৬. মৃত্যু সনদ -------------------
    app.post('/api/death-certificate', async (req, res) => {
      try {
        const data = req.body;
        const finalData = { ...data, deathCertId: 'DTH' + Date.now(), status: 'Pending', submittedAt: new Date() };
        const result = await DeathCertificateCollection.insertOne(finalData);
        res.status(201).send({ success: true, result, deathCertId: finalData.deathCertId });
      } catch (error) { res.status(500).send({ success: false, message: error.message }); }
    });

    // ------------------- ৭. ভূমিহীন সনদ -------------------
    app.post('/api/landless-certificate', async (req, res) => {
      try {
        const data = req.body;
        const finalData = { ...data, landlessId: 'LND' + Date.now(), status: 'Pending', submittedAt: new Date() };
        const result = await LandlessCertificateCollection.insertOne(finalData);
        res.status(201).send({ success: true, result, landlessId: finalData.landlessId });
      } catch (error) { res.status(500).send({ success: false, message: error.message }); }
    });




    // ------------------- ৮. ট্রেড লাইসেন্স -------------------
    app.post('/api/trade-license', async (req, res) => {
      try {
        const data = req.body;
        const finalData = { ...data, applicationId: 'TRD' + Date.now(), status: 'Pending', submittedAt: new Date() };
        const result = await TradeLicenseCollection.insertOne(finalData);
        res.status(201).send({ success: true, result, applicationId: finalData.applicationId });
      } catch (error) { res.status(500).send({ success: false, message: error.message }); }
    });



    // ------------------- ৯. প্রাঙ্গণ লাইসেন্স -------------------
    app.post('/api/premises', async (req, res) => {
      try {
        const data = req.body;
        const finalData = { ...data, premisesId: 'PRM' + Date.now(), status: 'Pending', submittedAt: new Date() };
        const result = await PremisesCollection.insertOne(finalData);
        res.status(201).send({ success: true, result, premisesId: finalData.premisesId });
      } catch (error) { res.status(500).send({ success: false, message: error.message }); }
    });

    console.log("MongoDB Connected & Routes Ready");
  } catch (error) { console.error(error); }
}
run().catch(console.dir);

app.get('/', (req, res) => res.send('Amar Union Server Running'));
app.listen(port, () => console.log(`Server running on port ${port}`));