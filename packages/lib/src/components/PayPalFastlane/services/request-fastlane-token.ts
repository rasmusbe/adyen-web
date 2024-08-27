import { httpPost } from '../../../core/Services/http';

export interface FastlaneTokenData {
    id: string;
    clientId: string;
    value: string;
    expiresAt: string;
}

function requestFastlaneToken(url: string, clientKey: string): Promise<FastlaneTokenData> {
    const path = `utility/v1/payPalFastlane/tokens?clientKey=${clientKey}`;

    return Promise.resolve({
        id: '8f927867-48f7-43a8-b808-c776cd30755a',
        clientId: 'AXy9hIzWB6h_LjZUHjHmsbsiicSIbL4GKOrcgomEedVjduUinIU4C2llxkW5p0OG0zTNgviYFceaXEnj',
        value: 'eyJraWQiOiJkMTA2ZTUwNjkzOWYxMWVlYjlkMTAyNDJhYzEyMDAwMiIsInR5cCI6IkpXVCIsImFsZyI6IkVTMjU2In0.eyJpc3MiOiJodHRwczovL2FwaS5zYW5kYm94LnBheXBhbC5jb20iLCJhdWQiOlsiaHR0cHM6Ly9hcGkuYnJhaW50cmVlZ2F0ZXdheS5jb20iLCJleGFtcGxlLmNvbSJdLCJzdWIiOiJNNlROQUVTWjVGR05OIiwiYWNyIjpbImNsaWVudCJdLCJzY29wZSI6WyJCcmFpbnRyZWU6VmF1bHQiXSwib3B0aW9ucyI6e30sImF6IjoiY2NnMTguc2xjIiwiZXh0ZXJuYWxfaWQiOlsiUGF5UGFsOk02VE5BRVNaNUZHTk4iLCJCcmFpbnRyZWU6eDR6Nmp3bjhqcmd0NnNxayJdLCJleHAiOjE3MjQ3NTI4MDYsImlhdCI6MTcyNDc1MTkwNiwianRpIjoiVTJBQUthNldjOXBCZnZIRjBGdzhiNkY3dHpmUzJxWkw0WGEwR2s1bWlzejk3VktyQWVyTXRmMEROYktqLUVSS2Q2amx3bV9FWWk2Sm80V2xDdEFZZEFDVlhUU3pjT3hNUDlUcFR4cGJMLU8xWWdoZHk4d2g4bWdubTVPTmtIM1EifQ.HfxOHCHrUu3Oe0CXx1icyYaA4aQrZOn8cGGtTxAGjRrnFcJtEh7eGy2aJGGPYuuUYzs5weY2EwYpltemVvEoTw',
        expiresAt: '2024-08-19T22:19:25.705+00:00'
    });
    // return httpPost<FastlaneTokenData>({ loadingContext: url, path, errorLevel: 'fatal' });
}

export default requestFastlaneToken;
