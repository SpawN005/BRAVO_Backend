const postRoutes = require('./post')
const getRoutes = require('./get')
const deleteRoutes = require('./delete')
const patchRoutes = require('./patch')


const initializeRoutes = app => {
  postRoutes(app);
  getRoutes(app);
  deleteRoutes(app);
  patchRoutes(app);
};
module.exports = initializeRoutes;
