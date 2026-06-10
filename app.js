
// 1. Color and Asset Mapping Array for the 2026 Teams Configuration
const TEAM_CONFIGS = {
    "red_bull": { color: "#3671C6", name: "Red Bull" },
    "ferrari": { color: "#E80020", name: "Ferrari" },
    "mercedes": { color: "#27F4D2", name: "Mercedes" },
    "mclaren": { color: "#FF8000", name: "McLaren" },
    "aston_martin": { color: "#229971", name: "Aston Martin" },
    "alpine": { color: "#0093CC", name: "Alpine" },
    "williams": { color: "#64C4FF", name: "Williams" },
    "vcarb": { color: "#6692FF", name: "RB" },
    "sauber": { color: "#52E252", name: "Sauber" },
    "haas": { color: "#B6BABD", name: "Haas" }
};

// 2. REQUESTED FEATURE: Convert 24-Hour ISO Timestamps to 12-Hour AM/PM Formats
function formatTo12Hour(dateString) {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Formats hour '0' to read as '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${minutesStr} ${ampm}`;
}

// 3. Fetch Data Asynchronously from the Community Jolpica F1 API Engine
async function fetchF1DashboardData() {
    try {
        // Fetch Live Standings Layout
        const standingsResponse = await fetch('https://api.jolpi.ca/ergast/f1/current/driverStandings.json');
        const standingsData = await standingsResponse.json();
        const standingsList = standingsData.MRData.StandingsTable.StandingsList[0].DriverStandings;

        // Fetch Schedule Layout for Next Race Session Card
        const scheduleResponse = await fetch('https://api.jolpi.ca/ergast/f1/current/next.json');
        const scheduleData = await scheduleResponse.json();
        const nextRace = scheduleData.MRData.RaceTable.Races[0];

        // Render both sections
        renderNextRaceBanner(nextRace);
        renderDriverGrid(standingsList);

    } catch (error) {
        console.error("Error loading live F1 Telemetry Data streams: ", error);
        document.getElementById('driver-grid').innerHTML = `<div class="loading-spinner">Unable to load live standings. Please try again later.</div>`;
    }
}

// 4. Render Top Next Race Display
function renderNextRaceBanner(race) {
    if (!race) return;
    const bannerContainer = document.getElementById('next-race-banner');
    
    // Combine date and time strings provided by API parameters safely
    const raceDateTimeISO = `${race.date}T${race.time}`;
    const formattedTime12H = formatTo12Hour(raceDateTimeISO);

    bannerContainer.innerHTML = `
        <h2>UPNEXT: ${race.raceName.toUpperCase()}</h2>
        <p>${race.Circuit.circuitName} — ${race.date}</p>
        <div class="time-pill">Race Start: ${formattedTime12H} Local Time</div>
    `;
}

// 5. Build Dynamic Left-Right Driver Cards Area
function renderDriverGrid(standings) {
    const gridContainer = document.getElementById('driver-grid');
    gridContainer.innerHTML = ""; // Wipe loading status text

    standings.forEach(item => {
        const driver = item.Driver;
        const constructor = item.Constructors[0];
        
        // Match settings configuration records, fallback to base default styles if team shifts
        const teamKey = constructor.constructorId;
        const teamColor = TEAM_CONFIGS[teamKey]?.color || "#e10600";
        const teamDisplayName = TEAM_CONFIGS[teamKey]?.name || constructor.name;

        // OpenF1/Official Asset Fallback APIs mapping structures
        const driverPortrait = `https://media.formula1.com/content/dam/fom-website/drivers/${driver.code.substring(0,3).toUpperCase()}${driver.driverId.charAt(0).toUpperCase()}/headshot.png`;
        const driverHelmet = `https://api.openf1.org/v1/images/helmets/${driver.driverId}.png`;

        const cardHTML = `
            <div class="driver-card" style="--team-color: ${teamColor}">
                <div class="driver-photo-container">
                    <img src="${driverPortrait}" alt="${driver.familyName}" class="driver-img" 
                         onerror="this.src='https://www.formula1.com/etc/designs/fom-website/images/driver-placeholder.png'">
                </div>
                
                <div class="card-content">
                    <span class="team-bg-text">${teamDisplayName}</span>
                    <div class="driver-details">
                        <span class="driver-number">#${driver.permanentNumber || '00'}</span>
                        <h3>${driver.givenName} ${driver.familyName}</h3>
                        <span class="points-badge">Rank ${item.position} — ${item.points} PTS</span>
                    </div>
                </div>

                <div class="helmet-container">
                    <img src="${driverHelmet}" alt="Helmet Graphic" class="helmet-img" 
                         onerror="this.style.display='none'">
                </div>
            </div>
        `;
        
        gridContainer.innerHTML += cardHTML;
    });
}

// Initialize Application Engine on page render
window.addEventListener('DOMContentLoaded', fetchF1DashboardData);