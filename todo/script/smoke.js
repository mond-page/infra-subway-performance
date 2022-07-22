import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

export let options = {
    vus: 1, // 1 user looping for 1 minute
    duration: '1m',

    thresholds: {
        http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    },
};

const BASE_URL = 'https://subway.mond.page';
const USERNAME = 'mond@mond.com';
const PASSWORD = 'mond';

export default function ()  {

    main();

    let jwt = login(USERNAME, PASSWORD);

    findPath(jwt, 1, 2);

};

function main() {
    let response = http.get(`${BASE_URL}`)
    check(response, {'access successfully': (res) => res.status === 200})
}

function login(email, password) {
    let payload = JSON.stringify({
        email: email,
        password: password,
    });
    let params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    let response = http.post(`${BASE_URL}/login/token`, payload, params);
    check(response, {'logged in successfully': (res) => res.json('accessToken') !== ''});

    return response.json('accessToken');
}

function findPath(jwt, sourceId, targetId) {
    let authHeaders = {
        headers: {
            Authorization: `Bearer ${jwt}`,
        }
    };
    let response = http.get(`${BASE_URL}/paths?source=${sourceId}&target=${targetId}`, authHeaders);
    check(response, {'find path successfully': (res) => res.status === 200});
}
