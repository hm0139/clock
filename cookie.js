class Cookie {
  static set(key, value, expires = null) {
    document.cookie = key + "=" + value + (expires != null ? ";expires=" + expires.toUTCString() : "");
  }

  static get(key) {
    if (document.cookie == "") {
      return null;
    }
    const cookies = document.cookie.split(/; ?/).map((c) => c.split("="));
    for (const [cKey, value] of cookies) {
      if (cKey == key) {
        return value;
      }
    }
    return null;
  }
}

export default Cookie;
