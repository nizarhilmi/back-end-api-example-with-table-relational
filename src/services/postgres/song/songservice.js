const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../../exception/InvariantError');
const NotFoundError = require('../../../exception/NotFoundError');
const { mapDBToModel } = require('../../../utils');

class SongService {
    constructor() {
      this._pool = new Pool();
    }
  
    async addSong({title, year, performer, genre, duration, albumId}) {
        let x = ("song-");
        const id = x + nanoid(16);
    
        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [
            id,
            title,
            year,
            performer,
            genre,
            duration,
            albumId,
            ],
        };
    
        const result = await this._pool.query(query);
    
        if (!result.rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan');
        }
    
        return result.rows[0].id;
    }
  
    async getSong(title, performer) {
        let query;

        if (title && performer) {
          query = {
            text: 'SELECT id, title, performer FROM songs WHERE LOWER (title) LIKE $1 AND LOWER (performer) LIKE $2',
            values: [`%${title}%`, `%${performer}%`],
          };
        } else if (title) {
          query = {
            text: 'SELECT id, title, performer FROM songs WHERE LOWER (title) LIKE $1',
            values: [`%${title}%`],
          };
        } else if (performer) {
          query = {
            text: 'SELECT id, title, performer FROM songs WHERE LOWER (performer) LIKE $1',
            values: [`%${performer}%`],
          };
        } else {
          query = {
            text: 'SELECT id, title, performer FROM songs',
          };
        }
    
        const result = await this._pool.query(query);
    
        if (!result.rowCount) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }
        return result.rows.map(mapDBToModel);
    }
  
    async getSongById(id) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id],
        };
        const song = await this._pool.query(query);
    
        if (!song.rowCount) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }
    
        return song.rows.map(mapDBToModel)[0];
    }
  
    async editSongById(id, {title, year, performer, genre, duration,}) {
        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5 WHERE id = $6 RETURNING id',
            values: [title, year, performer, genre, duration, id],
        };
    
        const result = await this._pool.query(query);
    
        if (!result.rowCount) {
            throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
        }
    }
  
    async deleteSongById(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id],
        };
    
        const result = await this._pool.query(query);
    
        if (!result.rowCount) {
            throw new NotFoundError('Gagal menghapus lagu. Id tidak ditemukan');
        }
    }
}
  
module.exports = SongService;
  