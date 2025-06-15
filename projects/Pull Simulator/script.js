/*
ELEMENTS
*/
const row1 = document.getElementById("first-row")
const row2 = document.getElementById("second-row")

const btn = document.getElementById("pull-button")

const counterText = document.getElementById("pull-counter")

/*
PULL LOGIC PREPERATION
*/
//Setting the characters
const fourStars = ['Bennett','Mika','Sucrose','Amber','Kaeya','Lisa','Razor']
const featuredFourStars = ['Charlotte','Freminet','Xiangling']
const fiveStars = ['Jean','Diluc','Mona','Keqing','Dehya','Qiqi']
const featuredFiveStar = 'Furina'

//Corresponding images
const images = {
    'Bennett': './images/bennett.WEBP',
    'Mika': './images/mika.WEBP',
    'Sucrose': './images/sucrose.WEBP',
    'Amber': './images/amber.WEBP',
    'Kaeya': './images/kaeya.WEBP',
    'Lisa': './images/lisa.WEBP',
    'Razor': './images/razor.WEBP',
    'Charlotte': './images/charlotte.jpg',
    'Freminet': './images/freminet.jpg',
    'Xiangling': './images/xiangling.jpg',
    'Jean': './images/jean.WEBP',
    'Diluc': './images/diluc.WEBP',
    'Mona': './images/mona.WEBP',
    'Keqing': './images/keqing.WEBP',
    'Dehya': './images/dehya.WEBP',
    'Qiqi': './images/qiqi.WEBP',
    'Furina': './images/furina.jpg',
    'Dull Sword': './images/dull_sword.WEBP'
}

//Setting up the slots
let slots = {}

//Setting up guarantees and rates
let fourStarGuarantee = 1
const fourStarGuaranteeMax = 10
let featuredFourStarGuarantee = false
const fourStarRate = 0.100

let fiveStarGuarantee = 1
const fiveStarGuaranteeMax = 90
let featuredFiveStarGuarantee = false
const fiveStarRate = 0.006

//Pull counter
let pullCount = 0

//Setting up functions
function giveFourStar() {
    if(!featuredFourStarGuarantee) {
        //4 Star 50/50
        if(Math.random() < 0.5) {
            //Win the 50/50
            fourStarGuarantee = 1
            return featuredFourStars[Math.floor(Math.random() * (featuredFourStars.length))]
        } else {
            //Lose the 50/50
            fourStarGuarantee = 1
            featuredFourStarGuarantee = true
            return fourStars[Math.floor(Math.random() * (fourStars.length))]
        }
    } else {
        fourStarGuarantee = 1
        featuredFourStarGuarantee = false
        return featuredFourStars[Math.floor(Math.random() * (featuredFourStars.length))]
    }
}

function giveFiveStar() {
    if(!featuredFiveStarGuarantee) {
        //5 Star 50/50
        if(Math.random() < 0.5) {    
            //Win the 50/50
            fiveStarGuarantee = 1
            return featuredFiveStar
        } else {
            //Lose the 50/50
            fiveStarGuarantee = 1
            featuredFiveStarGuarantee = true
            return fiveStars[Math.floor(Math.random() * (fiveStars.length))]
        }
    } else {
        featuredFiveStarGuarantee = false
        fiveStarGuarantee = 1
        return featuredFiveStar
    }
}

function isEmptyString(mystring) {
    return (mystring == null || (typeof mystring === "string" && mystring.trim().length === 0))
}

//Reveal the item after click function
function revealImage(slot, e) {
    e.src=`${images[slots[slot]]}`
}

//Appear animation
function moveElement(elem,ms,relative,pos) {
    elem.style.setProperty(relative,pos)
    elem.style.transition = ms.toString() + "ms"
}

/*
EVENTLISTENERS
*/
btn.addEventListener("click", function() {

    /*
    PULL LOGIC
    */
    //Setting up pulls
    let pulls = []

    //Pull loop
    for(let i = 0; i<10; i++) {
        if(fiveStarGuarantee < fiveStarGuaranteeMax) {
            if(fourStarGuarantee < fourStarGuaranteeMax) {
                //5 Star rate
                if(!(Math.random() < fiveStarRate)) {
                    //4 Star rate
                    if(!(Math.random() < fourStarRate)) {
                        pulls[i] = 'Dull Sword'
                        fourStarGuarantee++
                        fiveStarGuarantee++
                    } else {
                        pulls[i] = giveFourStar()
                        fiveStarGuarantee++
                    }
                } else {
                    pulls[i] = giveFiveStar()
                }
            } else {
                pulls[i] = giveFourStar()
                fiveStarGuarantee++
            }
        } else {
            pulls[i] = giveFiveStar()
        }
    }

    pullCount++

    //Assign the characters to the slots
    for(let i = 0; i<10; i++) {
        slots[i+1] = pulls[i]
    }

    //Displaying the pulls
    row1.innerHTML = 
        `<div class="item1" id="i1"><img src="./images/question-mark.png" onclick="revealImage(1,this)"></div>
        <div class="item2" id="i2"><img src="./images/question-mark.png" onclick="revealImage(2,this)"></div>
        <div class="item3" id="i3"><img src="./images/question-mark.png" onclick="revealImage(3,this)"></div>
        <div class="item4" id="i4"><img src="./images/question-mark.png" onclick="revealImage(4,this)"></div>
        <div class="item5" id="i5"><img src="./images/question-mark.png" onclick="revealImage(5,this)"></div>`
    
    row2.innerHTML = 
        `<div class="item1" id="i6"><img src="./images/question-mark.png" onclick="revealImage(6,this)"></div>
        <div class="item2" id="i7"><img src="./images/question-mark.png" onclick="revealImage(7,this)"></div>
        <div class="item3" id="i8"><img src="./images/question-mark.png" onclick="revealImage(8,this)"></div>
        <div class="item4" id="i9"><img src="./images/question-mark.png" onclick="revealImage(9,this)"></div>
        <div class="item5" id="i10"><img src="./images/question-mark.png" onclick="revealImage(10,this)"></div>`

    if (!isEmptyString(counterText.innerHTML)) {
        const oldCounterText = parseInt(counterText.innerText)
        counterText.innerText = `${(oldCounterText + 10)} Pulls`
    } else {
        counterText.innerText = `10 Pulls`
    }

    //Appear animation
    let t = 200
    
    for(let i = 1; i <= 10; i++) {
        if(i <= 5) {
            const e = document.getElementById(`i${i}`)
            e.offsetHeight
            moveElement(e,t,"top","0")
            t += 200
        } else {
            const e = document.getElementById(`i${i}`)
            e.offsetHeight
            moveElement(e,t,"bottom","0")
            t -= 200
        }
    }

    //Setting border colors for rarity
    for(let i = 0; i<10; i++) {
        
        const box = document.getElementById("i"+((i+1).toString()))

        if(fourStars.includes(pulls[i]) || featuredFourStars.includes(pulls[i])) {
            box.style.border = "solid 2px purple"
        } else if(fiveStars.includes(pulls[i]) || featuredFiveStar == pulls[i]) {
            box.style.border = "solid 2px gold"
        } else {
            box.style.border = "solid 2px cornflowerblue"
        }
    }
})

/*
BUTTON STYLE CHANGER ON TOUCH/MOUSEDOWN
*/
//save old CSS
const oldColor = btn.style.color
const oldBackgroundColor = btn.style.backgroundColor
const oldWidth = btn.style.width
const oldHeight = btn.style.height

btn.addEventListener("mousedown", function() {
    btn.style.color = "red"
    btn.style.backgroundColor = "green"
    btn.style.width = "55"
    btn.style.height = "22px"
})

btn.addEventListener("mouseup", function() {
    btn.style.color = oldColor
    btn.style.backgroundColor = oldBackgroundColor
    btn.style.width = oldWidth
    btn.style.height = oldHeight
})

btn.addEventListener("touchstart", function() {
    btn.style.color = "red"
    btn.style.backgroundColor = "green"
    btn.style.width = "55"
    btn.style.height = "22px"
})

btn.addEventListener("touchend", function() {
    btn.style.color = oldColor
    btn.style.backgroundColor = oldBackgroundColor
    btn.style.width = oldWidth
    btn.style.height = oldHeight
})