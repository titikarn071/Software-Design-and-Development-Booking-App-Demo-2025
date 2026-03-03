const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key';

app.use(cors());
app.use(express.json());

/* ======================
   MOCK USER
====================== */
const users = [
  {
    id: 1,
    username: "admin",
    password: bcrypt.hashSync("admin123", 8)
  }
];

/* ======================
   MEMORY DATABASE
====================== */
let bookings = [];
let bookingId = 1;

/* ======================
   AUTH MIDDLEWARE
====================== */
function verifyToken(req, res, next) {

  const bearerHeader = req.headers['authorization'];

  if (!bearerHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = bearerHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ message: "Invalid token" });

    req.user = decoded;
    next();
  });
}

/* ======================
   LOGIN
====================== */
app.post('/login', (req, res) => {

  const { username, password } = req.body;

  const user = users.find(u => u.username === username);

  if (!user)
    return res.status(401).json({ message: "User not found" });

  const validPassword = bcrypt.compareSync(password, user.password);

  if (!validPassword)
    return res.status(401).json({ message: "Invalid password" });

  const token = jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ message: "Login success", token });
});

/* ======================
   CREATE BOOKING
====================== */
app.post('/booking', (req, res) => {

  const booking = {
    id: bookingId++,
    ...req.body
  };

  bookings.push(booking);

  res.json({
    message: "Booking created ✅",
    booking
  });
});

/* ======================
   GET ALL BOOKINGS
====================== */
app.get('/booking', verifyToken, (req, res) => {
  res.json(bookings);
});

/* ======================
   DELETE BOOKING
====================== */
app.delete('/booking/:id', verifyToken, (req, res) => {

  const id = parseInt(req.params.id);

  const index = bookings.findIndex(b => b.id === id);

  if (index === -1)
    return res.status(404).json({ message: "Booking not found" });

  bookings.splice(index, 1);

  res.json({
    message: "Booking deleted ✅"
  });
});

/* ======================
   TEST
====================== */
app.get('/', (req, res) => {
  res.send("API Running ✅");
});

/* ======================
   START
====================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});