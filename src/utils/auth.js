const tokenKey = 'vuetify-token';

export function getToken() {
    return localStorage.getItem(tokenKey);
}

export function setToken(token) {
    localStorage.setItem(tokenKey, token);
}

export function removeToken() {
    localStorage.removeItem(tokenKey);
}

export function getTokenKey() {
    return tokenKey;
}