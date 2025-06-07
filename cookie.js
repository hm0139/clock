class Cookie {
  /**
   * Cookieの設定
   * @param {String} key
   * @param {String | Number} value
   * @param {Date} [expires = null]
   */
  static set(key, value, expires = null) {
    document.cookie = key + "=" + value + (expires != null ? ";expires=" + expires.toUTCString() : "");
  }

  /**
   * Cookieの設定
   * @param {String} key Cookieのキー
   * @returns {String | null} 対応するキーの値
   */
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
