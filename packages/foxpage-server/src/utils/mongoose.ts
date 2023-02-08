'use strict';

import mongoose from 'mongoose';

import { config } from '../../app.config';

const dbConnect = () => {
  console.time('mongoose');
  mongoose.connect(config.mongodb, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    replicaSet: 'foxpageRs',
  });

  const db = mongoose.connection;
  db.on('error', (err: Error) => {
    console.log('Connection MongoDB database error:' + err.message);
  });
  db.once('open', () => {
    console.timeEnd('mongoose');
    console.log('Connected to MongoDB database!');
  });
};

export default dbConnect;
