const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');  

const JWT_SECRET = process.env.JWT_SECRET || 'amar_union_secret_2025';
const app = express();
const port = process.env.PORT || 5000;

// গ্লোবাল মিডলওয়্যার সমূহ
app.use(express.json());
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:5174'], 
  credentials: true 
}));

// মঙ্গোডিবি কানেকশন ইউআরআই
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hz6ypdj.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, { 
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true } 
});

async function run() {
  try {
    await client.connect();
    const db = client.db('amar_union_db');

    // ------------------- সব কালেকশন সমূহ -------------------
    const FamilyCertificateCollection = db.collection('family_certificates');
    const WarishCollection = db.collection('warish');
    const CitizenshipCollection = db.collection('citizenship_certificates');
    const SuccessorCollection = db.collection('successor_certificates');
    const PowerOfAttorneyCollection = db.collection('power_of_attorney');
    const DeathCertificateCollection = db.collection('death_certificates');
    const LandlessCertificateCollection = db.collection('landless_certificates');
    const TradeLicenseCollection = db.collection('trade_licenses');
    const PremisesCollection = db.collection('premises');
    const AdminCollection = db.collection('admin_users');
    const GlanceCollection = db.collection('glance');
    
    // 🔥 ডায়নামিক হোম পেজ ও পরিচিতির জন্য নতুন ৩টি কালেকশন (Pure MongoDB)
    const NoticeCollection = db.collection('notices');
    const ServiceCollection = db.collection('services');
    const IntroCollection = db.collection('intro');

    // ------------------- ইউজারের সব আবেদন -------------------
    app.get('/api/my-applications/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email: email };
        const allApps = [
          ...(await FamilyCertificateCollection.find(query).toArray()).map(a => ({ id: a.familyCertificateId, type: 'পারিবারিক সনদ', date: a.submittedAt, status: a.status || 'Pending' })),
          ...(await WarishCollection.find(query).toArray()).map(a => ({ id: a.warishId, type: 'ওয়ারিশ সনদ', date: a.submittedAt, status: a.status || 'Pending' })),
          ...(await CitizenshipCollection.find(query).toArray()).map(a => ({ id: a.citizenshipId, type: 'ناগরিকত্ব সনদ', date: a.submittedAt, status: a.status || 'Pending' })),
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

    // 🔹 সমস্ত আবেদন পাওয়ার জন্য (প্রশাসক)
    app.get('/api/admin/applications', async (req, res) => {
      try {
        const collections = [
          { name: 'family_certificates', coll: FamilyCertificateCollection, label: 'পারিবারিক সনদ' },
          { name: 'warish', coll: WarishCollection, label: 'ওয়ারিশ সনদ' },
          { name: 'citizenship_certificates', coll: CitizenshipCollection, label: 'নাগরিকত্ব সনদ' },
          { name: 'successor_certificates', coll: SuccessorCollection, label: 'উত্তরাধিকারী সনদ' },
          { name: 'power_of_attorney', coll: PowerOfAttorneyCollection, label: 'পাওয়ার অফ অ্যাটর্নি' },
          { name: 'death_certificates', coll: DeathCertificateCollection, label: 'মৃত্যু সনদ' },
          { name: 'landless_certificates', coll: LandlessCertificateCollection, label: 'ভূমিহীন সনদ' },
          { name: 'trade_licenses', coll: TradeLicenseCollection, label: 'ট্রেড লাইসেন্স' },
          { name: 'premises', coll: PremisesCollection, label: 'প্রাঙ্গণ লাইসেন্স' }
        ];

        let allApplications = [];
        for (const col of collections) {
          const docs = await col.coll.find({}).toArray();
          docs.forEach(doc => {
            allApplications.push({
              id: doc._id,
              collectionName: col.name,
              type: col.label,
              userEmail: doc.email,
              userName: doc.name || doc.applicantName || doc.applicantInfo?.applicantName || 'নাম নেই',
              mobile: doc.phone || doc.mobile || doc.applicantInfo?.applicantMobile,
              status: doc.status || 'Pending',
              submittedAt: doc.submittedAt,
              fullData: doc
            });
          });
        }
        allApplications.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        res.json(allApplications);
      } catch (error) { res.status(500).json({ message: 'ডাটা লোড করতে ব্যর্থ', error: error.message }); }
    });

    // 🔹 স্ট্যাটাস আপডেট (approve/reject)
    app.put('/api/admin/application/:collectionName/:docId', async (req, res) => {
      try {
        const { collectionName, docId } = req.params;
        const { status } = req.body;

        let collection;
        switch (collectionName) {
          case 'family_certificates': collection = FamilyCertificateCollection; break;
          case 'warish': collection = WarishCollection; break;
          case 'citizenship_certificates': collection = CitizenshipCollection; break;
          case 'successor_certificates': collection = SuccessorCollection; break;
          case 'power_of_attorney': collection = PowerOfAttorneyCollection; break;
          case 'death_certificates': collection = DeathCertificateCollection; break;
          case 'landless_certificates': collection = LandlessCertificateCollection; break;
          case 'trade_licenses': collection = TradeLicenseCollection; break;
          case 'premises': collection = PremisesCollection; break;
          default: return res.status(400).json({ message: 'অবৈধ কালেকশন' });
        }

        const result = await collection.updateOne(
          { _id: new ObjectId(docId) },
          { $set: { status: status, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) return res.status(404).json({ message: 'আবেদন পাওয়া যায়নি' });
        res.json({ success: true, message: `আবেদন ${status === 'Approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'} হয়েছে` });
      } catch (error) { res.status(500).json({ message: 'আপডেট ব্যর্থ', error: error.message }); }
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
    app.post('/api/warish', async (req, res) => {
      try {
        const data = req.body;
        const finalData = { 
          ...data, 
          email: data.email || data.applicantInfo?.applicantEmail, 
          warishId: 'WRS' + Date.now(), 
          status: 'Pending', 
          submittedAt: new Date() 
        };
        const result = await WarishCollection.insertOne(finalData);
        res.status(201).send({ success: true, result, warishId: finalData.warishId });
      } catch (error) { res.status(500).send({ success: false, message: error.message }); }
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

    // ------------------- ৭. 𑁪ূমিহীন সনদ -------------------
    app.post('/api/landless-certificate', async (req, res) => {
      try {
        const data = req.body;
        const finalData = { ...data, landlessId: 'LND' + Date.now(), status: 'Pending', submittedAt: new Date() };
        const result = await LandlessCertificateCollection.insertOne(finalData);
        res.status(201).send({ success: true, result, landlessId: finalData.landlessId });
      } catch (error) { res.status(500).send({ success: false, message: error.message }); }
    });

    // ------------------- অ্যাডমিন লগইন -------------------
    app.post('/api/admin/login', async (req, res) => {
      const { email, password } = req.body;
      const admin = await AdminCollection.findOne({ email });
      if (!admin) return res.status(401).json({ message: 'ইমেইল বা পাসওয়ার্ড ভুল' });
      
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(401).json({ message: 'ইমেইল বা পাসওয়ার্ড ভুল' });
      
      const token = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
        JWT_SECRET,
        { expiresIn: '1d' }
      );
      res.json({ token, admin: { id: admin._id, email: admin.email, role: admin.role } });
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


    // =========================================================
    // 🔥 নতুন ৩টি এপিআই (ড্যাশবোর্ড আপডেটের জন্য - Pure MongoDB Driver)
    // =========================================================

    // ১. নোটিশ তৈরি করার API
    app.post('/api/notices', async (req, res) => {
      try {
        const { title, date } = req.body;
        const newNotice = { title, date, createdAt: new Date() };
        await NoticeCollection.insertOne(newNotice);
        res.status(201).json({ message: 'নোটিশ সফলভাবে যোগ করা হয়েছে!' });
      } catch (error) { res.status(500).json({ message: error.message }); }
    });

    // ২. নতুন নাগরিক সেবা যোগ করার API
    app.post('/api/services', async (req, res) => {
      try {
        const { title, path, iconName, iconColor } = req.body;
        const newService = { title, path, iconName, iconColor, createdAt: new Date() };
        await ServiceCollection.insertOne(newService);
        res.status(201).json({ message: 'নাগরিক সেবা সফলভাবে যোগ করা হয়েছে!' });
      } catch (error) { res.status(500).json({ message: error.message }); }
    });

    // ৩. ইউনিয়ন পরিচিতি (Intro) ডাটা সেভ বা আপডেট করার API (Upsert)
    app.post('/api/intro', async (req, res) => {
      try {
        const { 
          title, subtitle, history, established, area, 
          totalVillages, totalPopulation, literacyRate, 
          college, highSchool, primarySchool, madrasah, landmarks 
        } = req.body;

        const updatedData = {
          title, subtitle, history, established, area, 
          totalVillages, totalPopulation, literacyRate,
          educationalInstitutions: { college, highSchool, primarySchool, madrasah },
          landmarks: landmarks ? landmarks.split(',').map(item => item.trim()) : []
        };

        // ডাটাবেজে একটিও ডাটা থাকলে আপডেট হবে, না থাকলে প্রথমবার ইনসার্ট হবে (Upsert লজিক)
        await IntroCollection.updateOne(
          {}, 
          { $set: updatedData }, 
          { upsert: true }
        );

        res.status(200).json({ message: 'ইউনিয়ন পরিচিতি সফলভাবে আপডেট করা হয়েছে!' });
      } catch (error) { res.status(500).json({ message: error.message }); }
    });

    // ৪. পরিচিতি ডাটা ফ্রন্টএন্ডে গেট (GET) করার API (যাতে Intro পেজে শো করে)
    app.get('/api/intro', async (req, res) => {
      try {
        const result = await IntroCollection.findOne({});
        res.send(result || {});
      } catch (error) { res.status(500).json({ message: error.message }); }
    });

    // ১. ড্যাশবোর্ড থেকে Glance ডাটা সেভ বা আপডেট করার API (Upsert)
app.post('/api/glance', async (req, res) => {
  try {
    const { 
      totalPopulation, totalVoters, area, literacyRate, 
      totalVillages, primarySchools, healthCenters, established 
    } = req.body;

    const glanceData = {
      totalPopulation,
      totalVoters,
      area,
      literacyRate,
      totalVillages,
      primarySchools,
      healthCenters,
      established,
      updatedAt: new Date()
    };

    // ডাটাবেজে ডাটা থাকলে আপডেট হবে, না থাকলে নতুন তৈরি হবে
    await GlanceCollection.updateOne({}, { $set: glanceData }, { upsert: true });
    res.status(200).json({ message: 'এক নজরে ইউনিয়নের তথ্য সফলভাবে আপডেট হয়েছে!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ২. ফ্রন্টঅ্যান্ডে Glance ডাটা দেখানোর API (GET)
app.get('/api/glance', async (req, res) => {
  try {
    const result = await GlanceCollection.findOne({});
    res.send(result || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

    console.log("MongoDB Connected & All Routes Ready Successfully!");
  } catch (error) { console.error(error); }
}
run().catch(console.dir);

app.get('/', (req, res) => res.send('Amar Union Server Running'));
app.listen(port, () => console.log(`Server running on port ${port}`));