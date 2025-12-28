// MongoDB Seed Script
// Run this to populate test data for the healthcare app
// Usage: mongosh < seed.js

// Connect to database
use('smart-healthcare');

// Clear existing data (optional - comment out if you want to keep data)
// db.users.deleteMany({});

console.log('Seeding test data...');

// Sample Doctors
const doctors = [
  {
    name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@hospital.com",
    phone: "9876543210",
    password: "$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2", // hashed 'password'
    userType: "doctor",
    profilePicture: "https://via.placeholder.com/150",
    address: "123 Medical Plaza, Delhi",
    city: "Delhi",
    latitude: 28.6139,
    longitude: 77.2090,
    isAvailable: true,
    licenseNumber: "MCI/2018/12345",
    specialization: "General Physician",
    yearsOfExperience: 12,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Dr. Priya Sharma",
    email: "priya.sharma@hospital.com",
    phone: "9876543211",
    password: "$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2",
    userType: "doctor",
    profilePicture: "https://via.placeholder.com/150",
    address: "456 Health Center, Delhi",
    city: "Delhi",
    latitude: 28.6250,
    longitude: 77.2150,
    isAvailable: true,
    licenseNumber: "MCI/2019/54321",
    specialization: "Cardiologist",
    yearsOfExperience: 8,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Dr. Amit Verma",
    email: "amit.verma@hospital.com",
    phone: "9876543212",
    password: "$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2",
    userType: "doctor",
    profilePicture: "https://via.placeholder.com/150",
    address: "789 Medical Tower, Delhi",
    city: "Delhi",
    latitude: 28.6050,
    longitude: 77.2200,
    isAvailable: true,
    licenseNumber: "MCI/2020/98765",
    specialization: "Pediatrician",
    yearsOfExperience: 6,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample Nurses
const nurses = [
  {
    name: "Nurse Anjali Singh",
    email: "anjali.singh@hospital.com",
    phone: "9876543220",
    password: "$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2",
    userType: "nurse",
    profilePicture: "https://via.placeholder.com/150",
    address: "101 Nursing Care, Delhi",
    city: "Delhi",
    latitude: 28.6170,
    longitude: 77.2110,
    isAvailable: true,
    licenseNumber: "INC/2018/22222",
    specialization: "Home Care",
    yearsOfExperience: 7,
    rating: 4.9,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Nurse Rahul Patel",
    email: "rahul.patel@hospital.com",
    phone: "9876543221",
    password: "$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2",
    userType: "nurse",
    profilePicture: "https://via.placeholder.com/150",
    address: "202 Care Center, Delhi",
    city: "Delhi",
    latitude: 28.6080,
    longitude: 77.2180,
    isAvailable: true,
    licenseNumber: "INC/2019/33333",
    specialization: "ICU Care",
    yearsOfExperience: 5,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample Ambulances
const ambulances = [
  {
    name: "Emergency Ambulance Service 101",
    email: "ambulance101@service.com",
    phone: "9876543230",
    password: "$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2",
    userType: "ambulance",
    profilePicture: "https://via.placeholder.com/150",
    address: "101 Emergency Station, Delhi",
    city: "Delhi",
    latitude: 28.6120,
    longitude: 77.2070,
    isAvailable: true,
    ambulanceType: "ICU Ambulance",
    vehicleNumber: "DL-01-AB-1234",
    operatorName: "Rajesh Kumar",
    operatorPhone: "9876543240",
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Emergency Ambulance Service 102",
    email: "ambulance102@service.com",
    phone: "9876543231",
    password: "$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2",
    userType: "ambulance",
    profilePicture: "https://via.placeholder.com/150",
    address: "102 Emergency Station, Delhi",
    city: "Delhi",
    latitude: 28.6200,
    longitude: 77.2130,
    isAvailable: true,
    ambulanceType: "Basic Life Support",
    vehicleNumber: "DL-01-CD-5678",
    operatorName: "Priya Singh",
    operatorPhone: "9876543241",
    rating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample Volunteers
const volunteers = [
  {
    name: "Volunteer Deepak Gupta",
    email: "deepak.gupta@volunteer.com",
    phone: "9876543250",
    password: "$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2",
    userType: "volunteer",
    profilePicture: "https://via.placeholder.com/150",
    address: "303 Community Center, Delhi",
    city: "Delhi",
    latitude: 28.6160,
    longitude: 77.2095,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Volunteer Meera Nair",
    email: "meera.nair@volunteer.com",
    phone: "9876543251",
    password: "$2a$10$dXJ3SW6G7P50eS/6A2btCOYvjJjH.wJwL6jLCzJ.fNblMvAXLYhV2",
    userType: "volunteer",
    profilePicture: "https://via.placeholder.com/150",
    address: "404 Helping Hands, Delhi",
    city: "Delhi",
    latitude: 28.6100,
    longitude: 77.2160,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Insert all users
try {
  const doctorResult = db.users.insertMany(doctors);
  console.log(`✓ Inserted ${doctorResult.insertedIds.length} doctors`);
  
  const nurseResult = db.users.insertMany(nurses);
  console.log(`✓ Inserted ${nurseResult.insertedIds.length} nurses`);
  
  const ambulanceResult = db.users.insertMany(ambulances);
  console.log(`✓ Inserted ${ambulanceResult.insertedIds.length} ambulances`);
  
  const volunteerResult = db.users.insertMany(volunteers);
  console.log(`✓ Inserted ${volunteerResult.insertedIds.length} volunteers`);
  
  console.log('\n✓ Test data seeded successfully!');
  console.log(`Total users: ${doctorResult.insertedIds.length + nurseResult.insertedIds.length + ambulanceResult.insertedIds.length + volunteerResult.insertedIds.length}`);
  
  // Create geospatial index for better performance
  db.users.createIndex({ "latitude": 1, "longitude": 1 });
  console.log('✓ Created geospatial index on users');
  
} catch (error) {
  console.error('Error seeding data:', error.message);
}

// Verify seeded data
console.log('\nVerifying seeded data:');
console.log(`Doctors: ${db.users.countDocuments({ userType: 'doctor' })}`);
console.log(`Nurses: ${db.users.countDocuments({ userType: 'nurse' })}`);
console.log(`Ambulances: ${db.users.countDocuments({ userType: 'ambulance' })}`);
console.log(`Volunteers: ${db.users.countDocuments({ userType: 'volunteer' })}`);
