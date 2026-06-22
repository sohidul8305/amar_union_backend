const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');  

const app = express();
const port = process.env.PORT || 5000;

// ১. Preflight রিকোয়েস্ট হ্যান্ডল করার জন্য একদম উপরে এটি রাখুন
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://starlit-chaja-d1cea5.netlify.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});


app.use(cors({
  origin: ['https://joyful-gelato-9f4522.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// app.options('*', cors());  <-- এই লাইনটি পুরোপুরি ডিলিট করে দিন
app.use(express.json());

// মঙ্গোডিবি কানেকশন ইউআরআই
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hz6ypdj.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});


async function run() {
  try {
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
    const StructureCollection = db.collection('structure');

    // 🔥 ডায়নামিক হোম পেজ ও পরিচিতির জন্য নতুন কালেকশন সমূহ
    const NoticeCollection = db.collection('notices');
    const ServiceCollection = db.collection('services');
    const IntroCollection = db.collection('intro');
    const ChairmanCollection = db.collection('chairman');
    const ExChairmanCollection = db.collection('ex_chairmans'); // 🌟 সাবেক চেয়ারম্যান কালেকশন
    const CouncillorCollection = db.collection('councillors'); // 🌟 কাউন্সিলর কালেকশন
    // কাউন্টার কালেকশন


    const ContactInfoCollection = db.collection('contact_info');
    const VerificationPageCollection = db.collection('verification_page');
    const GalleryCollection = db.collection('gallery_items');
const UpdatesCollection = db.collection('updates');
const SecretaryCollection = db.collection('secretary');
const AccountCollection = db.collection('account_info');
const OtherStaffCollection = db.collection('other_staff');
const FooterCollection = db.collection('footer_info');
const CouncillorsPageConfigCollection = db.collection('councillors_page_config');
const ProjectCollection = db.collection('projects');
const ContactMessageCollection = db.collection('contact_messages');
const countersCollection = db.collection('counters');
const TradeRenewalCollection = db.collection('trade_renewal');
const OpenSpaceLicenseCollection = db.collection('open_space_licenses');
const CharacterCertificateCollection = db.collection('character_certificates');
const UnmarriedCertificateCollection = db.collection('unmarried_certificates');
const NationalityCollection = db.collection('nationality_certificates');
const RemarriageCertificateCollection = db.collection('remarriage_certificates');
const AnnualIncomeCertificateCollection = db.collection('annual_income_certificates');
const SameNameCertificateCollection = db.collection('same_name_certificates');
const DisabilityCertificateCollection = db.collection('disability_certificates');
const ReligionCertificateCollection = db.collection('religion_certificates');
const PermissionCertificateCollection = db.collection('permission_certificates');
const PassportCertificateCollection = db.collection('passport_certificates');
const VoterTransferCollection = db.collection('voter_transfer_certificates');
const RiverErosionCollection = db.collection('river_erosion_certificates');
const NewVoterCollection = db.collection('new_voter_certificates');
const MarriedCertificateCollection = db.collection('married_certificates');
const VoterUpdateCollection = db.collection('voter_update_certificates');
const GuardianConsentCollection = db.collection('guardian_consent_certificates');
const NonCitizenCertificateCollection = db.collection('non_citizen_certificates');
const NocCertificateCollection = db.collection('noc_certificates');
const VoterVerificationCollection = db.collection('voter_verification_certificates');

// সিরিয়াল জেনারেট (বছর + ইউনিয়ন কোড অনুযায়ী)
async function getCertificateSerial(year, unionCode) {
  const counterId = `cert_serial_${year}_${unionCode}`;
  
  const result = await countersCollection.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );

  // নতুন ড্রাইভার ভার্সনে result সরাসরি ডকুমেন্ট রিটার্ন করে, অথবা result.value তে থাকে
  const doc = result.value || result; 

  if (!doc || typeof doc.seq === 'undefined') {
    throw new Error("Counter sequence could not be generated");
  }

  return doc.seq.toString().padStart(5, '0');
}



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
          ...(await PremisesCollection.find(query).toArray()).map(a => ({ id: a.premisesId, type: 'প্রাঙ্গণ লাইসেন্স', date: a.submittedAt, status: a.status || 'Pending' })),

            // ... আগের সব লাইন ...
  ...(await TradeLicenseCollection.find(query).toArray()).map(a => ({ id: a.applicationId, type: 'ট্রেড লাইসেন্স', date: a.submittedAt, status: a.status || 'Pending' })),
  // ⬇️ নিচের দুটি লাইন যোগ করুন
  ...(await TradeRenewalCollection.find(query).toArray()).map(a => ({ id: a.tradeRenewalId, type: 'ট্রেড লাইসেন্স নবায়ন', date: a.submittedAt, status: a.status || 'Pending' })),
  ...(await PremisesCollection.find(query).toArray()).map(a => ({ id: a.premisesId, type: 'প্রাঙ্গণ লাইসেন্স', date: a.submittedAt, status: a.status || 'Pending' })),
  ...(await OpenSpaceLicenseCollection.find(query).toArray()).map(a => ({ id: a.licenseId, type: 'খোলা জায়গার লাইসেন্স', date: a.submittedAt, status: a.status || 'Pending' })),
  ...(await CharacterCertificateCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'চারিত্রিক সনদ', date: a.submittedAt, status: a.status || 'Pending' })),
  ...(await UnmarriedCertificateCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'অবিবাহিত সনদ', date: a.submittedAt, status: a.status || 'Pending' })),
  ...(await NationalityCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'জাতীয়তা সনদ', date: a.submittedAt, status: a.status || 'Pending' })),
  ...(await RemarriageCertificateCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'পুনঃ বিবাহ না হওয়ার সনদ', date: a.submittedAt, status: a.status || 'Pending' })),
  ...(await AnnualIncomeCertificateCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'বার্ষিক আয়ের প্রত্যয়ন', date: a.submittedAt, status: a.status || 'Pending' })),
  ...(await SameNameCertificateCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'একই নামের প্রত্যয়ন', date: a.submittedAt, status: a.status || 'Pending' })),
  ...(await DisabilityCertificateCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'প্রতিবন্ধী সনদ', date: a.submittedAt, status: a.status || 'Pending' })),
  ...(await ReligionCertificateCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'ধর্মীয় সনদ', date: a.submittedAt, status: a.status || 'Pending' })),
  ...(await PermissionCertificateCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'অনুমতি পত্র', date: a.submittedAt, status: a.status || 'Pending' })),
  ...(await PassportCertificateCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'পাসপোর্ট সুপারিশপত্র', date: a.submittedAt, status: a.status || 'Pending' })),
  ...(await VoterTransferCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'ভোটার আইডি স্থানান্তর', date: a.submittedAt, status: a.status || 'Pending' })),
...(await RiverErosionCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'নদী ভাঙনের সনদ', date: a.submittedAt, status: a.status || 'Pending' })),
...(await NewVoterCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'নতুন ভোটার সুপারিশ', date: a.submittedAt, status: a.status || 'Pending' })),
...(await MarriedCertificateCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'বিবাহিত সনদ', date: a.submittedAt, status: a.status || 'Pending' })),
...(await VoterUpdateCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'ভোটার তথ্য সংশোধন', date: a.submittedAt, status: a.status || 'Pending' })),
...(await GuardianConsentCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'অভিভাবকের সম্মতিপত্র', date: a.submittedAt, status: a.status || 'Pending' })),
...(await NonCitizenCertificateCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'নাগরিকত্ব সনদপত্র', date: a.submittedAt, status: a.status || 'Pending' })),
...(await NocCertificateCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'অনাপত্তি সনদপত্র (NOC)', date: a.submittedAt, status: a.status || 'Pending' })),
...(await VoterVerificationCollection.find(query).toArray()).map(a => ({ id: a.certificateId, type: 'ভোটার যাচাইকরণ', date: a.submittedAt, status: a.status || 'Pending' })),
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
          { name: 'premises', coll: PremisesCollection, label: 'প্রাঙ্গণ লাইসেন্স' },
            { name: 'trade_renewal', coll: TradeRenewalCollection, label: 'ট্রেড লাইসেন্স নবায়ন' },
      { name: 'open_space_licenses', coll: OpenSpaceLicenseCollection, label: 'খোলা জায়গার লাইসেন্স' },
  { name: 'character_certificates', coll: CharacterCertificateCollection, label: 'চারিত্রিক সনদ' },
  { name: 'unmarried_certificates', coll: UnmarriedCertificateCollection, label: 'অবিবাহিত সনদ' },
  { name: 'nationality_certificates', coll: NationalityCollection, label: 'জাতীয়তা সনদ' },
  { name: 'remarriage_certificates', coll: RemarriageCertificateCollection, label: 'পুনঃ বিবাহ না হওয়ার সনদ' }
  ,
  { name: 'annual_income_certificates', coll: AnnualIncomeCertificateCollection, label: 'বার্ষিক আয়ের প্রত্যয়ন' },
  { name: 'same_name_certificates', coll: SameNameCertificateCollection, label: 'একই নামের প্রত্যয়ন' },
  { name: 'disability_certificates', coll: DisabilityCertificateCollection, label: 'প্রতিবন্ধী সনদ' },
  { name: 'religion_certificates', coll: ReligionCertificateCollection, label: 'ধর্মীয় সনদ' },
  { name: 'permission_certificates', coll: PermissionCertificateCollection, label: 'অনুমতি পত্র' },
  { name: 'passport_certificates', coll: PassportCertificateCollection, label: 'পাসপোর্ট সুপারিশপত্র' },
{ name: 'voter_transfer_certificates', coll: VoterTransferCollection, label: 'ভোটার আইডি স্থানান্তর' },
{ name: 'river_erosion_certificates', coll: RiverErosionCollection, label: 'নদী ভাঙনের সনদ' },
{ name: 'new_voter_certificates', coll: NewVoterCollection, label: 'নতুন ভোটার সুপারিশ' },
{ name: 'married_certificates', coll: MarriedCertificateCollection, label: 'বিবাহিত সনদ' },
{ name: 'voter_update_certificates', coll: VoterUpdateCollection, label: 'ভোটার তথ্য সংশোধন' },
{ name: 'guardian_consent_certificates', coll: GuardianConsentCollection, label: 'অভিভাবকের সম্মতিপত্র' },
{ name: 'non_citizen_certificates', coll: NonCitizenCertificateCollection, label: 'নাগরিকত্ব সনদপত্র' },
{ name: 'noc_certificates', coll: NocCertificateCollection, label: 'অনাপত্তি সনদপত্র (NOC)' },
{ name: 'voter_verification_certificates', coll: VoterVerificationCollection, label: 'ভোটার যাচাইকরণ' },

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
  case 'trade_renewal': collection = TradeRenewalCollection; break;
  case 'open_space_licenses': collection = OpenSpaceLicenseCollection; break;
  case 'character_certificates': collection = CharacterCertificateCollection; break;
  case 'unmarried_certificates': collection = UnmarriedCertificateCollection; break;
  case 'nationality_certificates': collection = NationalityCollection; break;
  case 'remarriage_certificates': collection = RemarriageCertificateCollection; break;
  case 'annual_income_certificates': collection = AnnualIncomeCertificateCollection; break;
  case 'same_name_certificates': collection = SameNameCertificateCollection; break;
  case 'disability_certificates': collection = DisabilityCertificateCollection; break;
  case 'religion_certificates': collection = ReligionCertificateCollection; break;
  case 'permission_certificates': collection = PermissionCertificateCollection; break;
  case 'passport_certificates': collection = PassportCertificateCollection; break;
  case 'voter_transfer_certificates': collection = VoterTransferCollection; break;
  case 'river_erosion_certificates': collection = RiverErosionCollection; break;
  case 'new_voter_certificates': collection = NewVoterCollection; break;
  case 'married_certificates': collection = MarriedCertificateCollection; break;
case 'voter_update_certificates': collection = VoterUpdateCollection; break;
case 'guardian_consent_certificates': collection = GuardianConsentCollection; break;
case 'non_citizen_certificates': collection = NonCitizenCertificateCollection; break;
case 'noc_certificates': collection = NocCertificateCollection; break;
case 'voter_verification_certificates': collection = VoterVerificationCollection; break;
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


    // পারিবারিক সনদ ডাটাবেস থেকে আনার জন্য GET API
app.get('/api/family-certificate', async (req, res) => {
  try {
    const result = await FamilyCertificateCollection.find({}).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// ভূমিহীন সনদ ডাটাবেস থেকে আনার জন্য GET API
app.get('/api/landless-certificate', async (req, res) => {
  try {
    const result = await LandlessCertificateCollection.find({}).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
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

    // ------------------- ৭. ভূমিহীন সনদ -------------------
    app.post('/api/landless-certificate', async (req, res) => {
      try {
        const data = req.body;
        const finalData = { ...data, landlessId: 'LND' + Date.now(), status: 'Pending', submittedAt: new Date() };
        const result = await LandlessCertificateCollection.insertOne(finalData);
        res.status(201).send({ success: true, result, landlessId: finalData.landlessId });
      } catch (error) { res.status(500).send({ success: false, message: error.message }); }
    });

    // ---------- লগইন API (হার্ডকোডেড, কোনো টোকেন নাই) ----------
    app.post('/api/admin/login', (req, res) => {
      const { email, password } = req.body;
      if (email === 'admin@amarunion.gov.bd' && password === 'admin123') {
        return res.json({ success: true });
      }
      return res.status(401).json({ success: false, message: 'ইমেইল বা পাসওয়ার্ড ভুল' });
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
    // 🔥 ড্যাশবোর্ড আপডেটের জন্য এপিআই সমূহ (Pure MongoDB Driver)
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

        await IntroCollection.updateOne(
          {}, 
          { $set: updatedData }, 
          { upsert: true }
        );

        res.status(200).json({ message: 'ইউনিয়ন পরিচিতি সফলভাবে আপডেট করা হয়েছে!' });
      } catch (error) { res.status(500).json({ message: error.message }); }
    });

    // ৪. পরিচিতি ডাটা ফ্রন্টএন্ডে গেট (GET) করার API
    app.get('/api/intro', async (req, res) => {
      try {
        const result = await IntroCollection.findOne({});
        res.send(result || {});
      } catch (error) { res.status(500).json({ message: error.message }); }
    });

    // ৫. Glance ডাটা সেভ বা আপডেট করার API (Upsert)
app.post('/api/glance', async (req, res) => {
  try {
    const glanceData = req.body;
    delete glanceData._id;               // 🔥 ইমিউটেবল ফিল্ড ডিলিট করুন
    glanceData.updatedAt = new Date();
    await GlanceCollection.updateOne({}, { $set: glanceData }, { upsert: true });
    res.status(200).json({ message: 'এক নজরে ইউনিয়নের তথ্য সফলভাবে আপডেট হয়েছে!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



    // ৬. Glance ডাটা দেখানোর API (GET)
    app.get('/api/glance', async (req, res) => {
      try {
        const result = await GlanceCollection.findOne({});
        res.send(result || {});
      } catch (error) { res.status(500).json({ message: error.message }); }
    });

    // ৭. সাংগঠনিক কাঠামোর তথ্য সেভ বা আপডেট করার API (Upsert)
    app.post('/api/structure', async (req, res) => {
      try {
        const { topManagement, members } = req.body;
        const structureData = { topManagement, members, updatedAt: new Date() };

        await StructureCollection.updateOne({}, { $set: structureData }, { upsert: true });
        res.status(200).json({ message: 'সাংগঠনিক কাঠামোর তথ্য সফলভাবে আপডেট হয়েছে!' });
      } catch (error) { res.status(500).json({ message: error.message }); }
    });

    // ৮. সাংগঠনিক কাঠামোর তথ্য দেখানোর API (GET)
    app.get('/api/structure', async (req, res) => {
      try {
        const result = await StructureCollection.findOne({});
        res.send(result || {});
      } catch (error) { res.status(500).json({ message: error.message }); }
    });

    // ৯. চেয়ারম্যানের প্রোফাইল আপডেট করার API (Upsert)
    app.post('/api/chairman', async (req, res) => {
      try {
        const chairmanData = req.body;
        chairmanData.updatedAt = new Date();

        await ChairmanCollection.updateOne({}, { $set: chairmanData }, { upsert: true });
        res.status(200).json({ message: 'চেয়ারম্যান প্রোফাইল সফলভাবে আপডেট হয়েছে!' });
      } catch (error) { res.status(500).json({ message: error.message }); }
    });

    // ১০. চেয়ারম্যানের ডাটা দেখানোর API (GET)
    app.get('/api/chairman', async (req, res) => {
      try {
        const result = await ChairmanCollection.findOne({});
        res.send(result || {});
      } catch (error) { res.status(500).json({ message: error.message }); }
    });


    // =========================================================================
    // 🌟 সাবেক চেয়ারম্যান (EX-CHAIRMANS) পিওর মঙ্গোডিবি রাউটস
    // =========================================================================

    // 🟢 (ক) সব সাবেক চেয়ারম্যানদের তালিকা রিড করা (GET)
    app.get('/api/ex-chairmans', async (req, res) => {
      try {
        const chairmans = await ExChairmanCollection.find({}).toArray();
        res.status(200).json({ success: true, chairmans });
      } catch (error) {
        res.status(500).json({ success: false, message: 'সাবেক চেয়ারম্যান তালিকা আনতে ব্যর্থ!', error: error.message });
      }
    });

    // 🔵 (খ) ড্যাশবোর্ড থেকে পুরো তালিকা একবারে সেভ/সিঙ্ক করা (POST)
    app.post('/api/ex-chairmans', async (req, res) => {
      try {
        const { chairmans } = req.body;

        if (!chairmans || !Array.isArray(chairmans)) {
          return res.status(400).json({ success: false, message: 'সদস্য ডাটা ফরম্যাট সঠিক প্রদান করুন।' });
        }

        await ExChairmanCollection.deleteMany({});
        
        const cleanedChairmans = chairmans.map(item => ({
          name: item.name,
          title: item.title || 'সাবেক চেয়ারম্যান',
          duration: item.duration,
          image: item.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
          status: item.status || 'জীবিত',
          village: item.village || '',
          submittedAt: new Date()
        }));
        
        if (cleanedChairmans.length > 0) {
          await ExChairmanCollection.insertMany(cleanedChairmans);
        }

        res.status(200).json({ 
          success: true, 
          message: 'পূর্বতন চেয়ারম্যান তালিকা সফলভাবে আপডেট হয়েছে!'
        });
      } catch (error) {
        res.status(500).json({ success: false, message: 'ডাটাবেজে সংরক্ষণ করতে সমস্যা হয়েছে!', error: error.message });
      }
    });


    // =========================================================================
    // 🌟 ইউপি সদস্য / কাউন্সিলর (COUNCILLORS) পিওর মঙ্গোডিবি রাউটস
    // =========================================================================

    // 🟢 (ক) সব কাউন্সিলরদের তালিকা রিড করা (GET)
    app.get('/api/councillors', async (req, res) => {
      try {
        const councillors = await CouncillorCollection.find({}).toArray();
        res.status(200).json({ success: true, councillors });
      } catch (error) {
        res.status(500).json({ success: false, message: 'কাউন্সিলর তালিকা আনতে ব্যর্থ!', error: error.message });
      }
    });

    // 🔵 (খ) ড্যাশবোর্ড থেকে পুরো তালিকা একবারে সেভ/সিঙ্ক করা (POST)
    app.post('/api/councillors', async (req, res) => {
      try {
        const { councillors } = req.body;

        if (!councillors || !Array.isArray(councillors)) {
          return res.status(400).json({ success: false, message: 'সদস্য ডাটা ফরম্যাট সঠিক প্রদান করুন।' });
        }

        await CouncillorCollection.deleteMany({});
        
        const cleanedCouncillors = councillors.map(item => ({
          name: item.name,
          role: item.role || 'ইউপি সদস্য / কাউন্সিলর',
          ward: item.ward,
          image: item.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
          phone: item.phone,
          email: item.email,
          submittedAt: new Date()
        }));
        
        if (cleanedCouncillors.length > 0) {
          await CouncillorCollection.insertMany(cleanedCouncillors);
        }

        res.status(200).json({ 
          success: true, 
          message: 'কাউন্সিলর/সদস্য তালিকা সফলভাবে আপডেট হয়েছে!'
        });
      } catch (error) {
        res.status(500).json({ success: false, message: 'ডাটাবেজে সংরক্ষণ করতে সমস্যা হয়েছে!', error: error.message });
      }
    });






// GET: কন্টাক্ট তথ্য পড়ুন (একটি ডকুমেন্ট)
app.get('/api/contact-info', async (req, res) => {
  try {
    const result = await ContactInfoCollection.findOne({});
    res.send(result || {});
  } catch (error) {
    res.status(500).json({ message: 'কন্টাক্ট তথ্য আনতে ব্যর্থ', error: error.message });
  }
});


// POST: কন্টাক্ট তথ্য আপডেট করুন (Upsert)
app.post('/api/contact-info', async (req, res) => {
  try {
    const contactData = req.body;
    delete contactData._id;      // 🔥 ইমিউটেবল ফিল্ড ডিলিট করুন
    contactData.updatedAt = new Date();
    await ContactInfoCollection.updateOne({}, { $set: contactData }, { upsert: true });
    res.status(200).json({ success: true, message: 'যোগাযোগের তথ্য সফলভাবে আপডেট হয়েছে!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'সংরক্ষণ করতে সমস্যা হয়েছে', error: error.message });
  }
});


// GET: ভারিফিকেশন পেজের কনফিগারেশন ডাটা
app.get('/api/verification-page', async (req, res) => {
  try {
    const data = await VerificationPageCollection.findOne({});
    res.send(data || {});
  } catch (error) {
    res.status(500).json({ message: 'ডাটা লোড ব্যর্থ', error: error.message });
  }
});

// POST: ভারিফিকেশন পেজ কনফিগারেশন আপডেট (Upsert)
app.post('/api/verification-page', async (req, res) => {
  try {
    const configData = req.body;
    delete configData._id;           // 🔥 ইমিউটেবল ফিল্ড ডিলিট করুন
    configData.updatedAt = new Date();
    await VerificationPageCollection.updateOne({}, { $set: configData }, { upsert: true });
    res.status(200).json({ success: true, message: 'যাচাই পেজের তথ্য আপডেট হয়েছে!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'আপডেট ব্যর্থ', error: error.message });
  }
});

// GET: সব গ্যালারি আইটেম
app.get('/api/gallery', async (req, res) => {
  try {
    const items = await GalleryCollection.find({}).toArray();
    res.status(200).json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'গ্যালারি ডাটা আনতে ব্যর্থ', error: error.message });
  }
});

// POST: একটি নতুন গ্যালারি আইটেম যোগ করুন
app.post('/api/gallery', async (req, res) => {
  try {
    const { title, category, image, date } = req.body;
    if (!title || !category || !image) {
      return res.status(400).json({ success: false, message: 'শিরোনাম, ক্যাটাগরি এবং ছবির URL আবশ্যক' });
    }
    const newItem = {
      title,
      category,
      image,
      date: date || new Date().toLocaleDateString('bn-BD'),
      createdAt: new Date()
    };
    const result = await GalleryCollection.insertOne(newItem);
    res.status(201).json({ success: true, message: 'গ্যালারি আইটেম যুক্ত হয়েছে', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'সংরক্ষণ ব্যর্থ', error: error.message });
  }
});

// PUT: একটি গ্যালারি আইটেম আপডেট করুন
app.put('/api/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, image, date } = req.body;
    const updateData = { title, category, image, date, updatedAt: new Date() };
    const result = await GalleryCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'আইটেম পাওয়া যায়নি' });
    }
    res.status(200).json({ success: true, message: 'আইটেম আপডেট হয়েছে' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'আপডেট ব্যর্থ', error: error.message });
  }
});

// DELETE: একটি গ্যালারি আইটেম মুছুন
app.delete('/api/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await GalleryCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'আইটেম পাওয়া যায়নি' });
    }
    res.status(200).json({ success: true, message: 'আইটেম মুছে ফেলা হয়েছে' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'মুছতে ব্যর্থ', error: error.message });
  }
});

// GET: সব আপডেট (তারিখ অনুযায়ী সাজানো)
app.get('/api/updates', async (req, res) => {
  try {
    const updates = await UpdatesCollection.find({}).sort({ dateField: -1 }).toArray();
    res.status(200).json({ success: true, updates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'আপডেট লোড ব্যর্থ', error: error.message });
  }
});

// POST: একটি নতুন আপডেট যোগ করুন
app.post('/api/updates', async (req, res) => {
  try {
    const { title, description, tag, tagColor, date, link } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'শিরোনাম ও বিবরণ আবশ্যক' });
    }
    const newUpdate = {
      title,
      description,
      tag: tag || 'সাধারণ নোটিশ',
      tagColor: tagColor || 'bg-blue-500',
      date: date || new Date().toLocaleDateString('bn-BD'),
      link: link || '#',
      dateField: new Date(),
      createdAt: new Date()
    };
    const result = await UpdatesCollection.insertOne(newUpdate);
    res.status(201).json({ success: true, message: 'আপডেট যোগ হয়েছে', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'যোগ করতে ব্যর্থ', error: error.message });
  }
});

// PUT: একটি আপডেট এডিট করুন
app.put('/api/updates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tag, tagColor, date, link } = req.body;
    const updateData = {
      title, description, tag, tagColor,
      date: date || new Date().toLocaleDateString('bn-BD'),
      link: link || '#',
      updatedAt: new Date()
    };
    const result = await UpdatesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'আপডেট পাওয়া যায়নি' });
    }
    res.status(200).json({ success: true, message: 'আপডেট পরিবর্তিত হয়েছে' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'আপডেট ব্যর্থ', error: error.message });
  }
});

// DELETE: একটি আপডেট ডিলিট করুন
app.delete('/api/updates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await UpdatesCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'আপডেট পাওয়া যায়নি' });
    }
    res.status(200).json({ success: true, message: 'সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'মুছতে ব্যর্থ', error: error.message });
  }
});

app.get('/api/secretary', async (req, res) => {
  try {
    const secretary = await SecretaryCollection.findOne({});
    res.send(secretary || {});
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/secretary', async (req, res) => {
  try {
    const data = req.body;
    delete data._id;           // 🔥 ইমিউটেবল ফিল্ড ডিলিট করুন
    data.updatedAt = new Date();
    await SecretaryCollection.updateOne({}, { $set: data }, { upsert: true });
    res.status(200).json({ success: true, message: 'সচিবের তথ্য আপডেট হয়েছে' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET: একাউন্ট পেজের ডাটা
app.get('/api/account', async (req, res) => {
  try {
    const data = await AccountCollection.findOne({});
    res.send(data || {});
  } catch (error) {
    res.status(500).json({ message: 'একাউন্ট ডাটা লোড ব্যর্থ', error: error.message });
  }
});

// POST: একাউন্ট পেজ কনফিগারেশন আপডেট (Upsert)
app.post('/api/account', async (req, res) => {
  try {
    const accountData = req.body;
    accountData.updatedAt = new Date();
    await AccountCollection.updateOne({}, { $set: accountData }, { upsert: true });
    res.status(200).json({ success: true, message: 'একাউন্ট পেজের তথ্য আপডেট হয়েছে!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'আপডেট ব্যর্থ', error: error.message });
  }
});


// GET all staff
app.get('/api/other-staff', async (req, res) => {
  try {
    const staff = await OtherStaffCollection.find({}).toArray();
    res.status(200).json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'স্টাফ লোড ব্যর্থ', error: error.message });
  }
});

// POST update whole list (sync)
app.post('/api/other-staff', async (req, res) => {
  try {
    const { staffList } = req.body;
    if (!staffList || !Array.isArray(staffList)) {
      return res.status(400).json({ success: false, message: 'ভুল ডাটা ফরম্যাট' });
    }
    await OtherStaffCollection.deleteMany({});
    if (staffList.length > 0) {
      const cleaned = staffList.map(({ id, ...rest }) => ({
        ...rest,
        createdAt: new Date()
      }));
      await OtherStaffCollection.insertMany(cleaned);
    }
    res.status(200).json({ success: true, message: 'স্টাফ তালিকা আপডেট হয়েছে' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'সংরক্ষণ ব্যর্থ', error: error.message });
  }
});

// GET: ফুটার ডাটা
app.get('/api/footer', async (req, res) => {
  try {
    const data = await FooterCollection.findOne({});
    res.send(data || {});
  } catch (error) {
    res.status(500).json({ message: 'ফুটার ডাটা লোড ব্যর্থ', error: error.message });
  }
});

app.post('/api/footer', async (req, res) => {
  try {
    const footerData = req.body;
    console.log('Received footer data:', footerData);
    
    // 🔥 গুরুত্বপূর্ণ: _id ফিল্ডটি মুছে ফেলুন (ইমিউটেবল)
    delete footerData._id;
    
    footerData.updatedAt = new Date();
    await FooterCollection.updateOne({}, { $set: footerData }, { upsert: true });
    res.status(200).json({ success: true, message: 'ফুটার তথ্য আপডেট হয়েছে!' });
  } catch (error) {
    console.error('Footer save error:', error);
    res.status(500).json({ success: false, message: 'আপডেট ব্যর্থ', error: error.message });
  }
});

// ... সব API রাউট (উপরে অনেক লাইন) ...

// GET: কাউন্সিলর পেজ কনফিগারেশন
app.get('/api/councillors-page-config', async (req, res) => {
  try {
    const config = await CouncillorsPageConfigCollection.findOne({});
    res.send(config || {});
  } catch (error) {
    res.status(500).json({ message: 'কনফিগ লোড ব্যর্থ', error: error.message });
  }
});

// POST: কাউন্সিলর পেজ কনফিগারেশন আপডেট (Upsert)
app.post('/api/councillors-page-config', async (req, res) => {
  try {
    const configData = req.body;
    configData.updatedAt = new Date();
    await CouncillorsPageConfigCollection.updateOne({}, { $set: configData }, { upsert: true });
    res.status(200).json({ success: true, message: 'পেজ কনফিগারেশন আপডেট হয়েছে!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'আপডেট ব্যর্থ', error: error.message });
  }
});

console.log("MongoDB Connected & All Routes Ready Successfully!");


// GET: সব প্রকল্প তালিকা
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await ProjectCollection.find({}).toArray();
    res.status(200).json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'প্রকল্প লোড ব্যর্থ', error: error.message });
  }
});

// POST: নতুন প্রকল্প যোগ করুন
app.post('/api/projects', async (req, res) => {
  try {
    const { name, budget, status } = req.body;
    if (!name || !budget) {
      return res.status(400).json({ success: false, message: 'নাম ও বাজেট আবশ্যক' });
    }
    const newProject = {
      name,
      budget,
      status: status || 'প্রক্রিয়াধীন',
      createdAt: new Date()
    };
    const result = await ProjectCollection.insertOne(newProject);
    res.status(201).json({ success: true, message: 'প্রকল্প যোগ হয়েছে', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'যোগ করতে ব্যর্থ', error: error.message });
  }
});

// PUT: একটি প্রকল্প সম্পাদনা করুন
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, budget, status } = req.body;
    const updateData = { name, budget, status, updatedAt: new Date() };
    const result = await ProjectCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'প্রকল্প পাওয়া যায়নি' });
    }
    res.status(200).json({ success: true, message: 'প্রকল্প আপডেট হয়েছে' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'আপডেট ব্যর্থ', error: error.message });
  }
});

// DELETE: একটি প্রকল্প মুছুন
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ProjectCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'প্রকল্প পাওয়া যায়নি' });
    }
    res.status(200).json({ success: true, message: 'প্রকল্প মুছে ফেলা হয়েছে' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'মুছতে ব্যর্থ', error: error.message });
  }
});

app.post('/api/contact-message', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'সব তথ্য আবশ্যক' });
    }
    const newMessage = {
      name, email, subject, message,
      createdAt: new Date(),
      status: 'unread'
    };
    await ContactMessageCollection.insertOne(newMessage);
    res.status(201).json({ success: true, message: 'বার্তা সফলভাবে পাঠানো হয়েছে' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'বার্তা পাঠাতে ব্যর্থ' });
  }
});




// // ✅ সঠিক একক PUT রুট (ডুপ্লিকেটটি মুছে এইটি ব্যবহার করুন)
// app.put('/api/admin/application/:collectionName/:docId', async (req, res) => {
//   try {
//     const { collectionName, docId } = req.params;
//     const { status } = req.body;

//     let collection;
//     switch (collectionName) {
//       case 'family_certificates': collection = FamilyCertificateCollection; break;
//       case 'warish': collection = WarishCollection; break;
//       case 'citizenship_certificates': collection = CitizenshipCollection; break;
//       case 'successor_certificates': collection = SuccessorCollection; break;
//       case 'power_of_attorney': collection = PowerOfAttorneyCollection; break;
//       case 'death_certificates': collection = DeathCertificateCollection; break;
//       case 'landless_certificates': collection = LandlessCertificateCollection; break;
//       case 'trade_licenses': collection = TradeLicenseCollection; break;
//       case 'premises': collection = PremisesCollection; break;
//       case 'trade_renewal': collection = TradeRenewalCollection; break;
//       case 'open_space_licenses': collection = OpenSpaceLicenseCollection; break;
//       case 'character_certificates': collection = CharacterCertificateCollection; break;
//       case 'unmarried_certificates': collection = UnmarriedCertificateCollection; break;
//       case 'nationality_certificates': collection = NationalityCollection; break;
//       case 'remarriage_certificates': collection = RemarriageCertificateCollection; break;
//       case 'annual_income_certificates': collection = AnnualIncomeCertificateCollection; break;
//       case 'same_name_certificates': collection = SameNameCertificateCollection; break;
//       case 'disability_certificates': collection = DisabilityCertificateCollection; break;
//       case 'religion_certificates': collection = ReligionCertificateCollection; break;
//       case 'permission_certificates': collection = PermissionCertificateCollection; break;
//       case 'passport_certificates': collection = PassportCertificateCollection; break;
//       case 'voter_transfer_certificates': collection = VoterTransferCollection; break;
//       case 'river_erosion_certificates': collection = RiverErosionCollection; break;
//       case 'new_voter_certificates': collection = NewVoterCollection; break;
//       case 'married_certificates': collection = MarriedCertificateCollection; break;
//       case 'voter_update_certificates': collection = VoterUpdateCollection; break;
//       case 'guardian_consent_certificates': collection = GuardianConsentCollection; break;
//       case 'non_citizen_certificates': collection = NonCitizenCertificateCollection; break;
//       case 'noc_certificates': collection = NocCertificateCollection; break;
//       case 'voter_verification_certificates': collection = VoterVerificationCollection; break;
//       default: return res.status(400).json({ message: 'অবৈধ কালেকশন' });
//     }

//     // আবেদনটি আগে খুঁজে বের করুন
//     const appDoc = await collection.findOne({ _id: new ObjectId(docId) });
//     if (!appDoc) return res.status(404).json({ message: 'আবেদন পাওয়া যায়নি' });

//     let updateFields = { status: status, updatedAt: new Date() };

//     // ✅ স্ট্যাটাস 'Approved' হলে সনদ নম্বর জেনারেট করুন (সঠিক ফাংশন ব্যবহার করে)
//     if (status === 'Approved') {
//       const upazilaCode = appDoc.upazilaCode || '1234';
//       const unionCode = appDoc.unionCode || '5678';
//       const year = new Date().getFullYear().toString();
      
//       // আপনার সঠিক getCertificateSerial ফাংশন কল করা হচ্ছে
//       const serial = await getCertificateSerial(year, unionCode);
//       const certificateNo = `${year}${upazilaCode}${unionCode}${serial}`;
      
//       updateFields.certificateSerial = serial;
//       updateFields.certificateNo = certificateNo;
//     }

//     // ডাটাবেস আপডেট করুন
//     await collection.updateOne({ _id: new ObjectId(docId) }, { $set: updateFields });

//     res.json({ success: true, message: `আবেদন ${status === 'Approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'} হয়েছে`, certificateNo: updateFields.certificateNo });
//   } catch (error) {
//     console.error('❌ Update Status Error:', error);
//     res.status(500).json({ message: 'স্ট্যাটাস আপডেট ব্যর্থ', error: error.message });
//   }
// });




// ------------------- ট্রেড লাইসেন্স নবায়ন -------------------
app.post('/api/trade-renewal', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      tradeRenewalId: 'TRN' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await TradeRenewalCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      tradeRenewalId: finalData.tradeRenewalId
    });
  } catch (error) {
    console.error('Trade Renewal Error:', error);
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

// ------------------- খোলা জায়গার লাইসেন্স -------------------
app.post('/api/open-space-license', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      licenseId: 'OSL' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await OpenSpaceLicenseCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      licenseId: finalData.licenseId
    });
  } catch (error) {
    console.error('Open Space License Error:', error);
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});
// ------------------- চারিত্রিক সনদ -------------------
app.post('/api/character-certificate', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'CHR' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await CharacterCertificateCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('Character Certificate Error:', error);
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

// ------------------- অবিবাহিত সনদ -------------------
app.post('/api/unmarried-certificate', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'UNM' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await UnmarriedCertificateCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('Unmarried Certificate Error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// ------------------- জাতীয়তা সনদ -------------------
app.post('/api/nationality-certificate', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'NAT' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await NationalityCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('Nationality Certificate Error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// ------------------- পুনঃ বিবাহ না হওয়ার সনদ -------------------
app.post('/api/remarriage-certificate', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'RMD' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await RemarriageCertificateCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('Remarriage Certificate Error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// ------------------- বার্ষিক আয়ের প্রত্যয়ন -------------------
app.post('/api/annual-income-certificate', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'AIN' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await AnnualIncomeCertificateCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('Annual Income Certificate Error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// ------------------- একই নামের প্রত্যয়ন -------------------
app.post('/api/same-name-certificate', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'SNM' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await SameNameCertificateCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('Same Name Certificate Error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});
// ------------------- প্রতিবন্ধী সনদ -------------------
app.post('/api/disability-certificate', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'DSB' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await DisabilityCertificateCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('Disability Certificate Error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// ------------------- ধর্মীয় সনদ -------------------
app.post('/api/religion-certificate', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'REL' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await ReligionCertificateCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('Religion Certificate Error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// ------------------- অনুমতি পত্র -------------------
app.post('/api/permission-certificate', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'PRM' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await PermissionCertificateCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('Permission Certificate Error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// ------------------- পাসপোর্ট সুপারিশপত্র -------------------
app.post('/api/passport-certificate', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'PPS' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await PassportCertificateCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('Passport Certificate Error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// ------------------- ভোটার আইডি স্থানান্তর আবেদন -------------------
app.post('/api/voter-transfer', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'VTR' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await VoterTransferCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('Voter Transfer Error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// ------------------- নদী ভাঙনের সনদ -------------------
app.post('/api/river-erosion-certificate', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'RVR' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await RiverErosionCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('River Erosion Certificate Error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// ------------------- নতুন ভোটার সুপারিশ -------------------
app.post('/api/new-voter-certificate', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'NVR' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await NewVoterCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('New Voter Certificate Error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// ------------------- বিবাহিত সনদ -------------------
app.post('/api/married-certificate', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'MRD' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await MarriedCertificateCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('Married Certificate Error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});

app.post('/api/voter-update-certificate', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'VUP' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await VoterUpdateCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('Voter Update Certificate Error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});


// ------------------- অভিভাবকের সম্মতিপত্র -------------------
app.post('/api/guardian-consent-certificate', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'GCN' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await GuardianConsentCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('Guardian Consent Certificate Error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});


// ------------------- নাগরিকত্ব সনদপত্র (অ-নাগরিক নয়) -------------------
app.post('/api/non-citizen-certificate', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'NCT' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await NonCitizenCertificateCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('Non-Citizen Certificate Error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// ------------------- অনাপত্তি সনদপত্র (NOC) -------------------
app.post('/api/noc-certificate', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'NOC' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await NocCertificateCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('NOC Certificate Error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// ------------------- ভোটার যাচাইকরণ -------------------
app.post('/api/voter-verification-certificate', async (req, res) => {
  try {
    const data = req.body;
    const finalData = {
      ...data,
      certificateId: 'VVR' + Date.now(),
      status: 'Pending',
      submittedAt: new Date()
    };
    const result = await VoterVerificationCollection.insertOne(finalData);
    res.status(201).send({
      success: true,
      result,
      certificateId: finalData.certificateId
    });
  } catch (error) {
    console.error('Voter Verification Certificate Error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// ========================================================================
// ✅ মিসিং GET API সমূহ (ব্রাউজারে ডাটা দেখার জন্য যুক্ত করা হলো)
// ========================================================================

// ১. ওয়ারিশ সনদ GET
app.get('/api/warish', async (req, res) => {
  try {
    const result = await WarishCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ২. নাগরিকত্ব সনদ GET
app.get('/api/citizenship-certificate', async (req, res) => {
  try {
    const result = await CitizenshipCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ৩. উত্তরাধিকারী সনদ GET
app.get('/api/successor-certificate', async (req, res) => {
  try {
    const result = await SuccessorCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ৪. পাওয়ার অফ অ্যাটর্নি GET
app.get('/api/power-of-attorney', async (req, res) => {
  try {
    const result = await PowerOfAttorneyCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ৫. মৃত্যু সনদ GET
app.get('/api/death-certificate', async (req, res) => {
  try {
    const result = await DeathCertificateCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ৬. ট্রেড লাইসেন্স GET
app.get('/api/trade-license', async (req, res) => {
  try {
    const result = await TradeLicenseCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ৭. প্রাঙ্গণ লাইসেন্স GET
app.get('/api/premises', async (req, res) => {
  try {
    const result = await PremisesCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ৮. ট্রেড লাইসেন্স নবায়ন GET
app.get('/api/trade-renewal', async (req, res) => {
  try {
    const result = await TradeRenewalCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ৯. খোলা জায়গার লাইসেন্স GET
app.get('/api/open-space-license', async (req, res) => {
  try {
    const result = await OpenSpaceLicenseCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ১০. চারিত্রিক সনদ GET
app.get('/api/character-certificate', async (req, res) => {
  try {
    const result = await CharacterCertificateCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ১১. অবিবাহিত সনদ GET
app.get('/api/unmarried-certificate', async (req, res) => {
  try {
    const result = await UnmarriedCertificateCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ১২. জাতীয়তা সনদ GET
app.get('/api/nationality-certificate', async (req, res) => {
  try {
    const result = await NationalityCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ১৩. পুনঃ বিবাহ না হওয়ার সনদ GET
app.get('/api/remarriage-certificate', async (req, res) => {
  try {
    const result = await RemarriageCertificateCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ১৪. বার্ষিক আয়ের প্রত্যয়ন GET
app.get('/api/annual-income-certificate', async (req, res) => {
  try {
    const result = await AnnualIncomeCertificateCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ১৫. একই নামের প্রত্যয়ন GET
app.get('/api/same-name-certificate', async (req, res) => {
  try {
    const result = await SameNameCertificateCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ১৬. প্রতিবন্ধী সনদ GET
app.get('/api/disability-certificate', async (req, res) => {
  try {
    const result = await DisabilityCertificateCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ১৭. ধর্মীয় সনদ GET
app.get('/api/religion-certificate', async (req, res) => {
  try {
    const result = await ReligionCertificateCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ১৮. অনুমতি পত্র GET
app.get('/api/permission-certificate', async (req, res) => {
  try {
    const result = await PermissionCertificateCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ১৯. পাসপোর্ট সুপারিশপত্র GET
app.get('/api/passport-certificate', async (req, res) => {
  try {
    const result = await PassportCertificateCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ২০. ভোটার আইডি স্থানান্তর GET
app.get('/api/voter-transfer', async (req, res) => {
  try {
    const result = await VoterTransferCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ২১. নদী ভাঙনের সনদ GET
app.get('/api/river-erosion-certificate', async (req, res) => {
  try {
    const result = await RiverErosionCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ২২. নতুন ভোটার সুপারিশ GET
app.get('/api/new-voter-certificate', async (req, res) => {
  try {
    const result = await NewVoterCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ২৩. বিবাহিত সনদ GET
app.get('/api/married-certificate', async (req, res) => {
  try {
    const result = await MarriedCertificateCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ২৪. ভোটার তথ্য সংশোধন GET
app.get('/api/voter-update-certificate', async (req, res) => {
  try {
    const result = await VoterUpdateCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ২৫. অভিভাবকের সম্মতিপত্র GET
app.get('/api/guardian-consent-certificate', async (req, res) => {
  try {
    const result = await GuardianConsentCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ২৬. নাগরিকত্ব সনদপত্র GET
app.get('/api/non-citizen-certificate', async (req, res) => {
  try {
    const result = await NonCitizenCertificateCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ২৭. অনাপত্তি সনদপত্র (NOC) GET
app.get('/api/noc-certificate', async (req, res) => {
  try {
    const result = await NocCertificateCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ২৮. ভোটার যাচাইকরণ GET
app.get('/api/voter-verification-certificate', async (req, res) => {
  try {
    const result = await VoterVerificationCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ------------------------------------------------------------------------
// 🟢 ওয়েবসাইট ড্যাশবোর্ড ও কনফিগারেশনের জন্য মিসিং GET API সমূহ
// ------------------------------------------------------------------------

// ২৯. নোটিশ GET (ফ্রন্টএন্ডে দেখানোর জন্য)
app.get('/api/notices', async (req, res) => {
  try {
    const result = await NoticeCollection.find({}).sort({ createdAt: -1 }).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ৩০. নাগরিক সেবা GET
app.get('/api/services', async (req, res) => {
  try {
    const result = await ServiceCollection.find({}).toArray();
    res.send(result);
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ৩১. ইউনিয়ন সেটিংস GET
app.get('/api/union-settings', async (req, res) => {
  try {
    const result = await db.collection('union_settings').findOne({});
    res.send(result || {});
  } catch (error) { res.status(500).send({ success: false, message: error.message }); }
});

// ------------------- সনদপত্র জেনারেট API -------------------
app.get('/api/certificate/:collectionName/:docId', async (req, res) => {
  try {
    console.log('📄 Certificate request received:', req.params);
    const { collectionName, docId } = req.params;

    // 1. Validate ObjectId
    if (!ObjectId.isValid(docId)) {
      console.error('❌ Invalid ObjectId:', docId);
      return res.status(400).json({ error: 'অবৈধ আবেদন আইডি' });
    }

    const collection = db.collection(collectionName);
    console.log(`🔍 Searching in collection: ${collectionName} with ID: ${docId}`);

    const appDoc = await collection.findOne({ _id: new ObjectId(docId) });
    if (!appDoc) {
      console.error('❌ Document not found for ID:', docId);
      return res.status(404).json({ error: 'আবেদন পাওয়া যায়নি' });
    }
    console.log('✅ Application found:', appDoc._id);

    // 2. Union info
    const unionInfo = {
      name: '১৬ নং মোহলপুর ইউনিয়ন পরিষদ',
      address: 'মোহলপুর, দেবীদ্বার,কুমিল্লা ',
      website: 'https://mohanpunup.amarunion.com.bd',
      email: 'feromito@gmail.com',
      mobile: '০১৩১৮৩৭৭৯৩৩',
      defaultUpazilaCode: '1234',
      defaultUnionCode: '5678'
    };

    // 3. Certificate number generation
    let certificateNo = appDoc.certificateNo;
    if (!certificateNo) {
      const year = new Date().getFullYear().toString();
      const upazilaCode = appDoc.upazilaCode || unionInfo.defaultUpazilaCode;
      const unionCode = appDoc.unionCode || unionInfo.defaultUnionCode;
      
      console.log(`🔄 Generating serial for year ${year}, union ${unionCode}`);
      try {
        const serial = await getCertificateSerial(year, unionCode);
        certificateNo = `${year}${upazilaCode}${unionCode}${serial}`;
        console.log(`✅ Serial generated: ${serial}, full number: ${certificateNo}`);
      } catch (serialErr) {
        console.error('❌ Serial generation failed:', serialErr);
        // Fallback: use timestamp
        certificateNo = `${year}${upazilaCode}${unionCode}${Date.now().toString().slice(-5)}`;
        console.log(`⚠️ Using fallback certificate number: ${certificateNo}`);
      }

      // Save the certificate number
      try {
        await collection.updateOne(
          { _id: new ObjectId(docId) },
          { $set: { certificateNo, certificateSerial: serial || 'fallback', certificateYear: year } }
        );
        console.log('✅ Certificate number saved to database');
      } catch (updateErr) {
        console.error('❌ Failed to save certificate number:', updateErr);
        // We still want to send the response, so don't throw.
      }
    } else {
      console.log(`✅ Using existing certificate number: ${certificateNo}`);
    }

    // 4. Send response
    res.json({
      success: true,
      application: appDoc,
      certificateNo,
      unionInfo
    });
  } catch (error) {
    console.error('❌ Certificate route error (top-level):', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

app.post('/api/union-settings', async (req, res) => {
  try {
    const data = req.body;
    await db.collection('union_settings').updateOne(
      {},
      { $set: data, updatedAt: new Date() },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =========================================================================

    console.log("MongoDB Connected & All Routes Ready Successfully!");
  } catch (error) { console.error(error); }
}


run().catch(console.dir);

app.get('/', (req, res) => res.send('Amar Union Server Running'));
module.exports = app;