const apiKey = "2bfd72b";

document.getElementById("searchButton").addEventListener("click", function () {
  const searchQuery = document.getElementById("searchInput").value;
  if (searchQuery) {
    fetch(`https://www.omdbapi.com/?s=${searchQuery}&apikey=${apiKey}`)
      .then((response) => response.json())
      .then((data) => {
        displayMovies(data.Search);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }
});

function displayMovies(movies) {
  const movieList = document.getElementById("movieList");
  movieList.innerHTML = "";
  if (movies) {
    movies.forEach((movie) => {
      const movieElement = document.createElement("div");
      movieElement.className = "movie";
      movieElement.innerHTML = `
                <img src="${movie.Poster}" alt="${movie.Title}">
                <div>
                    <h2>${movie.Title}</h2>
                    <p>${movie.Year}</p>
                </div>
            `;
      movieElement.addEventListener("click", () => {
        fetchMovieDetails(movie.imdbID);
      });
      movieList.appendChild(movieElement);
    });
  } else {
    movieList.innerHTML = "<p>No movies found.</p>";
  }
}

function fetchMovieDetails(id) {
  fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`)
    .then((response) => response.json())
    .then((data) => {
      displayMovieDetails(data);
    })
    .catch((error) => console.error("Error fetching details:", error));
}

function displayMovieDetails(movie) {
  const movieDetails = document.getElementById("movieDetails");
  movieDetails.innerHTML = `
        <h2>${movie.Title}</h2>
        <p><strong>Year:</strong> ${movie.Year}</p>
        <p><strong>Genre:</strong> ${movie.Genre}</p>
        <p><strong>Director:</strong> ${movie.Director}</p>
        <p><strong>Actors:</strong> ${movie.Actors}</p>
        <p><strong>Plot:</strong> ${movie.Plot}</p>
        <img src="${movie.Poster}" alt="${movie.Title}">
    `;
  movieDetails.style.display = "block";
}
