69// server.js

const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Ensure data directories and JSON files exist
const dataDir = path.join(__dirname, 'data');
const lostPetsFile = path.join(dataDir, 'lostPets.json');
const foundPetsFile = path.join(dataDir, 'foundPets.json');
const adoptablePetsFile = path.join(dataDir, 'adoptablePets.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(lostPetsFile)) fs.writeFileSync(lostPetsFile, JSON.stringify([]));
if (!fs.existsSync(foundPetsFile)) fs.writeFileSync(foundPetsFile, JSON.stringify([]));
if (!fs.existsSync(adoptablePetsFile)) fs.writeFileSync(adoptablePetsFile, JSON.stringify([]));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Routes

// Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// About Us Page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// Contact Us Page
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Food Tips Page
app.get('/food-tips', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'food-tips.html'));
});

// Training Tips Page
app.get('/training-tips', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'training-tips.html'));
});

// Lost Pet Form
app.get('/form/lost', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'lost-form.html'));
});

// Found Pet Form
app.get('/form/found', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'found-form.html'));
});

// Adopt Pet Form
app.get('/form/adopt', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'adopt-form.html'));
});

// Submit Lost Pet
app.post('/submit/lost', upload.single('photo'), (req, res) => {
    const { name, description, email, petid,contact,reward, lastSeen} = req.body;
    const photoPath = req.file ? req.file.path : '';

    const lostPet = {
        id: Date.now(),
        name,
        description,
        email,
        lastSeen,
        petid,
        reward,
        contact,
        photo: photoPath
    };

    const lostPets = JSON.parse(fs.readFileSync(lostPetsFile));
    lostPets.push(lostPet);
    fs.writeFileSync(lostPetsFile, JSON.stringify(lostPets, null, 6));

    res.send(`
        <h1>Lost Pet Report Submitted Successfully!</h1>
        <p>Thank you, ${name}. We will assist you in finding your pet.</p>
        <a href="/">Return to Home</a>
    `);
});

// Submit Found Pet
app.post('/submit/found', upload.single('photo'), (req, res) => {
    const { name, description, email, location,contact } = req.body;
    const photoPath = req.file ? req.file.path : '';

    const foundPet = {
        id: Date.now(),
        name,
        description,
        email,
        contact,
        location,
        photo: photoPath
    };

    const foundPets = JSON.parse(fs.readFileSync(foundPetsFile));
    foundPets.push(foundPet);
    fs.writeFileSync(foundPetsFile, JSON.stringify(foundPets, null, 3));

    res.send(`
        <h1>Found Pet Report Submitted Successfully!</h1>
        <p>Thank you, ${name}. We will help you find the pet's owner.</p>
        <a href="/">Return to Home</a>
    `);
});

// Submit Adopt Pet Request
app.post('/submit/adopt', (req, res) => {
    const { name, description, email,contact } = req.body;

    const adoptRequest = {
        id: Date.now(),
        name,
        description,
        contact,
        email
    };

    const adoptablePets = JSON.parse(fs.readFileSync(adoptablePetsFile));
    adoptablePets.push(adoptRequest);
    fs.writeFileSync(adoptablePetsFile, JSON.stringify(adoptablePets, null, 3));

    res.send(`
        <h1>Adoption Request Submitted Successfully!</h1>
        <p>Thank you, ${name}. We will get back to you with available pets.</p>
        <a href="/">Return to Home</a>
    `);
});

// Display Lost Pets
app.get('/lost-pets', (req, res) => {
    const lostPets = JSON.parse(fs.readFileSync(lostPetsFile));
    let html = `
        <h1>Lost Pets</h1>
        <div class="pets-container">
    `;
    lostPets.forEach(pet => {
        html += `
            <div class="pet-card">
                ${pet.photo ? `<img src="/${pet.photo}" alt="${pet.name}" />` : ''}
                <h3>${pet.name}</h3>
                <p>${pet.description}</p>
                <p><strong>Last Seen:</strong> ${pet.lastSeen}</p>
                <p><strong>email:</strong> ${pet.email}</p>
                <p><strong>contact no:</strong> ${pet.contact || "N?A"}</p>
                <p><strong>Pet id:</strong> ${pet.petid || "N?A"}</p>
                 <p><strong>Reward Amount</strong> ${pet.reward}</p>

            </div>
        `;
    });
    html += `
        </div>
        <a href="/">Return to Home</a>
    `;
    res.send(html);
});

// Display Found Pets
app.get('/found-pets', (req, res) => {
    const foundPets = JSON.parse(fs.readFileSync(foundPetsFile));
    let html = `
        <h1>Found Pets</h1>
        <div class="pets-container">
    `;
    foundPets.forEach(pet => {
        html += `
            <div class="pet-card">
                ${pet.photo ? `<img src="/${pet.photo}" alt="${pet.name}" />` : ''}
                <h3>${pet.name}</h3>
                <p>${pet.description}</p>
                <p><strong>Location Found:</strong> ${pet.location}</p>
                <p><strong>email:</strong> ${pet.email}</p>
                <p><strong>contact no:</strong> ${pet.contact || "N?A"}</p>
            </div>
        `;
    });
    html += `
        </div>
        <a href="/">Return to Home</a>
    `;
    res.send(html);
});

// Display Adoptable Pets
app.get('/adoptable-pets', (req, res) => {
    const adoptablePets = JSON.parse(fs.readFileSync(adoptablePetsFile));
    let html = `
        <h1>Adopters</h1>
        <div class="pets-container">
    `;
    adoptablePets.forEach(pet => {
        html += `
            <div class="pet-card">
                <h3>${pet.name}</h3>
                <p>${pet.description}</p>
                <p><strong>Contact:</strong> ${pet.email}</p>
                <p><strong>contact no:</strong> ${pet.contact || "N?A"}</p>
            </div>
        `;
    });
    html += `
        </div>
        <a href="/">Return to Home</a>
    `;
    res.send(html);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
