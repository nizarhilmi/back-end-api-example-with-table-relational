const AlbumHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'OpenMusic v1',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const albumHandler = new AlbumHandler(service, validator);
    server.route(routes(albumHandler));
  },
};