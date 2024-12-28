console.log("Let's write javascript!");

let currentSong = new Audio()
let songs
let currentFolder


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currentFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //show all the songs in the plalist
    let songUL = document.querySelector(".songLists").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + ` <li>
                            <img src="images/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Khushal</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img src="images/playnow.svg" alt="">
                            </div>
                        </li>`
    }
    //attach eventlistner to all songs
    Array.from(document.querySelector(".songLists").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })

    
    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currentFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "/images/pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            //Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json()
            cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card" data-folder="${folder}" >
                        <div class="circulerPlay"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
                                width="30" height="30">
                                <polygon points="30,20 80,50 30,80" fill="black" />
                            </svg></div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <div class="cardInfo">
                            <h2>${response.title}</h2>
                            <p>${response.description}</p>
                        </div>
                    </div>`
        }
    }

    //Load the playlist when ever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
            console.log(songs[0].replaceAll("%20", " "));
        })
    })

}

async function main() {

    //get the list of all song
    await getSongs("songs/Yo_Yo_Honey_Singh")
    playMusic(songs[0], true)

    //Display all the albums
    displayAlbums()

    //play the song
    var audio = new Audio(songs[0])
    // audio.play()

    audio.addEventListener("loadeddata", () => {
        console.log(audio.duration, audio.currentSrc, audio.currentTime);
        //The duration variable now holds the duration(in seconds) of the audio clip
    })

    //Play Pause svg
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "/images/pause.svg"
        } else {
            currentSong.pause()
            play.src = "/images/play.svg"
        }
    })

    //listen for time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //Add an event listner to seekbar
    document.querySelector(".seekBar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //Add eventlistner for hamburger icon
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //Add eventlistner for close icon
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    //Add eventlistner for previous icon
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
        console.log(songs[index - 1].replaceAll("%20", " "));

    })

    //Add eventlistner for next icon
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
        console.log(songs[index + 1].replaceAll("%20", " "));
    })

    //Add eventlistner for volume seekbar
    document.querySelector("#volume").addEventListener("change", (e) => {
        currentSong.volume = Number(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".songVolume>img").src = document.querySelector(".songVolume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    //Add event listner to mute the track
    document.querySelector(".songVolume>img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector("#volume").value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector("#volume").value = 10;
        }
    })

}

main()