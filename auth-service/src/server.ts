import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import scopesRoutes from './routes/scopes';
import mfeConfigRoutes from './routes/mfe-config'; // Add this

const app = express();

app.use(cors({ origin: ['http://localhost:4200', 'http://localhost:4201', 'http://localhost:3002'] }));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/scopes', scopesRoutes);
app.use('/mfe-config', mfeConfigRoutes); // Add this

app.listen(3000, () => console.log('Server running on port 3000'));