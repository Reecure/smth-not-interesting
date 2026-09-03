import * as signalR from '@microsoft/signalr'

const BASE_URL = 'https://smth-not-interesting-back.onrender.com'

export function createHub() {
    return new signalR.HubConnectionBuilder()
        .withUrl(`${BASE_URL}/hub/shake`, {
            transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect([0, 1000, 3000, 5000])
        .configureLogging(signalR.LogLevel.Debug)
        .build()
}