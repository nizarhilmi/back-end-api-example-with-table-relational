require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// album
const album = require('./api/album');
const AlbumService = require('./services/postgres/album/albumservice');
const AlbumValidator = require('./validator/album')

// song
const song = require('./api/song')
const SongService = require('./services/postgres/song/songservice');
const SongValidator = require('./validator/song');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/users/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentication');
const AuthenticationsService = require('./services/postgres/authentication/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentication');

// playlist
const playlist = require('./api/playlist');
const PlaylistService = require('./services/postgres/playlist/PlaylistsService');
const PlaylistValidator = require('./validator/playlist');

// collaborations
const collaboration = require('./api/collaboration');
const CollaborationService = require('./services/postgres/collaboration/CollaborationService');
const CollaborationValidator = require('./validator/collaboration');

// Exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');
 
const init = async () => {
  const albumService = new AlbumService();
  const songService = new SongService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationService = new CollaborationService();
  const playlistService = new PlaylistService(collaborationService);
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });
 
  await server.register([
    {
      plugin: album,
      options: {
        service: albumService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: song,
      options: {
        service: songService,
        validator: SongValidator,
      }
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      }
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlist,
      options: {
        service: playlistService,
        validator: PlaylistValidator,
      }
    },
    {
      plugin: collaboration,
      options: {
        collaborationService,
        playlistService,
        validator: CollaborationValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        playlistService,
        service: ProducerService,
        validator: ExportsValidator,
      },
    },
  ]);
 
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};
 
init();