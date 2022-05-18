const ClientError = require('../../exception/ClientError');

class PlaylistHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;
    
        this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
        this.getPlaylistHandler = this.getPlaylistHandler.bind(this);
        this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
        this.postSongtoPlaylistHandler = this.postSongtoPlaylistHandler.bind(this);
        this.getSongfromPlaylistHandler = this.getSongfromPlaylistHandler.bind(this);
        this.deleteSongfromPlaylistHandler = this.deleteSongfromPlaylistHandler.bind(this);
  
    }
  
    async postPlaylistHandler(request, h) {
        try {
            this._validator.validatePlaylistPayload(request.payload);
            const { name } = request.payload;
            const { id: credentialId } = request.auth.credentials;
        
            const playlistId = await this._service.addPlaylist(name, credentialId);
        
            const response = h.response({
                status: 'success',
                message: 'Playlist berhasil ditambahkan',
                data: {
                    playlistId,
                },
            });
            response.code(201);
            return response;

        } catch (error){
            if (error instanceof ClientError) {
                const response = h.response({
                status: 'fail',
                message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
        
            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
  
    async getPlaylistHandler(request) {
        const { id: credentialId } = request.auth.credentials;
    
        const Playlists = await this._service.getPlaylist(credentialId);
        return {
            status: 'success',
            data: {
                playlists: Playlists.map((playlists) => ({
                    id: playlists.id,
                    name: playlists.name,
                    username: playlists.username,
                })),
            },
        };
    }
  
    async deletePlaylistByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const { id: credentialId } = request.auth.credentials;
        
            await this._service.verifyPlaylistOwner(id, credentialId);
            await this._service.deletePlaylistById(id);
        
            return {
                status: 'success',
                message: 'Playlist berhasil dihapus',
            };
        } catch (error){
            if (error instanceof ClientError) {
                const response = h.response({
                status: 'fail',
                message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
        
            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
  
    async postSongtoPlaylistHandler(request, h) {
        try {
            this._validator.validatePlaylistSongPayload(request.payload);
  
            const { id: playlistId } = request.params;
            const { songId } = request.payload;
            const { id: credentialId } = request.auth.credentials;
        
            await this._service.verifyPlaylistAccess(playlistId, credentialId);
            await this._service.addSongtoPlaylist(playlistId, songId);
        
            const response = h.response({
                status: 'success',
                message: 'Lagu berhasil ditambahkan ke playlist',
            });
            response.code(201);
            return response;

        } catch (error){
            if (error instanceof ClientError) {
                const response = h.response({
                status: 'fail',
                message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
        
            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
  
    async getSongfromPlaylistHandler(request, h) {
        try {
            const { id: playlistId } = request.params;
            const { id: credentialId } = request.auth.credentials;
        
            await this._service.verifyPlaylistAccess(playlistId, credentialId);
            const playlist = await this._service.getPlaylistById(playlistId);
            const songs = await this._service.getSongfromPlaylist(playlistId);
        
            const playlistSong = { ...playlist, songs };
        
            return {
                status: 'success',
                data: {
                    playlist: playlistSong,
                },
            };

        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                status: 'fail',
                message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
        
            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
  
    async deleteSongfromPlaylistHandler(request, h) {
        try {
            const { id: playlistId } = request.params;
            const { songId } = request.payload;
            const { id: credentialId } = request.auth.credentials;
        
            await this._service.verifyPlaylistAccess(playlistId, credentialId);
            await this._service.deleteSongfromPlaylist(playlistId, songId);
        
            return {
                status: 'success',
                message: 'Lagu berhasil dihapus dari playlist',
            };
        } catch (error){
            if (error instanceof ClientError) {
                const response = h.response({
                status: 'fail',
                message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
        
            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
}
  
module.exports = PlaylistHandler;