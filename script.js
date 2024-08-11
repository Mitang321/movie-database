const apiKey = "2bfd72b"; // Your API key

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

function openModal() {
  document.getElementById("movieModal").style.display = "block";
}

document.getElementById("closeModal").addEventListener("click", closeModal);

function closeModal() {
  document.getElementById("movieModal").style.display = "none";
}

document.getElementById("ratingFormElement").onsubmit = function (event) {
  event.preventDefault();
  const movieId = document.getElementById("ratingMovieId").value;
  const rating = document.getElementById("rating").value;
  fetch(`https://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}`)
    .then((response) => response.json())
    .then((movie) => {
      addToWatchlist(movie, rating);
      closeModal();
    })
    .catch((error) => console.error("Error fetching details:", error));
};

function addToWatchlist(movie, rating) {
  const watchlistItem = {
    id: movie.imdbID,
    title: movie.Title,
    poster: movie.Poster,
    rating: rating,
  };

  watchlist = watchlist.filter((item) => item.id !== watchlistItem.id);
  watchlist.push(watchlistItem);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  displayWatchlist();
}

function displayWatchlist() {
  const watchlistItems = document.getElementById("watchlistItems");
  watchlistItems.innerHTML = "";
  watchlist.forEach((item) => {
    const watchlistElement = document.createElement("div");
    watchlistElement.className = "watchlist-item";
    watchlistElement.innerHTML = `
            <img src="${item.poster}" alt="${item.title}">
            <div>
                <h2>${item.title}</h2>
                <p>Rating: ${item.rating}</p>
                <button onclick="removeFromWatchlist('${item.id}')">Remove</button>
            </div>
        `;
    watchlistItems.appendChild(watchlistElement);
  });
}

function removeFromWatchlist(id) {
  watchlist = watchlist.filter((item) => item.id !== id);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  displayWatchlist();
}

// Initial call to display watchlist
displayWatchlist();
