// "balance": 0,
//     "lastName": "Kuz",
//     "userId": "5246112454",
//     "createdAt": "2024-12-22T14:42:14.868Z",
//     "languageCode": "en",
//     "username": "vitkuzzz",
//     "filters": [
//     {
//         "domainFilter": null,
//         "id": "74c7d3c8-599f-47f8-824b-bef55cb9bd78",
//         "showLiked": false,
//         "timeFilter": null,
//         "searchQuery": "Driver"
//     }
// ],
//     "firstName": "Vit"

export interface UserProfile {
    userId: string;
    firstName: string;
    lastName?: string;
    balance: number;
    createdAt: string;
    filters: any[]
}

export interface AuthLinkParams {
    userId: string;
    secret: string;
}