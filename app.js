const express = require("express");

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
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
    directorId: dbObject.director_id,
    moviesName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
//get movie name API
app.get("/movies/", async (request, response) => {
  const getMoviesName = `
    select moviesName from movie;`;
  const movieArray = await db.all(getMoviesName);
  response.send(
    movieArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//create new movie in movie table

app.post("/movies/", (request, response) => {
  const movieDetail = request.body;
  const { movieId, directorId, moviesName, leadActor } = movieDetail;
  const addmovieArray = `
    insert into movie (movie_id, director_id, movie_name, lead_actor)
    values '${movieId}',
    '${directorId}',
    '${moviesName}',
    '${leadActor}'
    ;`;
  const dbResponse = db.run(addmovieArray);
  movieId = dbResponse.lastId;
  response.send({ movieId: movieId });
});
