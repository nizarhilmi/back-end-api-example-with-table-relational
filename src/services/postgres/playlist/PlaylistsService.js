const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../../exception/NotFoundError');
const AuthorizationError = require('../../../exception/AuthorizationError');
const InvariantError = require('../../../exception/InvariantError');
const { mapDBToModel} = require('../../../utils');

class PlaylistService {
    constructor(collaborationService) {
        this._pool = new Pool();
        this._collaborationService = collaborationService;
    }

    
    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        const playlist = result.rows[0];
        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            try {
                await this._collaborationService.verifyCollaborator(playlistId, userId);
            } catch {
                throw error;
            }
        }
    }

    async addPlaylist(name, owner) {
        const id = `playlist-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
        throw new InvariantError('Playlist gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getPlaylist(owner) {
        const query = {
            text: 
                `SELECT playlists.id, playlists.name, users.username FROM playlists
                LEFT JOIN users ON playlists.owner = users.id
                LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
                WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
            values: [owner],
        };

        const result = await this._pool.query(query);
        return result.rows.map(mapDBToModel);
    }

    async getPlaylistById(id) {
        const query = {
            text: 
                `SELECT playlists.id, playlists.name, users.username FROM playlists 
                LEFT JOIN users ON playlists.owner = users.id
                LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
                WHERE playlists.id = $1`,
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }
        return result.rows.map(mapDBToModel)[0];
    }

    async deletePlaylistById(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
        }
    }

    async verifySong(songId) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [songId],
        };
    
        const result = await this._pool.query(query);
    
        if (!result.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }
    }

    async addSongtoPlaylist(playlistId, songId) {
        await this.verifySong(songId);
        const id = `playlist_songs-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan ke playlist');
        }
    }

    async getSongfromPlaylist(playlistId) {

        const query = {
            text: 
                `SELECT songs.id, songs.title, songs.performer FROM songs
                JOIN playlist_songs ON songs.id = playlist_songs.song_id 
                WHERE playlist_songs.playlist_id = $1`,
            values: [playlistId],
        };

        const result = await this._pool.query(query);
        return result.rows.map(mapDBToModel);
    }

    async deleteSongfromPlaylist(playlistId, songId) {
        const query = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Lagu gagal dihapus. Id lagu tidak ditemukan');
        }
    }
}

module.exports = PlaylistService;