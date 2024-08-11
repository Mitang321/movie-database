const apiKey = "2bfd72b";
let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

document.getElementById("searchButton").addEventListener("click", function () {
  const searchQuery = document.getElementById("searchInput").value;
  const genreFilter = document.getElementById("filterGenre").value;
  if (searchQuery) {
    fetch(`https://www.omdbapi.com/?s=${searchQuery}&apikey=${apiKey}`)
      .then((response) => response.json())
      .then((data) => {
        const filteredMovies = data.Search.filter((movie) =>
          genreFilter ? movie.Genre.includes(genreFilter) : true
        );
        displayMovies(filteredMovies);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }
});

function displayMovies(movies) {
  const movieList = document.getElementById("movieList");
  movieList.innerHTML = "";
  if (movies && movies.length > 0) {
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
      fetchMovieTrailer(data.Title);
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
  document.getElementById("ratingMovieId").value = movie.imdbID;
  openModal();
}

function fetchMovieTrailer(title) {
  const youtubeApiKey = "AIzaSyAwqUlLMgEWu32_APrNImWR1Px2Rais3XU";
  fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${title} trailer&type=video&key=${youtubeApiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      const videoId = data.items[0].id.videoId;
      document.getElementById(
        "movieTrailer"
      ).src = `https://www.youtube.com/embed/${videoId}`;
    })
    .catch((error) => console.error("Error fetching trailer:", error));
}

function openModal() {
  document.getElementById("movieModal").style.display = "block";
}

document.getElement;
