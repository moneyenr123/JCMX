<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JCMX – Dirt Bike Hillclimb</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="favicon.png">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- MAIN HUD WRAPPER -->
    <div id="hud">
        <div id="hud-top">
            <div id="hud-title-block">
                <span id="hud-title">JCMX</span>
                <span id="hud-subtitle">Dirt Bike Hillclimb</span>
            </div>
            <div id="hud-session">
                <span id="hud-level-label">Level: Hills 1</span>
                <span id="hud-status-label">Status: Riding</span>
            </div>
        </div>

        <div id="hud-middle">
            <div class="hud-row">
                <span class="hud-stat-label">Bike:</span>
                <span id="brandLabel" class="hud-stat-value">XK 85</span>

                <span class="hud-stat-label">Stroke:</span>
                <span id="strokeLabel" class="hud-stat-value">2‑Stroke</span>

                <span class="hud-stat-label">Speed:</span>
                <span id="speedLabel" class="hud-stat-value">0 km/h</span>
            </div>

            <div class="hud-row">
                <span class="hud-stat-label">Flips:</span>
                <span id="flipLabel" class="hud-stat-value">0</span>

                <span class="hud-stat-label">Distance:</span>
                <span id="distanceLabel" class="hud-stat-value">0 m</span>

                <span class="hud-stat-label">Best:</span>
                <span id="bestDistanceLabel" class="hud-stat-value">0 m</span>
            </div>
        </div>

        <div id="hud-controls">
            <div class="hud-controls-group">
                <span class="hud-controls-label">Brand:</span>
                <button class="hud-btn" data-bike="xk">Kawasaki XK</button>
                <button class="hud-btn" data-bike="rc">KTM RC</button>
                <button class="hud-btn" data-bike="ym">Yamaha YM</button>
            </div>

            <div class="hud-controls-group">
                <span class="hud-controls-label">Stroke:</span>
                <button class="hud-btn" data-stroke="2">2‑Stroke</button>
                <button class="hud-btn" data-stroke="4">4‑Stroke</button>
            </div>

            <div class="hud-controls-group">
                <span class="hud-controls-label">Level:</span>
                <select id="levelSelect" class="hud-select">
                    <option value="0">Hills 1</option>
                    <option value="1">Hills 2</option>
                    <option value="2">Big Jumps</option>
                    <option value="3">Whoops</option>
                    <option value="4">Steep Climb</option>
                    <option value="5">MX Track</option>
                    <option value="6">Sand Dunes</option>
                    <option value="7">Night Ride</option>
                    <option value="8">Rocky Climb</option>
                    <option value="9">Mega Hill</option>
                </select>
            </div>
        </div>

        <div id="hud-help">
            <div class="hud-help-row">
                <span class="hud-help-key">Up</span> = Throttle
                <span class="hud-help-sep">•</span>
                <span class="hud-help-key">Down</span> = Brake
                <span class="hud-help-sep">•</span>
                <span class="hud-help-key">Left / Right</span> = Tilt
                <span class="hud-help-sep">•</span>
                <span class="hud-help-key">Space</span> = Restart
            </div>
            <div class="hud-help-row">
                Land wheels‑first or you crash. Full 360° = flip. Go as far as you can.
            </div>
        </div>
    </div>

    <!-- PAUSE / OVERLAY PANEL -->
    <div id="overlay" class="hidden">
        <div id="overlay-panel">
            <h2 id="overlay-title">Paused</h2>
            <p id="overlay-message">
                Press <strong>Space</strong> to restart or <strong>Esc</strong> to resume.
            </p>
            <div id="overlay-stats">
                <div class="overlay-stat-row">
                    <span class="overlay-stat-label">Level:</span>
                    <span id="overlay-level-name" class="overlay-stat-value">Hills 1</span>
                </div>
                <div class="overlay-stat-row">
                    <span class="overlay-stat-label">Distance:</span>
                    <span id="overlay-distance" class="overlay-stat-value">0 m</span>
                </div>
                <div class="overlay-stat-row">
                    <span class="overlay-stat-label">Flips:</span>
                    <span id="overlay-flips" class="overlay-stat-value">0</span>
                </div>
                <div class="overlay-stat-row">
                    <span class="overlay-stat-label">Best Distance:</span>
                    <span id="overlay-best-distance" class="overlay-stat-value">0 m</span>
                </div>
            </div>
            <div id="overlay-buttons">
                <button id="overlay-restart" class="hud-btn">Restart Level</button>
                <button id="overlay-resume" class="hud-btn">Resume Ride</button>
            </div>
        </div>
    </div>

    <!-- CANVAS -->
    <canvas id="gameCanvas" width="1100" height="550"></canvas>

    <!-- SCRIPT -->
    <script src="game.js"></script>
</body>
</html>
