const express = require("express");

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
module.exports = app;
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;
const initializerDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializerDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    movieId: dbObject.id,
    directorId: dbObject.director_id,
    moviesName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};
//get movie name API
app.get("/movies/", async (request, response) => {
  const getMoviesName = `
    select * from movie;`;
  const movieArray = await db.all(getMoviesName);
  response.send(
    movieArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//create new movie in movie table

app.post("/movies/", async (request, response) => {
  const movieDetail = request.body;
  const { directorId, moviesName, leadActor } = movieDetail;
  const addmovieArray = `
    insert into movie (director_id, movie_name, lead_actor)
    values
    (${directorId},
    '${moviesName}',
    '${leadActor}')
    ;`;
  const dbResponse = await db.run(addmovieArray);
  movieId = dbResponse.lastId;
  response.send("Movie Successfully Added");
});

//Returns a movie based on the movie ID

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetailQuery = `select * from movie where 
   movie_id = ${movieId};`;
  const movieParticularDetail = await db.get(movieDetailQuery);
  response.send(convertDbObjectToResponseObject(movieParticularDetail));
});

//Updates the details of a movie in the movie table based on the movie ID

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetail = request.body;
  const { directorId, moviesName, leadActor } = movieDetail;
  const updateMovieQuery = `update movie set 
    director_id = ${directorId}, movie_name = '${moviesName}', 
    lead_actor = '${leadActor}' where movie_id = ${movieId};
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
//Deletes a movie from the movie table based on the movie ID
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `delete from movie
    where movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Returns a list of all directors in the director table

app.get("/directors/", async (request, response) => {
  directorDetailQuery = `select * from director;`;
  const directorArray = await db.all(directorDetailQuery);
  response.send(
    directorArray.map((eachArray) => convertDbObjectToResponseObject(eachArray))
  );
});

//Returns a list of all movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getSpecificDirecor = `select movie_name from movie
    where director_id = ${directorId};`;
  const directorName = await db.get(getSpecificDirecor);
  response.send(convertDbObjectToResponseObject(directorName));
});
