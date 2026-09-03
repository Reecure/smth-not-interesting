import * as signalR from '@microsoft/signalr'

const BASE_URL = 'https://smth-not-interesting-back.onrender.com'

export function createHub() {
    return new signalR.HubConnectionBuilder()
        .withUrl(`${BASE_URL}/hub/shake`, {
            headers: { 'bypass-tunnel-reminder': 'true' }
        })
        .withAutomaticReconnect([0, 1000, 3000, 5000])
        .configureLogging(signalR.LogLevel.Warning)
        .build()
}