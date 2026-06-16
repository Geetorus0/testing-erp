import { db } from './src/lib/db';

async function main() {
  console.log('🏠 Seeding Hostel Data...');
  
  const tenantId = 'cmqguoqpe0004nhhlq6nzd1uz';
  
  // Check if hostels already exist
  const existingHostels = await db.hostel.findMany({ where: { tenantId } });
  
  if (existingHostels.length > 0) {
    console.log('✅ Hostels already exist, skipping seed');
    return;
  }
  
  // Get students for allocations
  const students = await db.student.findMany({
    where: { tenantId },
    take: 30
  });
  
  console.log(`Found ${students.length} students for allocations`);

  // Create hostels
  const hostels = await Promise.all([
    db.hostel.create({
      data: {
        tenantId,
        name: 'Ganga Hostel',
        type: 'boys',
        totalRooms: 50,
        address: 'North Campus, Block A',
        facilities: JSON.stringify(['WiFi', 'Laundry', 'Mess', 'Gym', 'Study Room'])
      }
    }),
    db.hostel.create({
      data: {
        tenantId,
        name: 'Yamuna Hostel',
        type: 'boys',
        totalRooms: 40,
        address: 'North Campus, Block B',
        facilities: JSON.stringify(['WiFi', 'Laundry', 'Mess', 'Sports Room'])
      }
    }),
    db.hostel.create({
      data: {
        tenantId,
        name: 'Saraswati Hostel',
        type: 'girls',
        totalRooms: 45,
        address: 'South Campus, Block A',
        facilities: JSON.stringify(['WiFi', 'Laundry', 'Mess', 'Common Room', 'Study Room'])
      }
    }),
    db.hostel.create({
      data: {
        tenantId,
        name: 'Kaveri Hostel',
        type: 'girls',
        totalRooms: 35,
        address: 'South Campus, Block B',
        facilities: JSON.stringify(['WiFi', 'Laundry', 'Mess', 'Garden'])
      }
    })
  ]);

  console.log(`Created ${hostels.length} hostels`);

  // Create rooms for each hostel
  const roomTypes = ['single', 'double', 'triple', 'dormitory'];
  
  for (const hostel of hostels) {
    for (let floor = 1; floor <= 4; floor++) {
      for (let room = 1; room <= 12; room++) {
        const type = roomTypes[Math.floor(Math.random() * roomTypes.length)];
        const capacity = type === 'single' ? 1 : type === 'double' ? 2 : type === 'triple' ? 3 : 6;
        const occupied = Math.floor(Math.random() * (capacity + 1));
        
        await db.room.create({
          data: {
            tenantId,
            hostelId: hostel.id,
            roomNumber: `${floor}${String(room).padStart(2, '0')}`,
            floor,
            capacity,
            occupied,
            type,
            status: occupied === capacity ? 'full' : occupied === 0 ? 'available' : 'available',
            rent: type === 'single' ? 8000 : type === 'double' ? 6000 : type === 'triple' ? 4500 : 3000
          }
        });
      }
    }
  }

  console.log('Created rooms for all hostels');

  // Create room allocations for students
  const allRooms = await db.room.findMany({
    where: { tenantId }
  });

  const availableRooms = allRooms.filter(r => r.occupied < r.capacity);
  
  for (let i = 0; i < Math.min(30, students.length); i++) {
    const student = students[i];
    
    if (student && availableRooms.length > 0) {
      const roomIndex = i % availableRooms.length;
      const room = availableRooms[roomIndex];
      
      const existingAllocation = await db.roomAllocation.findFirst({
        where: { studentId: student.id, status: 'active' }
      });
      
      if (!existingAllocation) {
        await db.roomAllocation.create({
          data: {
            tenantId,
            roomId: room.id,
            studentId: student.id,
            bedNumber: (room.occupied % room.capacity) + 1,
            allocationDate: new Date(2024, 6, 1),
            status: 'active'
          }
        });
      }
    }
  }

  console.log('Created room allocations');

  // Create hostel complaints
  const complaintCategories = ['electrical', 'plumbing', 'furniture', 'cleaning', 'other'] as const;
  const complaintDescriptions = {
    electrical: ['Power outlet not working', 'Light flickering in room', 'AC not cooling properly', 'Ceiling fan making noise'],
    plumbing: ['Water leakage in bathroom', 'Tap not working', 'Drainage blocked', 'Geyser not working'],
    furniture: ['Bed frame broken', 'Study table drawer stuck', 'Chair leg loose', 'Wardrobe door broken'],
    cleaning: ['Room not cleaned', 'Common bathroom dirty', 'Cobwebs in corner', 'Dust accumulation'],
    other: ['No WiFi in room', 'Noise from nearby room', 'Security concern', 'Maintenance request']
  };

  for (let i = 0; i < 20; i++) {
    const category = complaintCategories[i % complaintCategories.length];
    const descriptions = complaintDescriptions[category];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const randomRoom = allRooms[Math.floor(Math.random() * allRooms.length)];
    const student = students[Math.floor(Math.random() * Math.min(30, students.length))];

    await db.hostelComplaint.create({
      data: {
        tenantId,
        studentId: student?.id || null,
        hostelId: randomRoom.hostelId,
        roomNumber: randomRoom.roomNumber,
        category,
        description,
        status: ['pending', 'in_progress', 'resolved'][i % 3] as string,
        remarks: i % 3 === 2 ? 'Issue resolved by maintenance team' : null,
        resolvedAt: i % 3 === 2 ? new Date() : null,
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000))
      }
    });
  }

  console.log('Created hostel complaints');
  console.log('✅ Hostel seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
