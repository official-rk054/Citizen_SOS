require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-healthcare';

const doctors = [
  {
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@hospital.com',
    phone: '9876543210',
    password: '$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2',
    userType: 'doctor',
    address: 'Sapthagiri College Rd, Bengaluru',
    city: 'Bengaluru',
    latitude: 13.0105,
    longitude: 77.4810,
    isAvailable: true,
    licenseNumber: 'MCI/2018/12345',
    specialization: 'General Physician',
    yearsOfExperience: 12,
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@hospital.com',
    phone: '9876543211',
    password: '$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2',
    userType: 'doctor',
    address: 'Jalahalli West, Bengaluru',
    city: 'Bengaluru',
    latitude: 13.0510,
    longitude: 77.4950,
    isAvailable: true,
    licenseNumber: 'MCI/2019/54321',
    specialization: 'Cardiologist',
    yearsOfExperience: 8,
  },
  {
    name: 'Dr. Amit Verma',
    email: 'amit.verma@hospital.com',
    phone: '9876543212',
    password: '$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2',
    userType: 'doctor',
    address: 'Madavara, Bengaluru',
    city: 'Bengaluru',
    latitude: 13.0000,
    longitude: 77.4700,
    isAvailable: true,
    licenseNumber: 'MCI/2020/98765',
    specialization: 'Pediatrician',
    yearsOfExperience: 6,
  },
];

const nurses = [
  {
    name: 'Nurse Anjali Singh',
    email: 'anjali.singh@hospital.com',
    phone: '9876543220',
    password: '$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2',
    userType: 'nurse',
    address: 'Nelamangala, Bengaluru',
    city: 'Bengaluru',
    latitude: 13.0890,
    longitude: 77.3930,
    isAvailable: true,
    licenseNumber: 'INC/2018/22222',
    specialization: 'Home Care',
    yearsOfExperience: 7,
  },
  {
    name: 'Nurse Rahul Patel',
    email: 'rahul.patel@hospital.com',
    phone: '9876543221',
    password: '$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2',
    userType: 'nurse',
    address: 'Hesaraghatta Rd, Bengaluru',
    city: 'Bengaluru',
    latitude: 13.0700,
    longitude: 77.5200,
    isAvailable: true,
    licenseNumber: 'INC/2019/33333',
    specialization: 'ICU Care',
    yearsOfExperience: 5,
  },
];

const ambulances = [
  {
    name: 'Emergency Ambulance Service 101',
    email: 'ambulance101@service.com',
    phone: '9876543230',
    password: '$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2',
    userType: 'ambulance',
    address: 'Madavara, Bengaluru',
    city: 'Bengaluru',
    latitude: 13.0220,
    longitude: 77.4600,
    isAvailable: true,
    ambulanceType: 'ICU Ambulance',
    vehicleNumber: 'KA-01-AB-1234',
    operatorName: 'Rajesh Kumar',
    operatorPhone: '9876543240',
  },
  {
    name: 'Emergency Ambulance Service 102',
    email: 'ambulance102@service.com',
    phone: '9876543231',
    password: '$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2',
    userType: 'ambulance',
    address: 'Jalahalli West, Bengaluru',
    city: 'Bengaluru',
    latitude: 13.0300,
    longitude: 77.4700,
    isAvailable: true,
    ambulanceType: 'Basic Life Support',
    vehicleNumber: 'KA-01-CD-5678',
    operatorName: 'Priya Singh',
    operatorPhone: '9876543241',
  },
];

const volunteers = [
  {
    name: 'Volunteer Deepak Gupta',
    email: 'deepak.gupta@volunteer.com',
    phone: '9876543250',
    password: '$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2',
    userType: 'volunteer',
    address: '303 Community Center, Delhi',
    city: 'Delhi',
    latitude: 28.6160,
    longitude: 77.2095,
    isAvailable: true,
  },
  {
    name: 'Volunteer Meera Nair',
    email: 'meera.nair@volunteer.com',
    phone: '9876543251',
    password: '$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2',
    userType: 'volunteer',
    address: '404 Helping Hands, Delhi',
    city: 'Delhi',
    latitude: 28.6100,
    longitude: 77.2160,
    isAvailable: true,
  },
];

// Additional providers near Bengaluru (approx 13.01, 77.46)
const blrDoctors = [
  {
    name: 'Dr. Neha Rao',
    email: 'neha.rao@hospital.com',
    phone: '9800000001',
    password: '$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2',
    userType: 'doctor',
    address: 'Sapthagiri College Rd, Bengaluru',
    city: 'Bengaluru',
    latitude: 13.0105,
    longitude: 77.4810,
    isAvailable: true,
    licenseNumber: 'KMC/2017/11111',
    specialization: 'General Physician',
    yearsOfExperience: 9,
  },
  {
    name: 'Dr. Arjun Menon',
    email: 'arjun.menon@hospital.com',
    phone: '9800000002',
    password: '$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2',
    userType: 'doctor',
    address: 'Jalahalli West, Bengaluru',
    city: 'Bengaluru',
    latitude: 13.0510,
    longitude: 77.4950,
    isAvailable: true,
    licenseNumber: 'KMC/2016/22222',
    specialization: 'Cardiologist',
    yearsOfExperience: 11,
  },
];

const blrNurses = [
  {
    name: 'Nurse Kavya',
    email: 'kavya.nurse@hospital.com',
    phone: '9800000011',
    password: '$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2',
    userType: 'nurse',
    address: 'Nelamangala, Bengaluru',
    city: 'Bengaluru',
    latitude: 13.0890,
    longitude: 77.3930,
    isAvailable: true,
    licenseNumber: 'INC/2015/33333',
    specialization: 'Home Care',
    yearsOfExperience: 6,
  },
];

const blrAmbulances = [
  {
    name: 'Bengaluru ICU Ambulance 01',
    email: 'blr.ambulance01@service.com',
    phone: '9800000021',
    password: '$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2',
    userType: 'ambulance',
    address: 'Madavara, Bengaluru',
    city: 'Bengaluru',
    latitude: 13.0220,
    longitude: 77.4600,
    isAvailable: true,
    ambulanceType: 'ICU Ambulance',
    vehicleNumber: 'KA-01-AB-1234',
    operatorName: 'Suresh',
    operatorPhone: '9800000031',
  },
];

async function upsertUsers(list) {
  let added = 0, updated = 0;
  for (const item of list) {
    const existing = await User.findOne({ email: item.email });
    if (existing) {
      await User.updateOne(
        { _id: existing._id },
        {
          $set: {
            name: item.name,
            phone: item.phone,
            userType: item.userType,
            address: item.address,
            city: item.city,
            latitude: item.latitude,
            longitude: item.longitude,
            isAvailable: item.isAvailable,
            licenseNumber: item.licenseNumber,
            specialization: item.specialization,
            yearsOfExperience: item.yearsOfExperience,
            ambulanceType: item.ambulanceType,
            vehicleNumber: item.vehicleNumber,
            operatorName: item.operatorName,
            operatorPhone: item.operatorPhone,
            updatedAt: new Date(),
          },
        }
      );
      updated++;
    } else {
      const user = new User({ ...item, createdAt: new Date(), updatedAt: new Date() });
      await user.save();
      added++;
    }
  }
  return { added, updated };
}

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    const doctorsRes = await upsertUsers(doctors);
    console.log(`Doctors - added: ${doctorsRes.added}, updated: ${doctorsRes.updated}`);

    const blrDocRes = await upsertUsers(blrDoctors);
    console.log(`BLR Doctors - added: ${blrDocRes.added}, updated: ${blrDocRes.updated}`);

    const nursesRes = await upsertUsers(nurses);
    console.log(`Nurses  - added: ${nursesRes.added}, updated: ${nursesRes.updated}`);

    const blrNursRes = await upsertUsers(blrNurses);
    console.log(`BLR Nurses  - added: ${blrNursRes.added}, updated: ${blrNursRes.updated}`);

    const ambRes = await upsertUsers(ambulances);
    console.log(`Ambulances - added: ${ambRes.added}, updated: ${ambRes.updated}`);

    const blrAmbRes = await upsertUsers(blrAmbulances);
    console.log(`BLR Ambulances - added: ${blrAmbRes.added}, updated: ${blrAmbRes.updated}`);

    const volRes = await upsertUsers(volunteers);
    console.log(`Volunteers - added: ${volRes.added}, updated: ${volRes.updated}`);

    // Create index for coord fields
    await User.collection.createIndex({ latitude: 1, longitude: 1 });
    console.log('Geospatial index created on users (lat/lon simple index)');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  }
})();
