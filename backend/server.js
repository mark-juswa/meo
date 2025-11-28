import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { EventEmitter } from 'events';
import { fileURLToPath } from 'url';

// ROUTES
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import documentRoutes from './routes/documents.js';
import applicationRoutes from './routes/applications.js';
import eventRoutes from './routes/events.js';

EventEmitter.defaultMaxListeners = 20;

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://meo-online-services.onrender.com"
    ],
    credentials: true,
  })
);


app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' data: https://fonts.gstatic.com;
    img-src 'self' data: blob: https:;
    connect-src 
        'self'
        https://meo-online-services.onrender.com
        https://www.google-analytics.com;
    frame-src 'self';
    `
      .replace(/\s{2,}/g, " ")
      .trim()
  );
  next();
});



// STATIC UPLOAD FOLDER
app.use(
    '/uploads',
    express.static(path.join(process.cwd(), 'uploads'))
);

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/events', eventRoutes);



if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}



// CONNECT DB
connectDB();

// START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
