const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../../exception/InvariantError');
const NotFoundError = require('../../../exception/NotFoundError');
const { mapDBToModel } = require('../../../utils');

class AlbumService {
    constructor() {
        this._pool = new Pool();
    }

    async addAlbum({ name, year }) {
        let x = ("album-");
        const id = x + nanoid(16);
    
        const query = {
            text: 'INSERT INTO album VALUES($1, $2, $3) RETURNING id',
            values: [id, name, year],
        };
    
        const result = await this._pool.query(query);
    
        if (!result.rows[0].id) {
            throw new InvariantError('album gagal ditambahkan');
        }
    
        return result.rows[0].id;
    }

    async getAlbumById(id) {
        const query = {
            text: 'SELECT * FROM album WHERE id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);
    
        if (!result.rows.length) {
            throw new NotFoundError('album tidak ditemukan');
        }
    
        return result.rows.map(mapDBToModel)[0];
    }

    
    async editAlbumById(id, { name, year }) {
        const query = {
            text: 'UPDATE album SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id],
        };
      
        const result = await this._pool.query(query);
      
        if (!result.rowCount) {
            throw new NotFoundError(
              'Gagal memperbarui lagu. Id tidak ditemukan',
            );
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM album WHERE id = $1 RETURNING id',
            values: [id],
        };
     
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('album gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = AlbumService;