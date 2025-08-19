// ================== DOMContentLoaded ==================
document.addEventListener("DOMContentLoaded", function() {

    // ================== AOS INIT ==================
    AOS.init();

    // ================== ACTIVE MENU HIGHLIGHT ==================
    const sections = document.querySelectorAll("section, main");
    const navLinks = document.querySelectorAll("nav a");

    window.addEventListener("scroll", () => {
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 60;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute("id");
            }
        });
        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });
    });

    // ================== SWIPER INIT ==================
    const swiper = new Swiper(".services-swiper", {
        loop: true,
        autoplay: {
            delay: 2500,
            disableOnInteraction: false,
        },
        slidesPerView: 1,
        spaceBetween: 20,
        pagination: { el: ".swiper-pagination", clickable: true },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        breakpoints: {
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
        },
    });

    // ================== PARALLAX EFFECT ==================
    document.addEventListener("mousemove", (event) => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;

        document.querySelectorAll(".parallax").forEach((element) => {
            const speed = element.getAttribute("data-speed");
            element.style.transform = `translate(${x * speed * 20}px, ${y * speed * 20}px)`;
        });
    });

    // ================== SIGNIN PAGE OPEN & CLOSE ==================
    const signinButton = document.getElementById('signinButton');
    const signinPage = document.getElementById('signinPage');
    const closeIcon = document.getElementById('closeIcon');

    if (signinButton && signinPage && closeIcon) {
        signinButton.addEventListener('click', function() {
            signinPage.classList.remove('closeSignin');
            signinPage.classList.add("openSignin");
        });

        closeIcon.addEventListener('click', function() {
            signinPage.classList.remove("openSignin");
            signinPage.classList.add('closeSignin');
        });
    }

    // ================== SIDEBAR OPEN & CLOSE ==================
    const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('header nav');

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('nav-open');
});

    const sideBar = document.querySelector('.sidebar');
    const menuButton = document.querySelector('.menu-icon');
    const closeButton = document.querySelector('.close-icon');

    if (sideBar && menuButton && closeButton) {
        menuButton.addEventListener("click", function() {
            sideBar.classList.remove('close-sidebar');
            sideBar.classList.add('open-sidebar');
        });

        closeButton.addEventListener("click", function() {
            sideBar.classList.remove('open-sidebar');
            sideBar.classList.add('close-sidebar');
        });
    }

});
