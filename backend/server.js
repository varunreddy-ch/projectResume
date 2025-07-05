
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Jimp = require('jimp');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize SQLite database
const db = new sqlite3.Database('resume_generator.db');

// Create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    firstName TEXT,
    lastName TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Resumes table
  db.run(`CREATE TABLE IF NOT EXISTS resumes (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    file_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Resume usage table
  db.run(`CREATE TABLE IF NOT EXISTS resume_usage (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    email TEXT,
    date TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Subscriptions table
  db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    email TEXT NOT NULL,
    subscribed BOOLEAN DEFAULT FALSE,
    subscription_tier TEXT,
    subscription_end DATETIME,
    stripe_customer_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to extract text from files
async function extractTextFromFile(filePath, mimetype) {
  try {
    if (mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (mimetype.includes('word') || mimetype.includes('document')) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (mimetype.includes('image')) {
      // For images, we'll just return a placeholder
      // In production, you'd use OCR like Tesseract.js
      return 'Image content detected - OCR functionality would be implemented here';
    }
    return '';
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return '';
  }
}

// Helper function to generate resume with AI (mock implementation)
function generateResumeWithAI(resumeText, jobDescription) {
  // This is a mock implementation
  // In production, you'd integrate with OpenAI, Claude, or another AI service
  
  const mockResume = {
    personalInfo: {
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      location: 'New York, NY'
    },
    summary: `Professional with experience tailored for: ${jobDescription.substring(0, 100)}...`,
    experience: [
      {
        title: 'Senior Developer',
        company: 'Tech Company',
        duration: '2020-2024',
        description: 'Led development projects with focus on technologies mentioned in job description.'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Computer Science',
        institution: 'University',
        year: '2020'
      }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL']
  };

  return mockResume;
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      // Create user
      db.run(
        'INSERT INTO users (id, email, password, firstName, lastName) VALUES (?, ?, ?, ?, ?)',
        [userId, email, hashedPassword, firstName, lastName],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Error creating user' });
          }

          // Create subscription record
          db.run(
            'INSERT INTO subscriptions (id, user_id, email) VALUES (?, ?, ?)',
            [uuidv4(), userId, email]
          );

          const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' });
          res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: userId, email, firstName, lastName }
          });
        }
      );
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      res.json({
        message: 'Login successful',
        token,
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName 
        }
      });
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, email, firstName, lastName FROM users WHERE id = ?', [req.user.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  });
});

// Resume routes
app.get('/api/resumes/usage', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const userEmail = req.user?.email || 'anonymous';
  const userId = req.user?.userId;

  // Check subscription status to determine limit
  const checkSubscription = () => {
    if (!userId) {
      // Anonymous user
      return { limit: 3, subscribed: false };
    }

    return new Promise((resolve) => {
      db.get('SELECT * FROM subscriptions WHERE user_id = ?', [userId], (err, subscription) => {
        if (err || !subscription) {
          resolve({ limit: 5, subscribed: false });
        } else {
          const limit = subscription.subscribed ? 50 : 5;
          resolve({ limit, subscribed: subscription.subscribed });
        }
      });
    });
  };

  checkSubscription().then(({ limit, subscribed }) => {
    db.get(
      'SELECT count FROM resume_usage WHERE (user_id = ? OR email = ?) AND date = ?',
      [userId, userEmail, today],
      (err, usage) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }

        const currentUsage = usage ? usage.count : 0;
        const canGenerate = currentUsage < limit;

        res.json({
          can_generate: canGenerate,
          current_usage: currentUsage,
          daily_limit: limit,
          remaining: Math.max(0, limit - currentUsage),
          subscribed
        });
      }
    );
  });
});

app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.userId;
    const resumeId = uuidv4();
    
    // Extract text from the uploaded file
    const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
    
    // Store resume in database
    db.run(
      'INSERT INTO resumes (id, user_id, title, content, file_path) VALUES (?, ?, ?, ?, ?)',
      [resumeId, userId, req.file.originalname, extractedText, req.file.path],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Error saving resume' });
        }

        res.json({
          message: 'Resume uploaded successfully',
          resumeId,
          filename: req.file.originalname
        });
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

app.post('/api/resumes/generate-with-job', authenticateToken, (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;
    const userId = req.user.userId;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({ message: 'Resume ID and job description are required' });
    }

    // Get the resume content
    db.get('SELECT * FROM resumes WHERE id = ? AND user_id = ?', [resumeId, userId], (err, resume) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }

      // Increment usage
      const today = new Date().toISOString().split('T')[0];
      db.run(
        'INSERT OR REPLACE INTO resume_usage (id, user_id, email, date, count) VALUES (?, ?, ?, ?, COALESCE((SELECT count FROM resume_usage WHERE user_id = ? AND date = ?), 0) + 1)',
        [uuidv4(), userId, req.user.email, today, userId, today]
      );

      // Generate resume with AI (mock implementation)
      const generatedResume = generateResumeWithAI(resume.content, jobDescription);

      res.json(generatedResume);
    });
  } catch (error) {
    console.error('Resume generation error:', error);
    res.status(500).json({ message: 'Server error during resume generation' });
  }
});

app.get('/api/resumes', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.all('SELECT id, title, created_at as createdAt FROM resumes WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, resumes) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.json(resumes || []);
  });
});

app.delete('/api/resumes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  db.run('DELETE FROM resumes WHERE id = ? AND user_id = ?', [id, userId], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ message: 'Resume deleted successfully' });
  });
});

// Profile routes
app.put('/api/profile', authenticateToken, (req, res) => {
  const { firstName, lastName } = req.body;
  const userId = req.user.userId;

  db.run(
    'UPDATE users SET firstName = ?, lastName = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [firstName, lastName, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({ message: 'Profile updated successfully' });
    }
  );
});

// Subscription routes
app.get('/api/subscription/status', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.get('SELECT * FROM subscriptions WHERE user_id = ?', [userId], (err, subscription) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!subscription) {
      return res.json({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null
      });
    }

    res.json({
      subscribed: subscription.subscribed,
      subscription_tier: subscription.subscription_tier,
      subscription_end: subscription.subscription_end
    });
  });
});

app.post('/api/subscription/checkout', authenticateToken, (req, res) => {
  // Mock Stripe checkout session
  res.json({
    checkout_url: 'https://checkout.stripe.com/mock-session'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ message: error.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Database initialized successfully');
});
