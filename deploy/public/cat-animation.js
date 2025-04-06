// Cat and Ball Animation using anime.js
document.addEventListener('DOMContentLoaded', () => {
    // Get animation elements
    const cat = document.querySelector('.cat');
    const catHead = document.querySelector('.cat-head');
    const catBody = document.querySelector('.cat-body');
    const catTail = document.querySelector('.cat-tail');
    const leftEar = document.querySelector('.ear.left');
    const rightEar = document.querySelector('.ear.right');
    const legs = document.querySelectorAll('.cat-legs .leg');
    const ball = document.querySelector('.ball');
    const shadow = document.querySelector('.shadow');
    const spinnerOverlay = document.getElementById('spinner-overlay');
    const loadingText = document.querySelector('.loading-text');

    // Cat starts offscreen to the left
    anime.set(cat, {
        translateX: -150
    });

    // Ball starts ahead of the cat
    anime.set(ball, {
        translateX: 50,
        translateY: 20
    });

    // Shadow starts with the ball
    anime.set(shadow, {
        translateX: 50,
        scaleX: 0.7
    });

    // Create the cat chase animation timeline
    const createCatAnimation = () => {
        // Reset positions
        anime.set(cat, { translateX: -150 });
        anime.set(ball, { translateX: 50, translateY: 20 });
        anime.set(shadow, { translateX: 50 });
        
        // Create a timeline
        const timeline = anime.timeline({
            easing: 'easeOutExpo',
            loop: true
        });
        
        // Ball bouncing animation
        timeline.add({
            targets: ball,
            translateX: [
                { value: 200, duration: 2000, delay: 0 },
                { value: -200, duration: 2500, delay: 0 }
            ],
            translateY: [
                { value: -30, duration: 300 },
                { value: 20, duration: 300, delay: 0 },
                { value: -25, duration: 300, delay: 300 },
                { value: 20, duration: 300, delay: 0 },
                { value: -20, duration: 300, delay: 300 },
                { value: 20, duration: 300, delay: 0 },
                { value: -15, duration: 300, delay: 300 },
                { value: 20, duration: 300, delay: 0 }
            ],
            rotation: {
                value: '2turn',
                duration: 2200,
                easing: 'linear'
            },
            scale: [
                { value: 1.1, duration: 100, delay: 0 },
                { value: 1, duration: 200, delay: 0 }
            ]
        }, 0);
        
        // Shadow following the ball
        timeline.add({
            targets: shadow,
            translateX: [
                { value: 200, duration: 2000, delay: 0 },
                { value: -200, duration: 2500, delay: 0 }
            ],
            scaleX: [
                { value: 0.5, duration: 300 },
                { value: 0.7, duration: 300, delay: 0 },
                { value: 0.5, duration: 300, delay: 300 },
                { value: 0.7, duration: 300, delay: 0 },
                { value: 0.5, duration: 300, delay: 300 },
                { value: 0.7, duration: 300, delay: 0 },
                { value: 0.5, duration: 300, delay: 300 },
                { value: 0.7, duration: 300, delay: 0 }
            ],
            easing: 'easeOutExpo'
        }, 0);
        
        // Cat chasing the ball
        timeline.add({
            targets: cat,
            translateX: [
                { value: 0, duration: 1000, delay: 200 },
                { value: 150, duration: 1500, delay: 0 },
                { value: -150, duration: 1500, delay: 0 }
            ],
            easing: 'easeOutInSine'
        }, 0);
        
        // Cat tail wagging
        timeline.add({
            targets: catTail,
            rotateZ: [
                { value: -20, duration: 200 },
                { value: 20, duration: 200 },
                { value: -20, duration: 200 },
                { value: 20, duration: 200 }
            ],
            easing: 'easeInOutSine',
            loop: true
        }, 0);
        
        // Cat legs movement (running)
        timeline.add({
            targets: legs,
            height: [
                { value: 18, duration: 100 },
                { value: 12, duration: 100 }
            ],
            delay: anime.stagger(50),
            easing: 'easeInOutQuad',
            loop: true
        }, 0);
        
        // Cat head slight bobbing
        timeline.add({
            targets: catHead,
            translateY: [
                { value: -2, duration: 200 },
                { value: 0, duration: 200 }
            ],
            easing: 'easeInOutSine',
            loop: true
        }, 0);
        
        // Cat ears twitching
        timeline.add({
            targets: [leftEar, rightEar],
            rotateZ: [
                { value: '+=5', duration: 300 },
                { value: '-=5', duration: 300 }
            ],
            delay: anime.stagger(100),
            easing: 'easeInOutSine',
            loop: true
        }, 0);
        
        // Loading text pulse
        timeline.add({
            targets: loadingText,
            opacity: [0.4, 0.9],
            duration: 1000,
            easing: 'easeInOutQuad',
            loop: true
        }, 0);
        
        return timeline;
    };

    // Animation instance
    let catAnimation = null;

    // Function to start the animation
    window.startCatAnimation = () => {
        if (spinnerOverlay.classList.contains('hidden')) {
            spinnerOverlay.classList.remove('hidden');
        }
        
        if (!catAnimation) {
            catAnimation = createCatAnimation();
        } else {
            catAnimation.restart();
        }
    };

    // Function to stop the animation
    window.stopCatAnimation = () => {
        if (!spinnerOverlay.classList.contains('hidden')) {
            spinnerOverlay.classList.add('hidden');
        }
        
        if (catAnimation) {
            catAnimation.pause();
        }
    };
});