const postRoutes = require('./post')
const getRoutes = require('./get')

const initializeRoutes = app => {
  postRoutes(app);
  getRoutes(app);
};
module.exports = initializeRoutes;
