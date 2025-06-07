class EightiesEvents {
    constructor() {
        this.corsProxy = 'https://api.allorigins.win/raw?url=';
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

    async loadTodaysEvents() {
        const loading = document.getElementById('loading');
        const container = document.getElementById('eventsContainer');
        const noEvents = document.getElementById('noEvents');

        try {
            loading.style.display = 'block';

            const today = new Date();
            const events = await this.fetchAllEvents(today);

            loading.style.display = 'none';

            if (events.length === 0) {
                noEvents.style.display = 'block';
                return;
            }

            // Sort events by year
            events.sort((a, b) => a.year - b.year);

            events.forEach((event, index) => {
                setTimeout(() => {
                    const eventCard = this.createEventCard(event);
                    container.appendChild(eventCard);
                }, index * 200);
            });

        } catch (error) {
            console.error('Error loading events:', error);
            loading.style.display = 'none';
            noEvents.style.display = 'block';
            noEvents.innerHTML = '<p>Unable to load events. Please try again later.</p>';
        }
    }

    async fetchAllEvents(date) {
        const events = [];
        const month = date.toLocaleString('en-US', { month: 'long' });
        const day = date.getDate();

        // Fetch from multiple sources concurrently
        const promises = [
            this.fetchWikipediaEvents(month, day),
            this.fetchOnThisDayEvents(month, day),
            this.fetchMusicEvents(month, day)
        ];

        const results = await Promise.allSettled(promises);

        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
                events.push(...result.value);
            }
        });

        // Remove duplicates and filter for 80s
        return this.filterAndDeduplicate(events);
    }

    async fetchWikipediaEvents(month, day) {
        try {
            const events = [];

            // Fetch Wikipedia "On This Day" data
            const wikiUrl = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}`;

            const response = await fetch(this.corsProxy + encodeURIComponent(wikiUrl));
            const data = await response.json();

            if (data.events) {
                data.events.forEach(event => {
                    if (event.year >= 1980 && event.year <= 1989) {
                        const category = this.categorizeWikipediaEvent(event.text);
                        if (category) {
                            events.push({
                                year: event.year,
                                category: category,
                                title: this.extractTitle(event.text),
                                description: event.text,
                                source: 'Wikipedia'
                            });
                        }
                    }
                });
            }

            return events;
        } catch (error) {
            console.error('Wikipedia fetch error:', error);
            return [];
        }
    }

    async fetchOnThisDayEvents(month, day) {
        try {
            const events = [];

            // Scrape "On This Day" music events
            const musicUrl = `https://www.onthisday.com/music/date/${new Date().getFullYear()}/${month.toLowerCase()}/${day}`;

            const response = await fetch(this.corsProxy + encodeURIComponent(musicUrl));
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Extract events from the parsed HTML
            const eventElements = doc.querySelectorAll('.event-item, .timeline-item, .history-item');

            eventElements.forEach(element => {
                const text = element.textContent;
                const yearMatch = text.match(/19[8-9]\d/);

                if (yearMatch) {
                    const year = parseInt(yearMatch[0]);
                    if (year >= 1980 && year <= 1989) {
                        events.push({
                            year: year,
                            category: 'music',
                            title: this.extractTitle(text),
                            description: text.trim(),
                            source: 'OnThisDay'
                        });
                    }
                }
            });

            return events;
        } catch (error) {
            console.error('OnThisDay fetch error:', error);
            return [];
        }
    }

    async fetchMusicEvents(month, day) {
        try {
            const events = [];

            // Use multiple music history sources
            const sources = [
                this.fetchLastFmEvents(month, day),
                this.fetchMusicHistoryEvents(month, day)
            ];

            const results = await Promise.allSettled(sources);

            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    events.push(...result.value);
                }
            });

            return events;
        } catch (error) {
            console.error('Music events fetch error:', error);
            return [];
        }
    }

    async fetchLastFmEvents(month, day) {
        try {
            // Note: This would require a Last.fm API key in production
            // For demo purposes, we'll simulate the structure
            const events = [];

            // Simulate API call structure
            const mockData = await this.getMockMusicData(month, day);

            mockData.forEach(item => {
                if (item.year >= 1980 && item.year <= 1989) {
                    events.push({
                        year: item.year,
                        category: 'music',
                        title: item.title,
                        description: item.description,
                        source: 'LastFM'
                    });
                }
            });

            return events;
        } catch (error) {
            console.error('LastFM fetch error:', error);
            return [];
        }
    }

    async fetchMusicHistoryEvents(month, day) {
        try {
            const events = [];

            // Fetch from music history websites
            const historyUrl = `https://www.songfacts.com/category/songs-released-on-${month.toLowerCase()}-${day}`;

            const response = await fetch(this.corsProxy + encodeURIComponent(historyUrl));
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Extract song release information
            const songElements = doc.querySelectorAll('.song-item, .release-item, .fact-item');

            songElements.forEach(element => {
                const text = element.textContent;
                const yearMatch = text.match(/19[8-9]\d/);

                if (yearMatch) {
                    const year = parseInt(yearMatch[0]);
                    if (year >= 1980 && year <= 1989) {
                        events.push({
                            year: year,
                            category: 'music',
                            title: this.extractSongTitle(text),
                            description: text.trim(),
                            source: 'SongFacts'
                        });
                    }
                }
            });

            return events;
        } catch (error) {
            console.error('Music history fetch error:', error);
            return [];
        }
    }

    async getMockMusicData(month, day) {
        // Simulate dynamic data that would come from APIs
        // In production, this would be replaced with real API calls
        const currentDate = `${month}-${day}`;
        const musicEvents = {
            'June-7': [
                {
                    year: 1982,
                    title: 'E.T. Soundtrack Released',
                    description: 'John Williams\' iconic score for E.T. the Extra-Terrestrial is released.'
                },
                {
                    year: 1984,
                    title: 'Prince Purple Rain Tour Announcement',
                    description: 'Prince announces his Purple Rain tour dates.'
                }
            ],
            'August-1': [
                {
                    year: 1981,
                    title: 'MTV Launches',
                    description: 'Music Television begins broadcasting, changing music forever.'
                }
            ]
        };

        return musicEvents[currentDate] || [];
    }

    categorizeWikipediaEvent(text) {
        const lowerText = text.toLowerCase();

        // Skip political and sports events
        if (lowerText.includes('election') || lowerText.includes('president') || 
            lowerText.includes('war') || lowerText.includes('battle') ||
            lowerText.includes('olympics') || lowerText.includes('championship')) {
            return null;
        }

        // Categorize pop culture events
        if (lowerText.includes('album') || lowerText.includes('song') || 
            lowerText.includes('music') || lowerText.includes('band') ||
            lowerText.includes('singer') || lowerText.includes('concert')) {
            return 'music';
        }

        if (lowerText.includes('film') || lowerText.includes('movie') || 
            lowerText.includes('cinema') || lowerText.includes('premiere')) {
            return 'movie';
        }

        if (lowerText.includes('television') || lowerText.includes('tv show') || 
            lowerText.includes('series') || lowerText.includes('broadcast')) {
            return 'tv';
        }

        return null;
    }

    extractTitle(text) {
        // Extract meaningful titles from event descriptions
        const sentences = text.split('.');
        let title = sentences[0];

        // Clean up the title
        title = title.replace(/^\d{4}[\s\-–]+/, ''); // Remove year prefix
        title = title.replace(/^(On this day|Today in|This day in)\s+/i, '');

        // Limit length
        if (title.length > 60) {
            title = title.substring(0, 57) + '...';
        }

        return title.trim();
    }

    extractSongTitle(text) {
        // Extract song titles from music-specific text
        const songMatch = text.match(/"([^"]+)"/);
        if (songMatch) {
            return `"${songMatch[1]}" Released`;
        }

        return this.extractTitle(text);
    }

    filterAndDeduplicate(events) {
        // Remove duplicates based on title similarity
        const unique = [];
        const seen = new Set();

        events.forEach(event => {
            const key = `${event.year}-${event.title.toLowerCase().substring(0, 20)}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(event);
            }
        });

        return unique;
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
            ${event.source ? `<div class="event-source">Source: ${event.source}</div>` : ''}
        `;

        return card;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new EightiesEvents();
});
