const apiKey = "2bfd72b";
const youtubeApiKey = "AIzaSyAwqUlLMgEWu32_APrNImWR1Px2Rais3XU";

let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
let userRatings = JSON.parse(localStorage.getItem("userRatings")) || {};

document.getElementById("searchButton").addEventListener("click", function () {
  const searchQuery = document.getElementById("searchInput").value;
  const genreFilter = document.getElementById("filterGenre").value;
  const yearFilter = document.getElementById("filterYear").value;
  const ratingFilter = document.getElementById("filterRating").value;
  if (searchQuery) {
    fetch(`https://www.omdbapi.com/?s=${searchQuery}&apikey=${apiKey}`)
      .then((response) => response.json())
      .then((data) => {
        let filteredMovies = data.Search || [];
        filteredMovies = filteredMovies.filter(
          (movie) =>
            (genreFilter ? movie.Genre.includes(genreFilter) : true) &&
            (yearFilter ? movie.Year.includes(yearFilter) : true) &&
            (ratingFilter ? parseFloat(movie.imdbRating) >= ratingFilter : true)
        );
        displayMovies(filteredMovies);
        updateSearchHistory(searchQuery);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }
});

document
  .getElementById("toggleDarkMode")
  .addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
  });

document
  .getElementById("searchWatchlist")
  .addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const filteredWatchlist = watchlist.filter((movie) =>
      movie.Title.toLowerCase().includes(query)
    );
    displayWatchlist(filteredWatchlist);
  });

document.getElementById("sortWatchlist").addEventListener("click", function () {
  watchlist.sort((a, b) => a.Title.localeCompare(b.Title));
  displayWatchlist(watchlist);
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
        <p><strong>Box Office:</strong> ${movie.BoxOffice}</p>
        <p><strong>Runtime:</strong> ${movie.Runtime}</p>
        <img src="${movie.Poster}" alt="${movie.Title}">
    `;
  document.getElementById("ratingMovieId").value = movie.imdbID;
  document.getElementById("userRating").value = userRatings[movie.imdbID] || "";
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
        document.getElementById("trailerLink").style.display = "none";
      } else {
        document.getElementById(
          "trailerLink"
        ).href = `https://www.youtube.com/results?search_query=${title}+trailer`;
        document.getElementById("trailerLink").style.display = "block";
      }
    })
    .catch((error) => console.error("Error fetching trailer:", error));
}

function openModal() {
  const modal = document.getElementById("movieModal");
  modal.style.display = "block";
  modal.querySelector(".modal-content").classList.add("fade-in");
}

document.getElementById("closeModal").addEventListener("click", function () {
  const modal = document.getElementById("movieModal");
  modal.querySelector(".modal-content").classList.remove("fade-in");
  modal.querySelector(".modal-content").classList.add("fade-out");
  setTimeout(() => {
    modal.style.display = "none";
    modal.querySelector(".modal-content").classList.remove("fade-out");
  }, 300);
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
          document.getElementById("addToWatchlistButton").style.display =
            "none";
          document.getElementById("removeFromWatchlistButton").style.display =
            "inline";
          displayWatchlist(watchlist);
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
    document.getElementById("removeFromWatchlistButton").style.display = "none";
    document.getElementById("addToWatchlistButton").style.display = "inline";
    displayWatchlist(watchlist);
  });

document.getElementById("submitRating").addEventListener("click", function () {
  const movieId = document.getElementById("ratingMovieId").value;
  const rating = document.getElementById("userRating").value;
  if (rating >= 1 && rating <= 10) {
    userRatings[movieId] = rating;
    localStorage.setItem("userRatings", JSON.stringify(userRatings));
    alert("Rating submitted!");
  } else {
    alert("Please enter a rating between 1 and 10.");
  }
});

function displayWatchlist(movies) {
  const watchlistElement = document.getElementById("watchlist");
  watchlistElement.innerHTML = "";
  if (movies && movies.length > 0) {
    movies.forEach((movie) => {
      const movieItem = document.createElement("li");
      movieItem.innerHTML = `
                <img src="${movie.Poster}" alt="${movie.Title}">
                <div>
                    <p>${movie.Title} (${movie.Year})</p>
                    <p>Your Rating: ${
                      userRatings[movie.imdbID] || "Not Rated"
                    }</p>
                </div>
            `;
      movieItem.addEventListener("click", () => {
        fetchMovieDetails(movie.imdbID);
      });
      watchlistElement.appendChild(movieItem);
    });
  } else {
    watchlistElement.innerHTML = "<p>Your watchlist is empty.</p>";
  }
}

function updateSearchHistory(query) {
  const searchHistory = document.getElementById("searchHistory");
  const historyItem = document.createElement("li");
  historyItem.textContent = query;
  historyItem.addEventListener("click", function () {
    document.getElementById("searchInput").value = query;
    document.getElementById("searchButton").click();
  });
  searchHistory.appendChild(historyItem);
}
