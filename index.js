// /* 
// 1.Render Song (done)
// 2.Scroll Top (done)
// Load Current Song (done)
// 3.Play / Pause (done)
// 4.CD rotate (done)
// 5.Next / prev (done)
// 6.Random (done)
// seeking/ tua (done)
// 7.Next / Repeat when ended  (done)
// 8.Active song (done)
// 9.Scroll active song into view (done)
// 10.Play song when click (done)
// cd hoàn tất percent khi song play (done)
// */
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
var jsonObject = {
    jsonString: "MY_KEY"
}
var jsonString = JSON.stringify(jsonObject)

const listSong = $('#play-list')
const dashBoard = $('#dash-board')
const cdThumb = $('.cdThumb')
const cd = $('.cdThumb .img')
const cdThumbWidth = cdThumb.offsetWidth
const cdThumbHeight = cdThumb.offsetHeight
const cdWidth = cd.offsetWidth
const cdHeight = cd.offsetHeight
const cdFullMark = $('.mark.full')
const cdFill = $$('.fill')
const buttonPlayPause = $('.toggle-pause_play')
const iconPlay = $('.icon-play')
const iconPause = $('.icon-pause')
const sliderBar = $('.sliderBar')
const repeat = $('.button.repeat')
const random = $('.button.random')
const buttonVolume = $('.button.volume')
const volumeBar = $('.duration-volume-bar')
const iconMute = $('.volume-mute')
const iconHigh = $('.volume-high')
const iconLow = $('.volume-low')


const storedConfig = JSON.parse(localStorage.getItem(jsonString));


var app = {
    currentIndex: 0,
    currentVolume: 1,
    isRandom: false,
    isRepeat: false,
    isPlaying: false,
    config: storedConfig || {},
    songs : [
        {
            name: 'Starboy',
            singer: 'The Weekend',
            path: '/new2/music/y2mate.com - The Weeknd  Starboy Lyrics ft Daft Punk.mp3',
            img: '/new2/img/star_boy.jpg'
        },
      {
          name: 'Bigcityboy',
          singer: 'Binz',
          path: '/new2/music/bigcityboy.mp3',
          img: '/new2/img/binz_album_big_cityBoy.jpg'
      },
      {
          name: 'Sad!',
          singer: 'Xxxtentacion',
          path: '/new2/music/sad_xxxtentacion.mp3',
          img: '/new2/img/sad.jpg'
      },
      {
          name: 'Lucid Dream',
          singer: 'Juice WRLD',
          path: '/new2/music/lucid_dream.mp3',
          img: '/new2/img/juice_wrld.jpg'
      },
      {
          name: 'Huỳnh Kim Long',
          singer: 'Dick',
          path: '/new2/music/huynh_kim_long.mp3',
          img: '/new2/img/dick.jpg'
        },
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(jsonString, JSON.stringify(this.config))
    },
    
    render: function () {
        const htmls = this.songs.map(function(song, index){
            return `<div data-index="${index}" class="song ${index === app.currentIndex ? 'active' :''} ">
                       <div class="thumb" style="background-image: url(${song.img})"></div>
                       <div class="body">
                           <div class="name-song">${song.name}</div>
                           <div class="singer">${song.singer}</div>
                       </div>
                    </div>`
        })
        listSong.innerHTML = htmls.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvent : function () {
        const _this = this
        
        // Scroll
        document.onscroll = function () {
            const scroll = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scroll
            const newCdHeight = cdHeight - scroll

            const newCdThumbWidth = cdThumbWidth - scroll
            const newCdThumbHeight = cdThumbHeight - scroll
            
            const r = $(':root')

            r.style.setProperty('--cd-dim', newCdThumbWidth + 'px')
            r.style.setProperty('--img-kichthuoc', newCdHeight + 'px')
            

            cd.style.width = newCdWidth > 0 ? newCdWidth +  'px' : 0
            cd.style.height = newCdHeight > 0 ? newCdHeight + 'px' : 0
           
        }
        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            // sliderBar trượt theo % bài hát đã được play
            const audioPersen100 = audio.duration
            const sliderPersen =  Math.floor(audio.currentTime * 100 / audioPersen100)
            var color = 'linear-gradient(to right, #f56c9a '+ sliderPersen +'% , #d6d6d6 '+ sliderPersen +'% )'
            sliderBar.value = sliderPersen
            sliderBar.style.background = color
            // cd thay đổi percent theo tiến độ bài hát
            const circlePersen = Math.floor(audio.currentTime * 180 / audioPersen100)
            cdFullMark.style.transform = `rotate(${circlePersen}deg)`
            cdFill.forEach(function (fill) {
                fill.style.transform = `rotate(${circlePersen}deg)`
            })
            

        }
        // Xử lí khi audio end
        audio.onended = function () {
            // next qua bài khác khi ended
           if(_this.isRandom) {
            _this.randomSong()
           } else if (_this.isRepeat) {
            _this.repeatSong()
           } else {
            _this.nextSong()
           }
           audio.play()
        }
        // Click
      const cdThumbAnimate =  cd.animate (
        {
            transform: 'rotate(360deg)' 
        }, 
        {
            duration: 10000,
            iterations: Infinity
        }
       )
       cdThumbAnimate.pause()
        // Play/Pause
       buttonPlayPause.onclick = function () {
          if(_this.isPlaying) {
            audio.pause()
          } else {
            audio.play()
          }
          audio.onplay = function () {
            _this.isPlaying = true
            buttonPlayPause.classList.add('playing')
            cdThumbAnimate.play()
            _this.srollToActiveSong()
          }
          audio.onpause = function () {
            _this.isPlaying = false
            buttonPlayPause.classList.remove('playing')
            cdThumbAnimate.pause()
          }
          
       }
        // Next/back song
        const buttonNext = $('.button.next')
        buttonNext.onclick = function () {
            if(_this.isRandom) {
               _this.randomSong()
            } else {
                _this.nextSong()
            }
            buttonPlayPause.classList.add('playing')
            _this.render()
            audio.play()
            _this.srollToActiveSong()
            
        }
        const buttonBack = $('.button.back')
        buttonBack.onclick = function () {
           if(_this.isRandom) {
            _this.randomSong()
           } else {
            _this.backSong()
           }
           buttonPlayPause.classList.add('playing')
           _this.render()
            audio.play()
           _this.srollToActiveSong()
        }
        // random
        random.onclick = function () {
            _this.isRandom = !_this.isRandom
            random.classList.toggle('active', _this.isRandom)
            _this.setConfig('isRandom',  _this.isRandom)
        }
        // repeat
        repeat.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            repeat.classList.toggle('active', _this.isRepeat)
            _this.setConfig('isRepeat', _this.isRepeat)
        }
        // seeking/tua
        sliderBar.onchange = function (e) {
            const seeking = (e.target.value / 100) * audio.duration
            audio.currentTime = seeking
        }
        // click >> active >> playsong
        listSong.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            const singer = e.target.closest('.song .body .singer')
            if(songNode || singer) {
                if(songNode) {
                   _this.currentIndex =  parseInt(songNode.getAttribute('data-index'))
                   _this.loadCurrentSong()
                   _this.render()
                   if(_this.isPlaying = true) {
                       buttonPlayPause.classList.add('playing')
                       audio.play()
                       cdThumbAnimate.play()
                   }
                }
            }
        }
        
       
        
        
        // hover vào button volume thì thanh volume-bar hiện ra
        buttonVolume.onmouseover = function () {
            volumeBar.style.visibility = 'visible'
            
        }
        // khi bỏ hover thì thanh volume-bar ẩn
        buttonVolume.onmouseout = function () {
            volumeBar.style.visibility = 'hidden'
            
        }
        audio.volume = _this.currentVolume
        volumeBar.onchange = function () {
            audio.volume = volumeBar.value
            const colorVolume = 'linear-gradient(to right, #f56c9a '+ volumeBar.value * 100 +'% , #d6d6d6 '+ volumeBar.value * 100 +'% )'
            volumeBar.style.background = colorVolume
            if (audio.volume === 0) {
                iconMute.classList.add('active')
                iconHigh.classList.remove('active')
                iconLow.classList.remove('active')
            } else if (audio.volume < 1 && audio.volume > 0) {
                iconMute.classList.remove('active')
                iconHigh.classList.remove('active')
                iconLow.classList.add('active')
            } else {
                iconMute.classList.remove('active')
                iconHigh.classList.add('active')
                iconLow.classList.remove('active')
            }
        }
        
    },
    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        
        this.loadCurrentSong()
    },
    backSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    randomSong: function () {
       let newIndex
       do {
        newIndex = Math.floor(Math.random() * this.songs.length)
       } while (
        newIndex === this.currentIndex
       )
       this.currentIndex = newIndex
       this.loadCurrentSong(newIndex)
    },
    repeatSong: function () {
      if(this.isRepeat) {
        audio.loop = false
        audio.load()
      } else {
        audio.loop = true
        audio.load()
      }
      this.loadCurrentSong()
    },
    srollToActiveSong: function () {
        const songActive = $('.song.active')
        var view = ''
        if(this.currentIndex <= 1) {
            view = 'end'
        } else {
            view = 'center'
        }

        setTimeout(function () {
            songActive.scrollIntoView({block: view, inline: "nearest", behavior: "auto"})
        }, 500)
    },
    loadConfig : function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    loadCurrentSong : function () {
         const heading = $('.heading h3')
         const cdImg = $('.cdThumb .img')
         const audio = $('#audio')

         heading.textContent = this.currentSong.name
         cdImg.style.backgroundImage = `url(${this.currentSong.img})`
         audio.src = this.currentSong.path
         
    },
    
    start : function () {
        this.loadConfig()
        
        this.defineProperties()
        
        this.handleEvent()
        
        this.loadCurrentSong()
        
        this.render()

        random.classList.toggle('active', this.isRandom)
        repeat.classList.toggle('active', this.isRepeat)
    }
}
app.start()















































































































// const $ = document.querySelector.bind(document);
// const $$ = document.querySelectorAll.bind(document);

// const circle = $('.img-cd-radius .circle')
// const cdThumb = $('.img-cd-radius .circle img')
// const cd = $('.img-cd-radius img');
// const circleWidth = circle.offsetWidth
// const circleHeight = circle.offsetHeight

// const cdWidth = cd.offsetWidth;
// const cdHeight = cd.offsetHeight;
// const sliderBar = $('.slider-bar input')
// const btnNext = $('.btn.btn-next')
// const btnPrew = $('.btn.btn-rewind')
// const btnRandom =  $('.btn.btn-random-song')
// const btnRepeat = $('.btn.btn-repeat-song')
// const listSong = $('.list-song')
// const mark = $$('.circle .mark')
// const fillOfMark = $$('.circle .mark .fill')





// var app = {
//     currentIndex: 0,
//     isPlaying: false,
//     isRandom: false,
//     isRepeat: false,
//     songs : [
//         {
//             name: 'Starboy',
//             singer: 'The Weekend',
//             path: '/Xay_dung_music_player_bigcoures16_js/music/y2mate.com - The Weeknd  Starboy Lyrics ft Daft Punk.mp3',
//             img: '/Xay_dung_music_player_bigcoures16_js/img/star_boy.jpg'
//         },
//         {
//             name: 'Bigcityboy',
//             singer: 'Binz',
//             path: '/Xay_dung_music_player_bigcoures16_js/music/bigcityboy.mp3',
//             img: '/Xay_dung_music_player_bigcoures16_js/img/binz_album_big_cityBoy.jpg'
//         },
//         {
//             name: 'Sad!',
//             singer: 'Xxxtentacion',
//             path: '/Xay_dung_music_player_bigcoures16_js/music/sad_xxxtentacion.mp3',
//             img: '/Xay_dung_music_player_bigcoures16_js/img/sad.jpg'
//         },
//         {
//             name: 'Lucid Dream',
//             singer: 'Juice WRLD',
//             path: '/Xay_dung_music_player_bigcoures16_js/music/lucid_dream.mp3',
//             img: '/Xay_dung_music_player_bigcoures16_js/img/juice_wrld.jpg'
//         },
//         {
//             name: 'Huỳnh Kim Long',
//             singer: 'Dick',
//             path: '/Xay_dung_music_player_bigcoures16_js/music/huynh_kim_long.mp3',
//             img: '/Xay_dung_music_player_bigcoures16_js/img/dick.jpg'
//         },
//     ],

//     render: function () {
//         const htmls = this.songs.map((song, index) => {
//             return `
//             <div data-index="${index}" class="song mr-bot-8 ${index === this.currentIndex ? 'active' :''}">
//                 <div class="img-song"><img src="${song.img}" alt=""></div>
//                 <div class="info-song">
//                     <div class="name-song">${song.name}</div>
//                     <div class="singer">${song.singer}</div>
//                 </div>
//             </div>
//             `
//         })
//         listSong.innerHTML = htmls.join('')
//     },

//     defineProperties: function() {
//         Object.defineProperty(this, 'currentSong', {
//             get: function() {
//                 return this.songs[this.currentIndex]
//             }
//         })
//     },

//     handleEvents: function() {
//         // scroll

//         // Ta đặt _this = this (this ở đây là app)
//         const _this = this
        
//         // Xử lý cd quay và dừng (cd rotate)
//         const cdThumbAnimate = cdThumb.animate([
//             {
//                 // from - to 
//                 transform: 'rotate(360deg)'
//             }
//         ], {
//             duration: 10000, 
//             iterations: Infinity
//         }
//         )
//         cdThumbAnimate.pause()
        
        


//         window.onscroll = function () {
//            const scroll = window.scrollY || document.documentElement.scrollTop;
//            const newCdWidth = cdWidth - scroll
//            const newCdHeight = cdHeight - scroll

           
           
           
//            cd.style.width = newCdWidth > 0 ?newCdWidth + 'px': 0;
//            cd.style.height = newCdHeight > 0 ?newCdHeight + 'px': 0
           
//            const styleOpacity = cd.style.opacity = newCdWidth / cdWidth
//         }

//         // play/pause
//         const btnPlayPause = $('.btn-play-pause')
        
//         btnPlayPause.onclick = function() {
//             // nếu ta chỉ viết this thay vì _this thì máy tính sẽ hiểu ta đang 
//             // lấy btnPlayPause là this


//           //  Cách 1:  if (_this.isPlaying) {
//             //     // ta có biến isPlaying = false (nghĩa là trình nhạc chưa được chạy)
//             //     // thì lúc đó khi ta bấm vào nút thì trình nhạc sẽ được phát (play)
//             //     _this.isPlaying = false
//             //     audio.play()
//             //     btnPlayPause.classList.add('playing')
//             // } else {
//             //     // ta có biến isPlaying = true (nghĩa là trình nhạc đang chạy)
//             //     // thì khi ta bấm vào nút thì trình nhạc sẽ bị dừng (pause)
//             //     _this.isPlaying = true
//             //     audio.pause()
//             //     btnPlayPause.classList.remove('playing')
//             // }


//           // Cách 2
//             if (_this.isPlaying) {
//                 audio.pause()
//             } else {
//                 audio.play()
//             }
//             // Khi song được play
//            audio.onplay = function () {
//             _this.isPlaying = true
//             btnPlayPause.classList.add('playing')
//             cdThumbAnimate.play()
//            }
//            // Khi song pause   
//            audio.onpause = function () {
//             _this.isPlaying = false
//             btnPlayPause.classList.remove('playing')
//             cdThumbAnimate.pause()
//            }

//            //  Thanh trượt (slider bar) thay đổi vị trí khi play (dùng timeupdate)
           
           
//            audio.ontimeupdate = function() {
//               const sliderPersen = Math.floor(audio.currentTime / audio.duration * 100)
//             //   console.log(audio.currentTime / audio.duration * 100)
//               sliderBar.value = sliderPersen
//               var color = 'linear-gradient(to right, #dba2b5 '+ sliderPersen +'% , #d6d6d6 '+ sliderPersen +'% )'
//               sliderBar.style.background = color

//             //  Cd hoàn tất percent 
//                const cdPersen = sliderPersen / 100 * 180
               
//                mark.forEach(function(markElement) {
//                 markElement.style.transform = `rotate(${cdPersen}deg)`
//                })
//                fillOfMark.forEach(function(fillElement) {
//                 fillElement.style.transform = `rotate(${cdPersen}deg)`
//                })
//            }
//         }
//         // Xử lý khi tua 
//         sliderBar.onchange = function (e) {
//            const seekTime = e.target.value / 100 * audio.duration
//            audio.currentTime = seekTime
//         }
//         // Xử lý khi next 
//         btnNext.onclick = function () {
//             if (_this.isRandom) {
//                 _this.randomSong()
//             } else {
//                 _this.nextSong()
//             }
            
//             btnPlayPause.classList.add('playing')
//             audio.play()
//             _this.render()
//             _this.scrollToActiveSong()
//         }
//         // Xử lý khi backwind
//         btnPrew.onclick = function() {
//             if (_this.isRandom) {
//                 _this.randomSong()
//             } else {
//                 _this.prewSong()
//             }

//             btnPlayPause.classList.add('playing')
//             audio.play()
//             _this.render()
//             _this.scrollToActiveSong()
//         }
//         // Xử lý khi muốn random song
//         btnRandom.onclick = function () {
//            _this.isRandom = !_this.isRandom;
//            btnRandom.classList.toggle('active', _this.isRandom)
//         }
//         // Xử lý khi muốn repeat song
//         btnRepeat.onclick = function() {
//             _this.isRepeat = !_this.isRepeat;
//             btnRepeat.classList.toggle('active', _this.isRepeat)
//         }
//         // Xử lý next khi bài hát ended
//        audio.onended = function () {
//         if (_this.isRandom) {
//             _this.randomSong()
//         } else if (_this.isRepeat) {
//             _this.repeatSong()
//         } else {
//             _this.nextSong()
//         }
        
//         audio.play()
//        }
//        // Xử lý click song -> song được add active và play
//        listSong.onclick = function (e) {
//           const songNode = e.target.closest('.song:not(.active)')
//           const option = e.target.closest('.option')
//           if (songNode || option) {
//             if(songNode) {
                
//                 _this.currentIndex = parseInt(songNode.getAttribute('data-index'))
                
//                 console.log(typeof(_this.currentIndex))
                
//                 _this.loadCurrentSong()
//                 _this.render()
//                 if(_this.isPlaying) {
//                     btnPlayPause.classList.add('playing')
//                     cdThumbAnimate.play()
//                     audio.play()
//                 } 
//             }
//           }
//        }
       
//     },

//    loadCurrentSong : function() {
//         const heading = $('.name-list-song')
//         const cdThumb = $('.img-cd-radius img')
//         const audio = $('#audio')

//         heading.textContent = this.currentSong.name
//         cdThumb.src = `${this.currentSong.img}`
//         audio.src = this.currentSong.path
 
//    },
//    nextSong : function() {
//       this.currentIndex++
//       if(this.currentIndex >= this.songs.length) {
//         this.currentIndex = 0
//       }
//       this.loadCurrentSong()
//    },
//    prewSong : function () {
//      this.currentIndex--
//      if(this.currentIndex < 0) {
//         this.currentIndex = this.songs.length
//      }
//      this.loadCurrentSong()
//    },
//    randomSong : function () {
//        let newIndex
//        do {
//         newIndex = Math.floor(Math.random() * this.songs.length)
//        } while (newIndex === this.currentIndex)
//        this.currentIndex = newIndex
//        this.loadCurrentSong(newIndex)
//    },
//    repeatSong : function () {
      
//       audio.load()
//       this.loadCurrentSong()
//    },
//    scrollToActiveSong: function () {
//       setTimeout(function () {
//         $('.song.active').scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
//       }, 500)
//    },
//     start: function () {
//         // Định nghĩa các thuộc tính cho Object
//         this.defineProperties()
        
//         // Lắng nghe / Xử lí các event (DOM events)
//         this.handleEvents()

//         // Tải thông tin bài hát đầu tiên vào UI khi sử dụng
//         this.loadCurrentSong()
        
//         // Render Playlist
//         this.render()
//     }
// }

// app.start()