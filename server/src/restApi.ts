import axios from 'axios';
import express from 'express'
import cors from 'cors';

const app = express()

app.use(cors({
    origin: '*'
}))

app.get('/markets', async (req, res) => {
  const response = await axios.get('https://whitebit.com/api/v4/public/markets')

  res.send(response.data)
})

app.listen(8002)

