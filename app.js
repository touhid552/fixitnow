const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── In-memory data store (replaces localStorage) ───────────────────────────

const db = {
  users: [
    { id: 'u1', email: 'user@demo.com', password: 'pass123', role: 'user',     name: 'Demo User'    },
    { id: 'u2', email: 'provider@demo.com', password: 'pass123', role: 'provider', name: 'Sohel Mahmud' },
    { id: 'u3', email: 'admin@demo.com', password: 'pass123', role: 'admin',   name: 'Admin'        },
  ],
  bookings: [
    { id: 'BK1001', service: 'AC Repair',    date: 'Jan 15', time: '10:00 AM – 12:00 PM', address: 'Mirpur-10, Dhaka', name: 'Karim Ahmed',  phone: '+880 1700 000001', provider: 'Sohel Mahmud', amount: 900, status: 'Completed',   createdAt: '2025-01-15T10:00:00Z' },
    { id: 'BK1002', service: 'Electrician',  date: 'Jan 15', time: '02:00 PM – 04:00 PM', address: 'Dhanmondi, Dhaka',  name: 'Fatema Begum', phone: '+880 1700 000002', provider: 'Rafiq Khan',   amount: 700, status: 'In Progress', createdAt: '2025-01-15T14:00:00Z' },
    { id: 'BK1003', service: 'Plumber',      date: 'Jan 15', time: '08:00 AM – 10:00 AM', address: 'Uttara, Dhaka',     name: 'Omar Faruk',   phone: '+880 1700 000003', provider: 'Unassigned',   amount: 600, status: 'Pending',     createdAt: '2025-01-15T08:00:00Z' },
    { id: 'BK1004', service: 'Mechanic',     date: 'Jan 14', time: '12:00 PM – 02:00 PM', address: 'Gulshan, Dhaka',    name: 'Rina Parvin',  phone: '+880 1700 000004', provider: 'Touhid Hasan', amount: 800, status: 'Completed',   createdAt: '2025-01-14T12:00:00Z' },
    { id: 'BK1005', service: 'Painter',      date: 'Jan 14', time: '04:00 PM – 06:00 PM', address: 'Banani, Dhaka',     name: 'Jamal Hossain',phone: '+880 1700 000005', provider: 'Nadia Akter',  amount: 1300,status: 'Cancelled',  createdAt: '2025-01-14T16:00:00Z' },
  ],
  providers: [
    { id: 'p1', name: 'Rafiq Khan',    specialty: 'Electrician',  area: 'Dhanmondi', experience: 8,  rating: 4.9, jobs: 63, earnings: 50400, status: 'Active'  },
    { id: 'p2', name: 'Sohel Mahmud',  specialty: 'AC Mechanic',  area: 'Mirpur',    experience: 10, rating: 4.8, jobs: 47, earnings: 38400, status: 'Active'  },
    { id: 'p3', name: 'Nadia Akter',   specialty: 'Painter',      area: 'Uttara',    experience: 5,  rating: 5.0, jobs: 22, earnings: 26400, status: 'Pending' },
    { id: 'p4', name: 'Touhid Hasan',  specialty: 'Mechanic',     area: 'Gulshan',   experience: 6,  rating: 4.7, jobs: 38, earnings: 30400, status: 'Active'  },
  ],
  services: [
    { id: 's1', icon: '🌬️', name: 'AC Repair',    price: 800,  providers: 12, bookings: 345, revenue: 27600, active: true  },
    { id: 's2', icon: '⚡',  name: 'Electrician',  price: 600,  providers: 18, bookings: 412, revenue: 24720, active: true  },
    { id: 's3', icon: '🚿',  name: 'Plumber',      price: 500,  providers: 15, bookings: 289, revenue: 14400, active: true  },
    { id: 's4', icon: '🔧',  name: 'Mechanic',     price: 700,  providers: 8,  bookings: 198, revenue: 13860, active: true  },
    { id: 's5', icon: '🪚',  name: 'Carpenter',    price: 900,  providers: 6,  bookings: 134, revenue: 12060, active: true  },
    { id: 's6', icon: '🎨',  name: 'Painter',      price: 1200, providers: 4,  bookings: 87,  revenue: 10440, active: false },
  ],
  pendingProviders: [
    { id: 'pp1', name: 'Raju Mia',    specialty: 'Carpenter',  area: 'Keraniganj',  experience: '6 years', appliedAt: 'Jan 14', status: 'Pending' },
    { id: 'pp2', name: 'Selim Reza',  specialty: 'Electrician',area: 'Narayanganj', experience: '4 years', appliedAt: 'Jan 15', status: 'Pending' },
    { id: 'pp3', name: 'Mitu Das',    specialty: 'Plumber',    area: 'Savar',       experience: '3 years', appliedAt: 'Jan 15', status: 'Pending' },
  ],
};

let bookingCounter = 1006;

// ─── Helper ──────────────────────────────────────────────────────────────────

function findUser(email, password) {
  return db.users.find(u => u.email === email && u.password === password) || null;
}

// ─── AUTH ROUTES ─────────────────────────────────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required.' });

  const user = findUser(email, password);
  if (!user)
    return res.status(401).json({ error: 'Invalid email or password.' });

  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, phone, password, role, specialty, experience, area, bio } = req.body;

  if (!firstName || !lastName || !email || !password)
    return res.status(400).json({ error: 'All required fields must be filled.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  if (db.users.find(u => u.email === email))
    return res.status(409).json({ error: 'An account with this email already exists.' });

  const newUser = {
    id: 'u' + (db.users.length + 1),
    email, password, phone,
    role: role || 'user',
    name: `${firstName} ${lastName}`.trim(),
    ...(role === 'provider' && { specialty, experience, area, bio }),
  };
  db.users.push(newUser);

  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ success: true, user: safeUser });
});

// ─── BOOKINGS ROUTES ─────────────────────────────────────────────────────────

app.get('/api/bookings', (req, res) => {
  const { userId, status } = req.query;
  let results = [...db.bookings];
  if (status && status !== 'all') results = results.filter(b => b.status === status);
  res.json(results.reverse());
});

app.post('/api/bookings', (req, res) => {
  const { service, date, time, address, issue, name, phone, provider, price } = req.body;
  if (!service || !date || !time || !address || !name || !phone)
    return res.status(400).json({ error: 'Please fill in all required fields.' });

  const booking = {
    id: 'BK' + bookingCounter++,
    service, date, time, address,
    issue: issue || '',
    name, phone,
    provider: provider || 'Auto-assigned',
    amount: (price || 0) + 100,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  db.bookings.push(booking);
  res.status(201).json({ success: true, booking });
});

app.patch('/api/bookings/:id', (req, res) => {
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });
  Object.assign(booking, req.body);
  res.json({ success: true, booking });
});

app.delete('/api/bookings/:id', (req, res) => {
  const i = db.bookings.findIndex(b => b.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Booking not found.' });
  db.bookings[i].status = 'Cancelled';
  res.json({ success: true });
});

// ─── SERVICES ROUTES ─────────────────────────────────────────────────────────

app.get('/api/services', (req, res) => {
  res.json(db.services);
});

app.patch('/api/services/:id', (req, res) => {
  const svc = db.services.find(s => s.id === req.params.id);
  if (!svc) return res.status(404).json({ error: 'Service not found.' });
  Object.assign(svc, req.body);
  res.json({ success: true, service: svc });
});

// ─── PROVIDERS ROUTES ────────────────────────────────────────────────────────

app.get('/api/providers', (req, res) => {
  res.json(db.providers);
});

app.get('/api/providers/pending', (req, res) => {
  res.json(db.pendingProviders);
});

app.patch('/api/providers/pending/:id', (req, res) => {
  const prov = db.pendingProviders.find(p => p.id === req.params.id);
  if (!prov) return res.status(404).json({ error: 'Provider not found.' });
  prov.status = req.body.status;
  res.json({ success: true, provider: prov });
});

// ─── ADMIN STATS ROUTE ───────────────────────────────────────────────────────

app.get('/api/admin/stats', (req, res) => {
  const totalRevenue = db.bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  res.json({
    totalBookings: db.bookings.length,
    registeredUsers: db.users.filter(u => u.role === 'user').length,
    activeProviders: db.providers.filter(p => p.status === 'Active').length,
    platformRevenue: totalRevenue,
    revenueByService: db.services.map(s => ({
      name: s.name,
      revenue: s.revenue,
      percent: Math.round((s.revenue / 27600) * 100),
    })),
  });
});

// ─── CATCH-ALL: serve index.html ─────────────────────────────────────────────

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── START ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  ✅ FixItNow server running`);
  console.log(`  🌐 http://localhost:${PORT}\n`);
  console.log(`  Demo logins:`);
  console.log(`    Customer : user@demo.com     / pass123`);
  console.log(`    Provider : provider@demo.com / pass123`);
  console.log(`    Admin    : admin@demo.com    / pass123\n`);
});
