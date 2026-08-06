const GOOGLE_MAPS_EMBED_URL = "https://www.google.com/maps/embed/v1/place";
const GOOGLE_STREET_VIEW_URL = "https://maps.googleapis.com/maps/api/streetview";

export function getGoogleMapsEmbedUrl(lat, lon, apiKey) {
    if (!apiKey) return null;
    return `${GOOGLE_MAPS_EMBED_URL}?key=${apiKey}&q=${lat},${lon}&zoom=15`;
}

export function getGoogleStreetViewUrl(lat, lon, apiKey) {
    if (!apiKey) return null;
    return `${GOOGLE_STREET_VIEW_URL}?size=600x300&location=${lat},${lon}&key=${apiKey}&fov=90`;
}

export function getOpenStreetMapEmbedUrl(lat, lon) {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}`;
}

export function getGoogleMapsLink(lat, lon) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}
