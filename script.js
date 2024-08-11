const apiKey = "2bfd72b"; // Your OMDB API key
const youtubeApiKey = "AIzaSyAwqUlLMgEWu32_APrNImWR1Px2Rais3XU"; // Replace with your YouTube API key

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
        updateSearchHistory(searchQuery);
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
  document.getElementById("addToWatchlistButton").style.display =
    watchlist.some((item) => item.imdbID === movie.imdbID) ? "none" : "inline";
  document.getElementById("removeFromWatchlistButton").style.display =
    watchlist.some((item) => item.imdbID === movie.imdbID) ? "inline" : "none";
  openModal();
}

function fetchMovieTrailer(title) {
  fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${title} trailer&type=video&key=${youtubeApiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.items.length > 0) {
        const videoId = data.items[0].id.videoId;
        document.getElementById(
          "movieTrailer"
        ).src = `https://www.youtube.com/embed/${videoId}`;
        document.getElementById("trailerLink").style.display = "none"; // Hide link if trailer is available
      } else {
        document.getElementById(
          "trailerLink"
        ).href = `https://www.youtube.com/results?search_query=${title}+trailer`;
        document.getElementById("trailerLink").style.display = "block"; // Show link if no trailer is found
      }
    })
    .catch((error) => console.error("Error fetching trailer:", error));
}

function openModal() {
  document.getElementById("movieModal").style.display = "block";
}

document.getElementById("closeModal").addEventListener("click", function () {
  document.getElementById("movieModal").style.display = "none";
});

document
  .getElementById("ratingFormElement")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const rating = document.getElementById("rating").value;
    const movieId = document.getElementById("ratingMovieId").value;
    // Save rating to local storage or server here
    console.log(`Rated movie ${movieId} with rating ${rating}`);
  });

document
  .getElementById("addToWatchlistButton")
  .addEventListener("click", function () {
    const movieId = document.getElementById("ratingMovieId").value;
    fetch(`https://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}`)
      .then((response) => response.json())
      .then((movie) => {
        if (!watchlist.some((item) => item.imdbID === movie.imdbID)) {
          watchlist.push(movie);
          localStorage.setItem("watchlist", JSON.stringify(watchlist));
          updateWatchlist();
        }
      })
      .catch((error) => console.error("Error adding to watchlist:", error));
  });

document
  .getElementById("removeFromWatchlistButton")
  .addEventListener("click", function () {
    const movieId = document.getElementById("ratingMovieId").value;
    watchlist = watchlist.filter((movie) => movie.imdbID !== movieId);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    updateWatchlist();
    document.getElementById("addToWatchlistButton").style.display = "inline";
    document.getElementById("removeFromWatchlistButton").style.display = "none";
  });

document
  .getElementById("clearHistoryButton")
  .addEventListener("click", function () {
    document.getElementById("searchHistory").innerHTML = "";
  });

function updateSearchHistory(query) {
  const searchHistory = document.getElementById("searchHistory");
  const searchItem = document.createElement("li");
  searchItem.textContent = query;
  searchItem.addEventListener("click", () => {
    document.getElementById("searchInput").value = query;
    document.getElementById("searchButton").click();
  });
  searchHistory.insertBefore(searchItem, searchHistory.firstChild); // Add new search to the top
}

function updateWatchlist() {
  const watchlistElement = document.getElementById("watchlist");
  watchlistElement.innerHTML = "";
  if (watchlist.length > 0) {
    watchlist.forEach((movie) => {
      const watchlistItem = document.createElement("li");
      watchlistItem.textContent = movie.Title;
      watchlistElement.appendChild(watchlistItem);
    });
  } else {
    watchlistElement.innerHTML = "<p>No movies in watchlist.</p>";
  }
}

updateWatchlist();
