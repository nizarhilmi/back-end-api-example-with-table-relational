const mapDBToModel = ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    name,
    albumId,
    songId,
  }) => ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    name,
    albumId,
    songId,
  });
  
module.exports = { mapDBToModel };