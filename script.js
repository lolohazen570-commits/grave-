// ===============================
// Grave Guinter Website Effects
// ===============================

// Fade-in animation for sections
const sections = document.querySelectorAll("section");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, {
  threshold: 0.15
});

sections.forEach((section) => {
  section.style.opacity = "0";
  section.style.transform = "translateY(60px)";
  section.style.transition = "all 1.2s ease";
  observer.observe(section);
});

// ===============================
// Random Lightning Effect
// ===============================

const flash = document.createElement("div");

flash.style.position = "fixed";
flash.style.top = 0;
flash.style.left = 0;
flash.style.width = "100%";
flash.style.height = "100%";
flash.style.background = "white";
flash.style.opacity = "0";
flash.style.pointerEvents = "none";
flash.style.zIndex = "998";

document.body.appendChild(flash);

function lightning() {

    flash.style.transition = "none";
    flash.style.opacity = "0.35";

    setTimeout(() => {
        flash.style.transition = ".35s";
        flash.style.opacity = "0";
    },80);

    const nextFlash = Math.random()*10000+5000;

    setTimeout(lightning,nextFlash);

}

setTimeout(lightning,4000);

// ===============================
// Floating Embers
// ===============================

function createEmber(){

    const ember=document.createElement("div");

    ember.className="ember";

    ember.style.left=Math.random()*100+"vw";

    ember.style.animationDuration=(Math.random()*6+5)+"s";

    ember.style.opacity=Math.random();

    ember.style.width=ember.style.height=
        (Math.random()*6+2)+"px";

    document.body.appendChild(ember);

    setTimeout(()=>{
        ember.remove();
    },11000);

}

setInterval(createEmber,350);

// ===============================
// Hero Title Glow Pulse
// ===============================

const title=document.querySelector("h1");

setInterval(()=>{

title.style.transform="scale(1.03)";

setTimeout(()=>{
title.style.transform="scale(1)";
},800);

},4000);

// ===============================
// Console Message
// ===============================

console.log(`
=========================================
        GRAVE GUINTER
 From the Dark. For the Light.
=========================================
`);