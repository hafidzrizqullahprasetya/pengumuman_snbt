const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (path.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (path.endsWith('.ico')) {
            res.setHeader('Content-Type', 'image/x-icon');
        }
    }
}));

// Specific routes for critical assets
app.get('/style.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/bootstrap.min.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(path.join(__dirname, 'bootstrap.min.css'));
});

app.get('/snbt-1.0.min.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(path.join(__dirname, 'snbt-1.0.min.js'));
});

app.get('/deadline.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(path.join(__dirname, 'deadline.js'));
});

// Serve images with proper headers
app.use('/images', express.static(path.join(__dirname, 'images'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        }
        res.setHeader('Cache-Control', 'public, max-age=86400');
    }
}));

// Universities data
const universities = [
    { kode: "001", nama: "Universitas Indonesia", url: "https://www.ui.ac.id/daftar-ulang" },
    { kode: "002", nama: "Institut Teknologi Bandung", url: "https://www.itb.ac.id/daftar-ulang" },
    { kode: "003", nama: "Universitas Gadjah Mada", url: "https://www.ugm.ac.id/daftar-ulang" },
    { kode: "004", nama: "Institut Teknologi Sepuluh Nopember", url: "https://www.its.ac.id/daftar-ulang" },
    { kode: "005", nama: "Universitas Airlangga", url: "https://www.unair.ac.id/daftar-ulang" },
    { kode: "006", nama: "Universitas Brawijaya", url: "https://www.ub.ac.id/daftar-ulang" },
    { kode: "007", nama: "Universitas Diponegoro", url: "https://www.undip.ac.id/daftar-ulang" },
    { kode: "008", nama: "Universitas Hasanuddin", url: "https://www.unhas.ac.id/daftar-ulang" },
    { kode: "009", nama: "Universitas Padjadjaran", url: "https://www.unpad.ac.id/daftar-ulang" },
    { kode: "010", nama: "Universitas Sebelas Maret", url: "https://www.uns.ac.id/daftar-ulang" }
];

const programs = [
    { kode: "55201", nama: "Kedokteran" },
    { kode: "54201", nama: "Teknik Informatika" },
    { kode: "55301", nama: "Kedokteran Gigi" },
    { kode: "54301", nama: "Teknik Elektro" },
    { kode: "57201", nama: "Farmasi" },
    { kode: "54401", nama: "Teknik Sipil" },
    { kode: "61201", nama: "Manajemen" },
    { kode: "61301", nama: "Akuntansi" },
    { kode: "62101", nama: "Hukum" },
    { kode: "54501", nama: "Arsitektur" },
    { kode: "48201", nama: "Matematika" },
    { kode: "45201", nama: "Fisika" },
    { kode: "46201", nama: "Kimia" },
    { kode: "48301", nama: "Statistika" },
    { kode: "44201", nama: "Biologi" },
    { kode: "63101", nama: "Psikologi" },
    { kode: "88201", nama: "Sastra Indonesia" },
    { kode: "88301", nama: "Sastra Inggris" },
    { kode: "14201", nama: "Pendidikan Dokter" },
    { kode: "86201", nama: "Ilmu Komunikasi" }
];

// Generate QR code URL (using local image)
function generateQRCode(nopes) {
    return '/images/qr.png';
}

// Generate random selection for auto-pass
function getRandomSelection() {
    const universityIndex = Math.floor(Math.random() * universities.length);
    const programIndex = Math.floor(Math.random() * programs.length);
    
    return {
        university: universities[universityIndex],
        program: programs[programIndex],
        bidikMisi: false // Always false - no KIP Kuliah
    };
}

// Validate date format
function validateDate(day, month, year) {
    const date = new Date(year, month - 1, day);
    return date.getFullYear() == year && 
           date.getMonth() == month - 1 && 
           date.getDate() == day;
}

// Main route
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for checking results
app.post('/api/check-result', (req, res) => {
    const { nopes, day, month, year, nama, ptn, prodi, statement } = req.body;
    
    // Validation
    if (!nopes || !day || !month || !year || !nama || !ptn || !prodi || !statement) {
        return res.status(400).json({
            success: false,
            message: 'Semua field harus diisi dan pernyataan harus disetujui.'
        });
    }
    
    // Validate nopes (12 digits)
    if (!/^\d{12}$/.test(nopes)) {
        return res.status(400).json({
            success: false,
            message: 'Nomor peserta harus 12 digit angka.'
        });
    }
    
    // Validate date
    if (!validateDate(parseInt(day), parseInt(month), parseInt(year))) {
        return res.status(400).json({
            success: false,
            message: 'Tanggal lahir tidak valid.'
        });
    }
    
    // Format birth date
    const birthDate = `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    
    // Auto-pass logic - everyone passes with user input or random selection
    const selection = getRandomSelection();
    
    // Find the selected university and program from input or use random
    let selectedUniversity = universities.find(u => 
        u.nama.toLowerCase().includes(ptn.toLowerCase()) || 
        ptn.toLowerCase().includes(u.nama.toLowerCase())
    );
    
    let selectedProgram = programs.find(p => 
        p.nama.toLowerCase().includes(prodi.toLowerCase()) || 
        prodi.toLowerCase().includes(p.nama.toLowerCase())
    );
    
    // If no match found, create custom entry based on user input
    if (!selectedUniversity) {
        selectedUniversity = {
            kode: String(Math.floor(Math.random() * 999) + 1).padStart(3, '0'),
            nama: ptn,
            url: "https://www.example.edu/daftar-ulang"
        };
    }
    
    if (!selectedProgram) {
        selectedProgram = {
            kode: String(Math.floor(Math.random() * 89999) + 10000),
            nama: prodi
        };
    }
    
    const result = {
        success: true,
        accepted: true,
        data: {
            nopes: nopes,
            nama: nama,
            tanggalLahir: birthDate,
            ptn: {
                kode: selectedUniversity.kode,
                nama: selectedUniversity.nama,
                urlDaftar: selectedUniversity.url
            },
            prodi: {
                kode: selectedProgram.kode,
                nama: selectedProgram.nama
            },
            qrCode: generateQRCode(nopes),
            bidikMisi: selection.bidikMisi
        }
    };
    
    res.json(result);
});

// API endpoint to get universities list
app.get('/api/universities', (req, res) => {
    res.json(universities);
});

// API endpoint to get programs list
app.get('/api/programs', (req, res) => {
    res.json(programs);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'SNBT System is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server.'
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint tidak ditemukan.'
    });
});

// 404 handler for other routes - redirect to main page
app.use((req, res) => {
    res.redirect('/');
});

// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📚 SNBT Announcement System 2025 - Auto Pass Mode`);
        console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

module.exports = app;