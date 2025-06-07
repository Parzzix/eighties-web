class EightiesEvents {
    constructor() {
        this.events = this.generateEvents();
        this.init();
    }

    init() {
        this.displayCurrentDate();
        this.loadTodaysEvents();
    }

    displayCurrentDate() {
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = today.toLocaleDateString('en-US', options);
    }

    generateEvents() {
        return {
            "01-01": [
                {
                    year: 1983,
                    category: "tv",
                    title: "The A-Team Premieres",
                    description: "The action-adventure series starring George Peppard and Mr. T debuts on NBC, becoming one of the most iconic shows of the decade."
                }
            ],
            "01-15": [
                {
                    year: 1981,
                    category: "tv",
                    title: "Hill Street Blues Premieres",
                    description: "The groundbreaking police drama that revolutionized television storytelling debuts on NBC."
                }
            ],
            "02-14": [
                {
                    year: 1984,
                    category: "music",
                    title: "Madonna's 'Borderline' Released",
                    description: "Madonna releases one of her signature hits, helping establish her as the Queen of Pop."
                }
            ],
            "03-30": [
                {
                    year: 1981,
                    category: "movie",
                    title: "Raiders of the Lost Ark Begins Filming",
                    description: "Steven Spielberg begins production on the adventure film that would launch the Indiana Jones franchise."
                }
            ],
            "04-26": [
                {
                    year: 1986,
                    category: "tv",
                    title: "Chernobyl Disaster Inspires TV Movies",
                    description: "The nuclear disaster becomes subject matter for several TV movies throughout the late 80s."
                }
            ],
            "05-25": [
                {
                    year: 1983,
                    category: "movie",
                    title: "Return of the Jedi Released",
                    description: "The final film in the original Star Wars trilogy premieres, concluding Luke Skywalker's journey."
                }
            ],
            "06-07": [
                {
                    year: 1982,
                    category: "movie",
                    title: "E.T. the Extra-Terrestrial Released",
                    description: "Steven Spielberg's heartwarming tale of friendship between a boy and an alien becomes the highest-grossing film of the decade."
                },
                {
                    year: 1984,
                    category: "music",
                    title: "Prince's Purple Rain Tour Begins",
                    description: "Prince launches his legendary Purple Rain tour, promoting both the album and the film."
                },
                {
                    year: 1987,
                    category: "tv",
                    title: "Miami Vice Season 3 Finale",
                    description: "The stylish crime drama airs its season finale, cementing its influence on 80s fashion and music."
                }
            ],
            "07-04": [
                {
                    year: 1986,
                    category: "movie",
                    title: "Top Gun Soars at Box Office",
                    description: "Tom Cruise's action film continues its dominance during Independence Day weekend."
                }
            ],
            "08-01": [
                {
                    year: 1981,
                    category: "music",
                    title: "MTV Launches",
                    description: "Music Television begins broadcasting with 'Video Killed the Radio Star' by The Buggles, forever changing music culture."
                }
            ],
            "09-30": [
                {
                    year: 1986,
                    category: "tv",
                    title: "Cheers Season 5 Premieres",
                    description: "The beloved sitcom returns for another season at the Boston bar where everybody knows your name."
                }
            ],
            "10-26": [
                {
                    year: 1985,
                    category: "movie",
                    title: "Back to the Future Released",
                    description: "Michael J. Fox travels through time in this sci-fi comedy that becomes a cultural phenomenon."
                }
            ],
            "11-22": [
                {
                    year: 1983,
                    category: "tv",
                    title: "The Day After Airs",
                    description: "ABC's nuclear war TV movie becomes one of the most watched television events in history."
                }
            ],
            "12-25": [
                {
                    year: 1988,
                    category: "movie",
                    title: "Die Hard Christmas Release",
                    description: "Bruce Willis stars in the action film that redefines the Christmas movie genre."
                }
            ]
        };
    }

    getCurrentDateKey() {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${month}-${day}`;
    }

    loadTodaysEvents() {
        const loading = document.getElementById('loading');
        const container = document.getElementById('eventsContainer');
        const noEvents = document.getElementById('noEvents');

        // Simulate loading delay for better UX
        setTimeout(() => {
            loading.style.display = 'none';

            const dateKey = this.getCurrentDateKey();
            const todaysEvents = this.events[dateKey] || [];

            if (todaysEvents.length === 0) {
                noEvents.style.display = 'block';
                return;
            }

            todaysEvents.forEach((event, index) => {
                setTimeout(() => {
                    const eventCard = this.createEventCard(event);
                    container.appendChild(eventCard);
                }, index * 200);
            });
        }, 1000);
    }

    createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';

        const categoryClass = `category-${event.category}`;
        const categoryName = event.category.charAt(0).toUpperCase() + event.category.slice(1);

        card.innerHTML = `
            <div class="event-category ${categoryClass}">${categoryName}</div>
            <div class="event-year">${event.year}</div>
            <h3 class="event-title">${event.title}</h3>
            <p class="event-description">${event.description}</p>
        `;

        return card;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new EightiesEvents();
});
