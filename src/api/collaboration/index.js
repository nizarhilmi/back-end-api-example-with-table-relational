const CollaborationHandler = require('./handler');
const routes = require('./routes');
 
module.exports = {
  name: 'collaborations',
  version: '2.0.0',
  register: async (server, { collaborationService, playlistService, validator }) => {
    const collaborationsHandler = new CollaborationHandler(
      collaborationService, playlistService, validator,
    );
    server.route(routes(collaborationsHandler));
  },
};