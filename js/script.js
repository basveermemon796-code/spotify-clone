console.log("lets go javascript");
let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(sec) {
  if (isNaN(sec) || sec < 0) return "00:00"; // fallback
  sec = Math.floor(sec);
  let minutes = Math.floor(sec / 60);
  let seconds = sec % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

async function getSongs(folder) {
  currFolder = folder; // Store the current folder globally
  // Changed function name from main to getSongs
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    } // Added missing closing brace for if statement
  }

  // show all the songs in the playlist
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
                <img  src="/Images/music.svg" alt="">
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div></div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img src="/Images/play.svg" alt="">
                </div>
                </li>`;
  }
  // Attach an event listeners to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });
  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "/Images/pause.svg";
  }

  document.querySelector(".songinfo > span").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];

      // Get the metadata of the folder
      let a = await fetch(
        `/songs/${folder}/info.json`
      );
      let response = await a.json();
      console.log(response);
      cardcontainer.innerHTML =
        cardcontainer.innerHTML +
        `<div data-folder="${folder}" class="card">
              <div class="play">
                <svg
                  width="45"
                  height="45"
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="50" cy="50" r="48" fill="#1ED760" />
                  <polygon points="40,30 70,50 40,70" fill="black" />
                </svg>
              </div>
              <img
                src="/songs/${folder}/cover.jpg"
                alt=""
              />
              <h3>${response.Title}</h3>
              <p>${response.Description}</p>
            </div>`;
    }
  }
  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      song = await getSongs(`songs/${item.currentTarget.dataset.folder}`); 
      playMusic(song[0] );
    });
  });
}

async function main() {
  // Get the list of all the songs
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  // Display all the albums on the page
  displayAlbums();

  // Attach event listeners to the play, previous, and next buttons
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/Images/pause.svg"; // Change play button to pause icon
    } else {
      currentSong.pause();
      play.src = "/Images/play.svg"; // Change play button to play icon
    }
  });
  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentSong.currentTime
    )} / ${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    document.querySelector(".circle").style.left =
      (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
    const seekTime =
      (e.offsetX / e.target.getBoundingClientRect().width) *
      currentSong.duration;
    currentSong.currentTime = seekTime;
  });

  // Add an event listener for hamburger menu
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listener for close menu
  document.querySelector(".left").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  // Add an event listener to previous
  previous.addEventListener("click", () => {
    console.log("previous clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  // Add an event listener to next
  next.addEventListener("click", () => {
    currentSong.pause();
    console.log("next clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to", e.target.value, "/100");
      currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Add event listener to mute the track
    document.querySelector(".volume > img").addEventListener("click",  e=> {
      if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg","mute.svg");
        currentSong.volume = 0;
        document
    .querySelector(".range").getElementsByTagName("input")[0].value = 0;
      }
      else{
        e.target.src = e.target.src.replace("mute.svg","volume.svg");
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
      }
    });
}
main();
