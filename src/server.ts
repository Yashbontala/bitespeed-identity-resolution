import express from 'express';
import identifyRouter from './routes/identify';

const app = express();
app.use(express.json());

app.use('/identify', identifyRouter);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
