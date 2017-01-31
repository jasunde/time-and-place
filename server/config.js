module.exports = {
  regionMap: [
    'district',
    'beat',
    'block'
  ],
  mongoDb: process.env.MONGODB_URI || 'mongodb://localhost:27017/timeAndPlace'
};
