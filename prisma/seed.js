"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// prisma/seed.ts
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import_client = require("@prisma/client");

// node_modules/bcryptjs/index.js
var import_crypto = __toESM(require("crypto"), 1);
var randomFallback = null;
function randomBytes(len) {
  try {
    return crypto.getRandomValues(new Uint8Array(len));
  } catch {
  }
  try {
    return import_crypto.default.randomBytes(len);
  } catch {
  }
  if (!randomFallback) {
    throw Error(
      "Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative"
    );
  }
  return randomFallback(len);
}
function setRandomFallback(random) {
  randomFallback = random;
}
function genSaltSync(rounds, seed_length) {
  rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof rounds !== "number")
    throw Error(
      "Illegal arguments: " + typeof rounds + ", " + typeof seed_length
    );
  if (rounds < 4) rounds = 4;
  else if (rounds > 31) rounds = 31;
  var salt = [];
  salt.push("$2b$");
  if (rounds < 10) salt.push("0");
  salt.push(rounds.toString());
  salt.push("$");
  salt.push(base64_encode(randomBytes(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN));
  return salt.join("");
}
function genSalt(rounds, seed_length, callback) {
  if (typeof seed_length === "function")
    callback = seed_length, seed_length = void 0;
  if (typeof rounds === "function") callback = rounds, rounds = void 0;
  if (typeof rounds === "undefined") rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
  else if (typeof rounds !== "number")
    throw Error("illegal arguments: " + typeof rounds);
  function _async(callback2) {
    nextTick(function() {
      try {
        callback2(null, genSaltSync(rounds));
      } catch (err) {
        callback2(err);
      }
    });
  }
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
function hashSync(password, salt) {
  if (typeof salt === "undefined") salt = GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof salt === "number") salt = genSaltSync(salt);
  if (typeof password !== "string" || typeof salt !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof salt);
  return _hash(password, salt);
}
function hash(password, salt, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password === "string" && typeof salt === "number")
      genSalt(salt, function(err, salt2) {
        _hash(password, salt2, callback2, progressCallback);
      });
    else if (typeof password === "string" && typeof salt === "string")
      _hash(password, salt, callback2, progressCallback);
    else
      nextTick(
        callback2.bind(
          this,
          Error("Illegal arguments: " + typeof password + ", " + typeof salt)
        )
      );
  }
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
function safeStringCompare(known, unknown) {
  var diff = known.length ^ unknown.length;
  for (var i = 0; i < known.length; ++i) {
    diff |= known.charCodeAt(i) ^ unknown.charCodeAt(i);
  }
  return diff === 0;
}
function compareSync(password, hash2) {
  if (typeof password !== "string" || typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof hash2);
  if (hash2.length !== 60) return false;
  return safeStringCompare(
    hashSync(password, hash2.substring(0, hash2.length - 31)),
    hash2
  );
}
function compare(password, hashValue, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password !== "string" || typeof hashValue !== "string") {
      nextTick(
        callback2.bind(
          this,
          Error(
            "Illegal arguments: " + typeof password + ", " + typeof hashValue
          )
        )
      );
      return;
    }
    if (hashValue.length !== 60) {
      nextTick(callback2.bind(this, null, false));
      return;
    }
    hash(
      password,
      hashValue.substring(0, 29),
      function(err, comp) {
        if (err) callback2(err);
        else callback2(null, safeStringCompare(comp, hashValue));
      },
      progressCallback
    );
  }
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
function getRounds(hash2) {
  if (typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof hash2);
  return parseInt(hash2.split("$")[2], 10);
}
function getSalt(hash2) {
  if (typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof hash2);
  if (hash2.length !== 60)
    throw Error("Illegal hash length: " + hash2.length + " != 60");
  return hash2.substring(0, 29);
}
function truncates(password) {
  if (typeof password !== "string")
    throw Error("Illegal arguments: " + typeof password);
  return utf8Length(password) > 72;
}
var nextTick = typeof setImmediate === "function" ? setImmediate : typeof scheduler === "object" && typeof scheduler.postTask === "function" ? scheduler.postTask.bind(scheduler) : setTimeout;
function utf8Length(string) {
  var len = 0, c = 0;
  for (var i = 0; i < string.length; ++i) {
    c = string.charCodeAt(i);
    if (c < 128) len += 1;
    else if (c < 2048) len += 2;
    else if ((c & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
      ++i;
      len += 4;
    } else len += 3;
  }
  return len;
}
function utf8Array(string) {
  var offset = 0, c1, c2;
  var buffer = new Array(utf8Length(string));
  for (var i = 0, k = string.length; i < k; ++i) {
    c1 = string.charCodeAt(i);
    if (c1 < 128) {
      buffer[offset++] = c1;
    } else if (c1 < 2048) {
      buffer[offset++] = c1 >> 6 | 192;
      buffer[offset++] = c1 & 63 | 128;
    } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
      c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
      ++i;
      buffer[offset++] = c1 >> 18 | 240;
      buffer[offset++] = c1 >> 12 & 63 | 128;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    } else {
      buffer[offset++] = c1 >> 12 | 224;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    }
  }
  return buffer;
}
var BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
var BASE64_INDEX = [
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  0,
  1,
  54,
  55,
  56,
  57,
  58,
  59,
  60,
  61,
  62,
  63,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51,
  52,
  53,
  -1,
  -1,
  -1,
  -1,
  -1
];
function base64_encode(b, len) {
  var off = 0, rs = [], c1, c2;
  if (len <= 0 || len > b.length) throw Error("Illegal len: " + len);
  while (off < len) {
    c1 = b[off++] & 255;
    rs.push(BASE64_CODE[c1 >> 2 & 63]);
    c1 = (c1 & 3) << 4;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 4 & 15;
    rs.push(BASE64_CODE[c1 & 63]);
    c1 = (c2 & 15) << 2;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 6 & 3;
    rs.push(BASE64_CODE[c1 & 63]);
    rs.push(BASE64_CODE[c2 & 63]);
  }
  return rs.join("");
}
function base64_decode(s, len) {
  var off = 0, slen = s.length, olen = 0, rs = [], c1, c2, c3, c4, o, code;
  if (len <= 0) throw Error("Illegal len: " + len);
  while (off < slen - 1 && olen < len) {
    code = s.charCodeAt(off++);
    c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    code = s.charCodeAt(off++);
    c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c1 == -1 || c2 == -1) break;
    o = c1 << 2 >>> 0;
    o |= (c2 & 48) >> 4;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c3 == -1) break;
    o = (c2 & 15) << 4 >>> 0;
    o |= (c3 & 60) >> 2;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    o = (c3 & 3) << 6 >>> 0;
    o |= c4;
    rs.push(String.fromCharCode(o));
    ++olen;
  }
  var res = [];
  for (off = 0; off < olen; off++) res.push(rs[off].charCodeAt(0));
  return res;
}
var BCRYPT_SALT_LEN = 16;
var GENSALT_DEFAULT_LOG2_ROUNDS = 10;
var BLOWFISH_NUM_ROUNDS = 16;
var MAX_EXECUTION_TIME = 100;
var P_ORIG = [
  608135816,
  2242054355,
  320440878,
  57701188,
  2752067618,
  698298832,
  137296536,
  3964562569,
  1160258022,
  953160567,
  3193202383,
  887688300,
  3232508343,
  3380367581,
  1065670069,
  3041331479,
  2450970073,
  2306472731
];
var S_ORIG = [
  3509652390,
  2564797868,
  805139163,
  3491422135,
  3101798381,
  1780907670,
  3128725573,
  4046225305,
  614570311,
  3012652279,
  134345442,
  2240740374,
  1667834072,
  1901547113,
  2757295779,
  4103290238,
  227898511,
  1921955416,
  1904987480,
  2182433518,
  2069144605,
  3260701109,
  2620446009,
  720527379,
  3318853667,
  677414384,
  3393288472,
  3101374703,
  2390351024,
  1614419982,
  1822297739,
  2954791486,
  3608508353,
  3174124327,
  2024746970,
  1432378464,
  3864339955,
  2857741204,
  1464375394,
  1676153920,
  1439316330,
  715854006,
  3033291828,
  289532110,
  2706671279,
  2087905683,
  3018724369,
  1668267050,
  732546397,
  1947742710,
  3462151702,
  2609353502,
  2950085171,
  1814351708,
  2050118529,
  680887927,
  999245976,
  1800124847,
  3300911131,
  1713906067,
  1641548236,
  4213287313,
  1216130144,
  1575780402,
  4018429277,
  3917837745,
  3693486850,
  3949271944,
  596196993,
  3549867205,
  258830323,
  2213823033,
  772490370,
  2760122372,
  1774776394,
  2652871518,
  566650946,
  4142492826,
  1728879713,
  2882767088,
  1783734482,
  3629395816,
  2517608232,
  2874225571,
  1861159788,
  326777828,
  3124490320,
  2130389656,
  2716951837,
  967770486,
  1724537150,
  2185432712,
  2364442137,
  1164943284,
  2105845187,
  998989502,
  3765401048,
  2244026483,
  1075463327,
  1455516326,
  1322494562,
  910128902,
  469688178,
  1117454909,
  936433444,
  3490320968,
  3675253459,
  1240580251,
  122909385,
  2157517691,
  634681816,
  4142456567,
  3825094682,
  3061402683,
  2540495037,
  79693498,
  3249098678,
  1084186820,
  1583128258,
  426386531,
  1761308591,
  1047286709,
  322548459,
  995290223,
  1845252383,
  2603652396,
  3431023940,
  2942221577,
  3202600964,
  3727903485,
  1712269319,
  422464435,
  3234572375,
  1170764815,
  3523960633,
  3117677531,
  1434042557,
  442511882,
  3600875718,
  1076654713,
  1738483198,
  4213154764,
  2393238008,
  3677496056,
  1014306527,
  4251020053,
  793779912,
  2902807211,
  842905082,
  4246964064,
  1395751752,
  1040244610,
  2656851899,
  3396308128,
  445077038,
  3742853595,
  3577915638,
  679411651,
  2892444358,
  2354009459,
  1767581616,
  3150600392,
  3791627101,
  3102740896,
  284835224,
  4246832056,
  1258075500,
  768725851,
  2589189241,
  3069724005,
  3532540348,
  1274779536,
  3789419226,
  2764799539,
  1660621633,
  3471099624,
  4011903706,
  913787905,
  3497959166,
  737222580,
  2514213453,
  2928710040,
  3937242737,
  1804850592,
  3499020752,
  2949064160,
  2386320175,
  2390070455,
  2415321851,
  4061277028,
  2290661394,
  2416832540,
  1336762016,
  1754252060,
  3520065937,
  3014181293,
  791618072,
  3188594551,
  3933548030,
  2332172193,
  3852520463,
  3043980520,
  413987798,
  3465142937,
  3030929376,
  4245938359,
  2093235073,
  3534596313,
  375366246,
  2157278981,
  2479649556,
  555357303,
  3870105701,
  2008414854,
  3344188149,
  4221384143,
  3956125452,
  2067696032,
  3594591187,
  2921233993,
  2428461,
  544322398,
  577241275,
  1471733935,
  610547355,
  4027169054,
  1432588573,
  1507829418,
  2025931657,
  3646575487,
  545086370,
  48609733,
  2200306550,
  1653985193,
  298326376,
  1316178497,
  3007786442,
  2064951626,
  458293330,
  2589141269,
  3591329599,
  3164325604,
  727753846,
  2179363840,
  146436021,
  1461446943,
  4069977195,
  705550613,
  3059967265,
  3887724982,
  4281599278,
  3313849956,
  1404054877,
  2845806497,
  146425753,
  1854211946,
  1266315497,
  3048417604,
  3681880366,
  3289982499,
  290971e4,
  1235738493,
  2632868024,
  2414719590,
  3970600049,
  1771706367,
  1449415276,
  3266420449,
  422970021,
  1963543593,
  2690192192,
  3826793022,
  1062508698,
  1531092325,
  1804592342,
  2583117782,
  2714934279,
  4024971509,
  1294809318,
  4028980673,
  1289560198,
  2221992742,
  1669523910,
  35572830,
  157838143,
  1052438473,
  1016535060,
  1802137761,
  1753167236,
  1386275462,
  3080475397,
  2857371447,
  1040679964,
  2145300060,
  2390574316,
  1461121720,
  2956646967,
  4031777805,
  4028374788,
  33600511,
  2920084762,
  1018524850,
  629373528,
  3691585981,
  3515945977,
  2091462646,
  2486323059,
  586499841,
  988145025,
  935516892,
  3367335476,
  2599673255,
  2839830854,
  265290510,
  3972581182,
  2759138881,
  3795373465,
  1005194799,
  847297441,
  406762289,
  1314163512,
  1332590856,
  1866599683,
  4127851711,
  750260880,
  613907577,
  1450815602,
  3165620655,
  3734664991,
  3650291728,
  3012275730,
  3704569646,
  1427272223,
  778793252,
  1343938022,
  2676280711,
  2052605720,
  1946737175,
  3164576444,
  3914038668,
  3967478842,
  3682934266,
  1661551462,
  3294938066,
  4011595847,
  840292616,
  3712170807,
  616741398,
  312560963,
  711312465,
  1351876610,
  322626781,
  1910503582,
  271666773,
  2175563734,
  1594956187,
  70604529,
  3617834859,
  1007753275,
  1495573769,
  4069517037,
  2549218298,
  2663038764,
  504708206,
  2263041392,
  3941167025,
  2249088522,
  1514023603,
  1998579484,
  1312622330,
  694541497,
  2582060303,
  2151582166,
  1382467621,
  776784248,
  2618340202,
  3323268794,
  2497899128,
  2784771155,
  503983604,
  4076293799,
  907881277,
  423175695,
  432175456,
  1378068232,
  4145222326,
  3954048622,
  3938656102,
  3820766613,
  2793130115,
  2977904593,
  26017576,
  3274890735,
  3194772133,
  1700274565,
  1756076034,
  4006520079,
  3677328699,
  720338349,
  1533947780,
  354530856,
  688349552,
  3973924725,
  1637815568,
  332179504,
  3949051286,
  53804574,
  2852348879,
  3044236432,
  1282449977,
  3583942155,
  3416972820,
  4006381244,
  1617046695,
  2628476075,
  3002303598,
  1686838959,
  431878346,
  2686675385,
  1700445008,
  1080580658,
  1009431731,
  832498133,
  3223435511,
  2605976345,
  2271191193,
  2516031870,
  1648197032,
  4164389018,
  2548247927,
  300782431,
  375919233,
  238389289,
  3353747414,
  2531188641,
  2019080857,
  1475708069,
  455242339,
  2609103871,
  448939670,
  3451063019,
  1395535956,
  2413381860,
  1841049896,
  1491858159,
  885456874,
  4264095073,
  4001119347,
  1565136089,
  3898914787,
  1108368660,
  540939232,
  1173283510,
  2745871338,
  3681308437,
  4207628240,
  3343053890,
  4016749493,
  1699691293,
  1103962373,
  3625875870,
  2256883143,
  3830138730,
  1031889488,
  3479347698,
  1535977030,
  4236805024,
  3251091107,
  2132092099,
  1774941330,
  1199868427,
  1452454533,
  157007616,
  2904115357,
  342012276,
  595725824,
  1480756522,
  206960106,
  497939518,
  591360097,
  863170706,
  2375253569,
  3596610801,
  1814182875,
  2094937945,
  3421402208,
  1082520231,
  3463918190,
  2785509508,
  435703966,
  3908032597,
  1641649973,
  2842273706,
  3305899714,
  1510255612,
  2148256476,
  2655287854,
  3276092548,
  4258621189,
  236887753,
  3681803219,
  274041037,
  1734335097,
  3815195456,
  3317970021,
  1899903192,
  1026095262,
  4050517792,
  356393447,
  2410691914,
  3873677099,
  3682840055,
  3913112168,
  2491498743,
  4132185628,
  2489919796,
  1091903735,
  1979897079,
  3170134830,
  3567386728,
  3557303409,
  857797738,
  1136121015,
  1342202287,
  507115054,
  2535736646,
  337727348,
  3213592640,
  1301675037,
  2528481711,
  1895095763,
  1721773893,
  3216771564,
  62756741,
  2142006736,
  835421444,
  2531993523,
  1442658625,
  3659876326,
  2882144922,
  676362277,
  1392781812,
  170690266,
  3921047035,
  1759253602,
  3611846912,
  1745797284,
  664899054,
  1329594018,
  3901205900,
  3045908486,
  2062866102,
  2865634940,
  3543621612,
  3464012697,
  1080764994,
  553557557,
  3656615353,
  3996768171,
  991055499,
  499776247,
  1265440854,
  648242737,
  3940784050,
  980351604,
  3713745714,
  1749149687,
  3396870395,
  4211799374,
  3640570775,
  1161844396,
  3125318951,
  1431517754,
  545492359,
  4268468663,
  3499529547,
  1437099964,
  2702547544,
  3433638243,
  2581715763,
  2787789398,
  1060185593,
  1593081372,
  2418618748,
  4260947970,
  69676912,
  2159744348,
  86519011,
  2512459080,
  3838209314,
  1220612927,
  3339683548,
  133810670,
  1090789135,
  1078426020,
  1569222167,
  845107691,
  3583754449,
  4072456591,
  1091646820,
  628848692,
  1613405280,
  3757631651,
  526609435,
  236106946,
  48312990,
  2942717905,
  3402727701,
  1797494240,
  859738849,
  992217954,
  4005476642,
  2243076622,
  3870952857,
  3732016268,
  765654824,
  3490871365,
  2511836413,
  1685915746,
  3888969200,
  1414112111,
  2273134842,
  3281911079,
  4080962846,
  172450625,
  2569994100,
  980381355,
  4109958455,
  2819808352,
  2716589560,
  2568741196,
  3681446669,
  3329971472,
  1835478071,
  660984891,
  3704678404,
  4045999559,
  3422617507,
  3040415634,
  1762651403,
  1719377915,
  3470491036,
  2693910283,
  3642056355,
  3138596744,
  1364962596,
  2073328063,
  1983633131,
  926494387,
  3423689081,
  2150032023,
  4096667949,
  1749200295,
  3328846651,
  309677260,
  2016342300,
  1779581495,
  3079819751,
  111262694,
  1274766160,
  443224088,
  298511866,
  1025883608,
  3806446537,
  1145181785,
  168956806,
  3641502830,
  3584813610,
  1689216846,
  3666258015,
  3200248200,
  1692713982,
  2646376535,
  4042768518,
  1618508792,
  1610833997,
  3523052358,
  4130873264,
  2001055236,
  3610705100,
  2202168115,
  4028541809,
  2961195399,
  1006657119,
  2006996926,
  3186142756,
  1430667929,
  3210227297,
  1314452623,
  4074634658,
  4101304120,
  2273951170,
  1399257539,
  3367210612,
  3027628629,
  1190975929,
  2062231137,
  2333990788,
  2221543033,
  2438960610,
  1181637006,
  548689776,
  2362791313,
  3372408396,
  3104550113,
  3145860560,
  296247880,
  1970579870,
  3078560182,
  3769228297,
  1714227617,
  3291629107,
  3898220290,
  166772364,
  1251581989,
  493813264,
  448347421,
  195405023,
  2709975567,
  677966185,
  3703036547,
  1463355134,
  2715995803,
  1338867538,
  1343315457,
  2802222074,
  2684532164,
  233230375,
  2599980071,
  2000651841,
  3277868038,
  1638401717,
  4028070440,
  3237316320,
  6314154,
  819756386,
  300326615,
  590932579,
  1405279636,
  3267499572,
  3150704214,
  2428286686,
  3959192993,
  3461946742,
  1862657033,
  1266418056,
  963775037,
  2089974820,
  2263052895,
  1917689273,
  448879540,
  3550394620,
  3981727096,
  150775221,
  3627908307,
  1303187396,
  508620638,
  2975983352,
  2726630617,
  1817252668,
  1876281319,
  1457606340,
  908771278,
  3720792119,
  3617206836,
  2455994898,
  1729034894,
  1080033504,
  976866871,
  3556439503,
  2881648439,
  1522871579,
  1555064734,
  1336096578,
  3548522304,
  2579274686,
  3574697629,
  3205460757,
  3593280638,
  3338716283,
  3079412587,
  564236357,
  2993598910,
  1781952180,
  1464380207,
  3163844217,
  3332601554,
  1699332808,
  1393555694,
  1183702653,
  3581086237,
  1288719814,
  691649499,
  2847557200,
  2895455976,
  3193889540,
  2717570544,
  1781354906,
  1676643554,
  2592534050,
  3230253752,
  1126444790,
  2770207658,
  2633158820,
  2210423226,
  2615765581,
  2414155088,
  3127139286,
  673620729,
  2805611233,
  1269405062,
  4015350505,
  3341807571,
  4149409754,
  1057255273,
  2012875353,
  2162469141,
  2276492801,
  2601117357,
  993977747,
  3918593370,
  2654263191,
  753973209,
  36408145,
  2530585658,
  25011837,
  3520020182,
  2088578344,
  530523599,
  2918365339,
  1524020338,
  1518925132,
  3760827505,
  3759777254,
  1202760957,
  3985898139,
  3906192525,
  674977740,
  4174734889,
  2031300136,
  2019492241,
  3983892565,
  4153806404,
  3822280332,
  352677332,
  2297720250,
  60907813,
  90501309,
  3286998549,
  1016092578,
  2535922412,
  2839152426,
  457141659,
  509813237,
  4120667899,
  652014361,
  1966332200,
  2975202805,
  55981186,
  2327461051,
  676427537,
  3255491064,
  2882294119,
  3433927263,
  1307055953,
  942726286,
  933058658,
  2468411793,
  3933900994,
  4215176142,
  1361170020,
  2001714738,
  2830558078,
  3274259782,
  1222529897,
  1679025792,
  2729314320,
  3714953764,
  1770335741,
  151462246,
  3013232138,
  1682292957,
  1483529935,
  471910574,
  1539241949,
  458788160,
  3436315007,
  1807016891,
  3718408830,
  978976581,
  1043663428,
  3165965781,
  1927990952,
  4200891579,
  2372276910,
  3208408903,
  3533431907,
  1412390302,
  2931980059,
  4132332400,
  1947078029,
  3881505623,
  4168226417,
  2941484381,
  1077988104,
  1320477388,
  886195818,
  18198404,
  3786409e3,
  2509781533,
  112762804,
  3463356488,
  1866414978,
  891333506,
  18488651,
  661792760,
  1628790961,
  3885187036,
  3141171499,
  876946877,
  2693282273,
  1372485963,
  791857591,
  2686433993,
  3759982718,
  3167212022,
  3472953795,
  2716379847,
  445679433,
  3561995674,
  3504004811,
  3574258232,
  54117162,
  3331405415,
  2381918588,
  3769707343,
  4154350007,
  1140177722,
  4074052095,
  668550556,
  3214352940,
  367459370,
  261225585,
  2610173221,
  4209349473,
  3468074219,
  3265815641,
  314222801,
  3066103646,
  3808782860,
  282218597,
  3406013506,
  3773591054,
  379116347,
  1285071038,
  846784868,
  2669647154,
  3771962079,
  3550491691,
  2305946142,
  453669953,
  1268987020,
  3317592352,
  3279303384,
  3744833421,
  2610507566,
  3859509063,
  266596637,
  3847019092,
  517658769,
  3462560207,
  3443424879,
  370717030,
  4247526661,
  2224018117,
  4143653529,
  4112773975,
  2788324899,
  2477274417,
  1456262402,
  2901442914,
  1517677493,
  1846949527,
  2295493580,
  3734397586,
  2176403920,
  1280348187,
  1908823572,
  3871786941,
  846861322,
  1172426758,
  3287448474,
  3383383037,
  1655181056,
  3139813346,
  901632758,
  1897031941,
  2986607138,
  3066810236,
  3447102507,
  1393639104,
  373351379,
  950779232,
  625454576,
  3124240540,
  4148612726,
  2007998917,
  544563296,
  2244738638,
  2330496472,
  2058025392,
  1291430526,
  424198748,
  50039436,
  29584100,
  3605783033,
  2429876329,
  2791104160,
  1057563949,
  3255363231,
  3075367218,
  3463963227,
  1469046755,
  985887462
];
var C_ORIG = [
  1332899944,
  1700884034,
  1701343084,
  1684370003,
  1668446532,
  1869963892
];
function _encipher(lr, off, P, S) {
  var n, l = lr[off], r = lr[off + 1];
  l ^= P[0];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[1];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[2];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[3];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[4];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[5];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[6];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[7];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[8];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[9];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[10];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[11];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[12];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[13];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[14];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[15];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[16];
  lr[off] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
  lr[off + 1] = l;
  return lr;
}
function _streamtoword(data, offp) {
  for (var i = 0, word = 0; i < 4; ++i)
    word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
  return { key: word, offp };
}
function _key(key, P, S) {
  var offset = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offset), offset = sw.offp, P[i] = P[i] ^ sw.key;
  for (i = 0; i < plen; i += 2)
    lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
function _ekskey(data, key, P, S) {
  var offp = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offp), offp = sw.offp, P[i] = P[i] ^ sw.key;
  offp = 0;
  for (i = 0; i < plen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
function _crypt(b, salt, rounds, callback, progressCallback) {
  var cdata = C_ORIG.slice(), clen = cdata.length, err;
  if (rounds < 4 || rounds > 31) {
    err = Error("Illegal number of rounds (4-31): " + rounds);
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.length !== BCRYPT_SALT_LEN) {
    err = Error(
      "Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN
    );
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  rounds = 1 << rounds >>> 0;
  var P, S, i = 0, j;
  if (typeof Int32Array === "function") {
    P = new Int32Array(P_ORIG);
    S = new Int32Array(S_ORIG);
  } else {
    P = P_ORIG.slice();
    S = S_ORIG.slice();
  }
  _ekskey(salt, b, P, S);
  function next() {
    if (progressCallback) progressCallback(i / rounds);
    if (i < rounds) {
      var start = Date.now();
      for (; i < rounds; ) {
        i = i + 1;
        _key(b, P, S);
        _key(salt, P, S);
        if (Date.now() - start > MAX_EXECUTION_TIME) break;
      }
    } else {
      for (i = 0; i < 64; i++)
        for (j = 0; j < clen >> 1; j++) _encipher(cdata, j << 1, P, S);
      var ret = [];
      for (i = 0; i < clen; i++)
        ret.push((cdata[i] >> 24 & 255) >>> 0), ret.push((cdata[i] >> 16 & 255) >>> 0), ret.push((cdata[i] >> 8 & 255) >>> 0), ret.push((cdata[i] & 255) >>> 0);
      if (callback) {
        callback(null, ret);
        return;
      } else return ret;
    }
    if (callback) nextTick(next);
  }
  if (typeof callback !== "undefined") {
    next();
  } else {
    var res;
    while (true) if (typeof (res = next()) !== "undefined") return res || [];
  }
}
function _hash(password, salt, callback, progressCallback) {
  var err;
  if (typeof password !== "string" || typeof salt !== "string") {
    err = Error("Invalid string / salt: Not a string");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var minor, offset;
  if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
    err = Error("Invalid salt version: " + salt.substring(0, 2));
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.charAt(2) === "$") minor = String.fromCharCode(0), offset = 3;
  else {
    minor = salt.charAt(2);
    if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
      err = Error("Invalid salt revision: " + salt.substring(2, 4));
      if (callback) {
        nextTick(callback.bind(this, err));
        return;
      } else throw err;
    }
    offset = 4;
  }
  if (salt.charAt(offset + 2) > "$") {
    err = Error("Missing salt rounds");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
  password += minor >= "a" ? "\0" : "";
  var passwordb = utf8Array(password), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
  function finish(bytes) {
    var res = [];
    res.push("$2");
    if (minor >= "a") res.push(minor);
    res.push("$");
    if (rounds < 10) res.push("0");
    res.push(rounds.toString());
    res.push("$");
    res.push(base64_encode(saltb, saltb.length));
    res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
    return res.join("");
  }
  if (typeof callback == "undefined")
    return finish(_crypt(passwordb, saltb, rounds));
  else {
    _crypt(
      passwordb,
      saltb,
      rounds,
      function(err2, bytes) {
        if (err2) callback(err2, null);
        else callback(null, finish(bytes));
      },
      progressCallback
    );
  }
}
function encodeBase64(bytes, length) {
  return base64_encode(bytes, length);
}
function decodeBase64(string, length) {
  return base64_decode(string, length);
}
var bcryptjs_default = {
  setRandomFallback,
  genSaltSync,
  genSalt,
  hashSync,
  hash,
  compareSync,
  compare,
  getRounds,
  getSalt,
  truncates,
  encodeBase64,
  decodeBase64
};

// src/lib/seed-data.ts
var INITIAL_CATEGORIES = [
  {
    id: "cat-electronics",
    name: "Electronics & Audio",
    slug: "electronics",
    description: "Next-generation acoustic engineering, flagships, and computing essentials.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    icon: "Headphones",
    productCount: 8,
    isActive: true,
    isFeatured: true,
    order: 1
  },
  {
    id: "cat-fashion",
    name: "Luxury & Apparel",
    slug: "fashion",
    description: "Contemporary tailoring, refined silhouettes, and organic premium fabrics.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    icon: "Shirt",
    productCount: 6,
    isActive: true,
    isFeatured: true,
    order: 2
  },
  {
    id: "cat-footwear",
    name: "Footwear & Sneakers",
    slug: "footwear",
    description: "Ergonomic performance soles, handcrafted leather oxfords, and street classics.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    icon: "Footprints",
    productCount: 5,
    isActive: true,
    isFeatured: true,
    order: 3
  },
  {
    id: "cat-accessories",
    name: "Watches & Accessories",
    slug: "accessories",
    description: "Swiss-inspired horology, minimalist leather goods, and timeless accents.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    icon: "Watch",
    productCount: 6,
    isActive: true,
    isFeatured: true,
    order: 4
  },
  {
    id: "cat-gaming",
    name: "Gaming & Workstation",
    slug: "gaming",
    description: "Ultra-low latency mechanical peripherals, tactile switches, and pro gear.",
    image: "https://images.unsplash.com/photo-1612287233207-640a2a4b868e?w=800&q=80",
    icon: "Gamepad2",
    productCount: 5,
    isActive: true,
    isFeatured: true,
    order: 5
  },
  {
    id: "cat-home",
    name: "Smart Living & Climate",
    slug: "home-appliances",
    description: "Whisper-quiet air circulators, ambient illumination, and automated appliances.",
    image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&q=80",
    icon: "Wind",
    productCount: 4,
    isActive: true,
    isFeatured: true,
    order: 6
  },
  {
    id: "cat-beauty",
    name: "Grooming & Skincare",
    slug: "beauty",
    description: "Botanical clinical formulations, precision grooming tools, and luxury scents.",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80",
    icon: "Sparkles",
    productCount: 4,
    isActive: true,
    isFeatured: true,
    order: 7
  },
  {
    id: "cat-smart-devices",
    name: "Smart Devices & IoT",
    slug: "smart-devices",
    description: "Connected speakers, high-fidelity microphones, and intelligent ecosystem hubs.",
    image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&q=80",
    icon: "Cpu",
    productCount: 4,
    isActive: true,
    isFeatured: true,
    order: 8
  }
];
var INITIAL_BANNERS = [
  {
    id: "banner-1",
    title: "Acoustic Precision Reimagined",
    subtitle: "Nova Pro Wireless Studio Series",
    badge: "NEW FLAGSHIP RELEASE",
    description: "Custom 40mm titanium biocellulose drivers with adaptive ANC and 50-hour battery life.",
    price: 349,
    discount: 50,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&q=85",
    ctaText: "Explore Nova Pro",
    ctaLink: "/product/nova-pro-wireless-headphones",
    isActive: true,
    order: 1
  },
  {
    id: "banner-2",
    title: "Kinetic Ergonomics & Speed",
    subtitle: "Apex Aero Knit Runner 2026",
    badge: "FLASH SALE \u2022 25% OFF",
    description: "Engineered carbon-plate propulsion with breathable dual-zone knit weave for all-day comfort.",
    price: 189,
    discount: 25,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=85",
    ctaText: "Shop Footwear",
    ctaLink: "/product/apex-aero-knit-runner",
    isActive: true,
    order: 2
  },
  {
    id: "banner-3",
    title: "Tactile Perfection For Creators",
    subtitle: "Lumix Mechanical Master 75%",
    badge: "LIMITED EDITION",
    description: "Gasket-mounted acoustic dampening with hot-swappable lubricated switches and CNC aluminum chassis.",
    price: 159,
    discount: 20,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1600&q=85",
    ctaText: "Discover Lumix",
    ctaLink: "/product/lumix-tactile-keyboard-75",
    isActive: true,
    order: 3
  }
];
var INITIAL_PRODUCTS = [
  {
    id: "prod-headphones-1",
    name: "Nova Pro Active Noise-Cancelling Headphones",
    slug: "nova-pro-wireless-headphones",
    brand: "Novasound",
    categoryId: "cat-electronics",
    categoryName: "Electronics & Audio",
    basePrice: 349,
    originalPrice: 399,
    discount: 13,
    stock: 42,
    sku: "NOV-AUD-01",
    shortDescription: "Flagship audiophile wireless headphones featuring hybrid active noise cancellation and spatial soundstage.",
    description: "Engineered for discerning listeners and studio professionals alike, the Nova Pro Wireless combines 40mm custom planar drivers with bespoke memory foam cushions. Seamless multi-device pairing and crystal-clear beamforming microphone arrays ensure peak performance whether mastering audio or taking boardroom calls.",
    features: [
      "Hybrid 4-microphone Active Noise Cancellation (-42dB attenuation)",
      "High-Resolution LDAC and aptX Adaptive wireless codec support",
      "Up to 52 hours of continuous playback with quick charge (15 mins = 6 hours)",
      "Ergonomic aerospace-grade aluminum yoke with soft protein leather headband"
    ],
    specifications: {
      "Driver Size": "40mm Titanium Biomembrane",
      "Frequency Response": "10Hz - 45,000Hz",
      "Bluetooth Version": "Bluetooth 5.4 Low Energy",
      "Battery Life": "52 Hours (ANC off) / 40 Hours (ANC on)",
      "Weight": "254 grams"
    },
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=85",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200&q=85",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&q=85"
    ],
    variants: [
      {
        id: "var-hp-black",
        productId: "prod-headphones-1",
        sku: "NOV-AUD-01-BLK",
        colorName: "Space Black",
        colorHex: "#1E1E24",
        price: 349,
        stock: 24,
        lowStockThreshold: 5,
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=85",
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200&q=85"
        ]
      },
      {
        id: "var-hp-silver",
        productId: "prod-headphones-1",
        sku: "NOV-AUD-01-SLV",
        colorName: "Platinum Silver",
        colorHex: "#D1D5DB",
        price: 349,
        stock: 14,
        lowStockThreshold: 4,
        images: [
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&q=85",
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=85"
        ]
      },
      {
        id: "var-hp-navy",
        productId: "prod-headphones-1",
        sku: "NOV-AUD-01-NVY",
        colorName: "Midnight Navy",
        colorHex: "#1E293B",
        price: 359,
        stock: 4,
        lowStockThreshold: 5,
        images: [
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200&q=85",
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&q=85"
        ]
      }
    ],
    tags: ["Audio", "ANC", "Wireless", "Flagship", "Bluetooth 5.4"],
    rating: 4.9,
    reviewCount: 48,
    salesCount: 142,
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    isPublished: true,
    createdAt: "2026-08-01T10:00:00Z"
  },
  {
    id: "prod-keyboard-1",
    name: "Lumix Mechanical Master 75% Keyboard",
    slug: "lumix-tactile-keyboard-75",
    brand: "Lumix Labs",
    categoryId: "cat-gaming",
    categoryName: "Gaming & Workstation",
    basePrice: 159,
    originalPrice: 199,
    discount: 20,
    stock: 28,
    sku: "LMX-KB-75",
    shortDescription: "Gasket-mounted hot-swappable custom mechanical keyboard with precision rotary encoder and CNC chassis.",
    description: "Experience deep, creamy acoustic feedback crafted through 5 layers of sound-dampening IXPE and poron foam. Equipped with pre-lubricated factory switches and South-facing RGB illumination.",
    features: [
      "Hot-swappable 5-pin PCB compatible with all Cherry-style switches",
      "Tri-mode connectivity: 2.4GHz Ultra-Low Latency, Bluetooth 5.2, USB-C",
      "4000mAh high-density battery providing 3 weeks of RGB-off typing",
      "Programmable tactile brass volume dial and QMK/VIA support"
    ],
    specifications: {
      "Layout": "75% Compact (82 Keys)",
      "Mounting Style": "Gasket Dampened",
      "Switch Type": "Pre-lubricated Tactile Marble 45g",
      "Keycaps": "Double-shot PBT Cherry Profile",
      "Weight": "980g"
    },
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&q=85",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1200&q=85"
    ],
    variants: [
      {
        id: "var-kb-white",
        productId: "prod-keyboard-1",
        sku: "LMX-KB-75-WHT",
        colorName: "Chalk White",
        colorHex: "#F8FAFC",
        price: 159,
        stock: 16,
        lowStockThreshold: 4,
        images: [
          "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&q=85"
        ]
      },
      {
        id: "var-kb-black",
        productId: "prod-keyboard-1",
        sku: "LMX-KB-75-BLK",
        colorName: "Basalt Black",
        colorHex: "#0F172A",
        price: 159,
        stock: 12,
        lowStockThreshold: 3,
        images: [
          "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1200&q=85"
        ]
      }
    ],
    tags: ["Mechanical", "Gasket Mount", "Gaming", "Desk Setup", "RGB"],
    rating: 4.8,
    reviewCount: 36,
    salesCount: 98,
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    isPublished: true,
    createdAt: "2026-08-05T12:00:00Z"
  },
  {
    id: "prod-shoes-1",
    name: "Apex Aero Knit Velocity Runner",
    slug: "apex-aero-knit-runner",
    brand: "Aero Athletics",
    categoryId: "cat-footwear",
    categoryName: "Footwear & Sneakers",
    basePrice: 189,
    originalPrice: 240,
    discount: 21,
    stock: 65,
    sku: "AERO-RUN-01",
    shortDescription: "Featherlight marathon performance running sneaker with dual-density energy rebound foam.",
    description: "Designed for runners seeking velocity without sacrificing joint cushioning. Features an integrated carbon-fiber propulsion shank and breathable dynamic mesh that molds to your instep.",
    features: [
      "Full-length embedded composite carbon propulsion plate",
      "Aerogel micro-cushioning heel cup with 85% energy return",
      "Continental-grade anti-slip rubber traction outsole",
      "Engineered one-piece recycled jacquard knit upper"
    ],
    specifications: {
      "Drop": "8mm Heel-to-Toe",
      "Weight": "210g (Size 9)",
      "Terrain": "Road, Track, Treadmill",
      "Arch Support": "Neutral to Medium"
    },
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=85",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&q=85"
    ],
    variants: [
      {
        id: "var-shoes-red",
        productId: "prod-shoes-1",
        sku: "AERO-RUN-RED-9",
        colorName: "Crimson Volt",
        colorHex: "#DC2626",
        size: "US 9",
        price: 189,
        stock: 22,
        lowStockThreshold: 5,
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=85"
        ]
      },
      {
        id: "var-shoes-black",
        productId: "prod-shoes-1",
        sku: "AERO-RUN-BLK-10",
        colorName: "Stealth Onyx",
        colorHex: "#18181B",
        size: "US 10",
        price: 189,
        stock: 28,
        lowStockThreshold: 6,
        images: [
          "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&q=85"
        ]
      },
      {
        id: "var-shoes-white",
        productId: "prod-shoes-1",
        sku: "AERO-RUN-WHT-95",
        colorName: "Pure Glacier",
        colorHex: "#F1F5F9",
        size: "US 9.5",
        price: 195,
        stock: 15,
        lowStockThreshold: 4,
        images: [
          "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=85"
        ]
      }
    ],
    tags: ["Running", "Carbon Plate", "Sneakers", "Marathon", "Athletics"],
    rating: 4.9,
    reviewCount: 52,
    salesCount: 165,
    isFeatured: true,
    isBestSeller: true,
    isNew: true,
    isPublished: true,
    createdAt: "2026-08-10T14:30:00Z"
  },
  {
    id: "prod-watch-1",
    name: "Vanguard Chronograph Minimalist Watch",
    slug: "vanguard-chronograph-watch",
    brand: "Horology Atelier",
    categoryId: "cat-accessories",
    categoryName: "Watches & Accessories",
    basePrice: 289,
    originalPrice: 350,
    discount: 17,
    stock: 18,
    sku: "HRO-VAN-40",
    shortDescription: "Hand-assembled sapphire crystal chronograph with surgical 316L steel case and Italian calfskin leather.",
    description: "A masterclass in modern horology. The Vanguard features a sunburst dial, subtle 24-hour sub-dials, date aperture, and high-precision Japanese meca-quartz movement with mechanical sweep seconds.",
    features: [
      "Anti-reflective scratch-resistant double-domed sapphire crystal",
      "5 ATM (50 meters) water resistance",
      "Hand-stitched full-grain Italian vegetable tanned leather strap",
      "Luminescent Swiss Super-LumiNova hour hands and markers"
    ],
    specifications: {
      "Case Diameter": "40mm",
      "Case Thickness": "10.5mm",
      "Lug Width": "20mm",
      "Movement": "Seiko VK64 Meca-Quartz Chronograph"
    },
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=85",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200&q=85"
    ],
    variants: [
      {
        id: "var-watch-silver",
        productId: "prod-watch-1",
        sku: "HRO-VAN-SLV-BRN",
        colorName: "Silver & Cognac",
        colorHex: "#94A3B8",
        price: 289,
        stock: 10,
        lowStockThreshold: 3,
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=85"
        ]
      },
      {
        id: "var-watch-black",
        productId: "prod-watch-1",
        sku: "HRO-VAN-BLK-BLK",
        colorName: "Matte Gunmetal",
        colorHex: "#334155",
        price: 299,
        stock: 8,
        lowStockThreshold: 2,
        images: [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200&q=85"
        ]
      }
    ],
    tags: ["Luxury", "Watch", "Chronograph", "Sapphire", "Horology"],
    rating: 4.7,
    reviewCount: 29,
    salesCount: 74,
    isFeatured: true,
    isBestSeller: false,
    isNew: true,
    isPublished: true,
    createdAt: "2026-08-12T09:15:00Z"
  },
  {
    id: "prod-bag-1",
    name: "Atelier Sovereign Leather Briefcase",
    slug: "atelier-sovereign-leather-briefcase",
    brand: "Atelier Maison",
    categoryId: "cat-fashion",
    categoryName: "Luxury & Apparel",
    basePrice: 420,
    originalPrice: 490,
    discount: 14,
    stock: 12,
    sku: "ATL-SOV-BAG",
    shortDescription: "Full-grain Tuscan bridle leather briefcase with padded 16-inch laptop compartment and brass hardware.",
    description: "Meticulously crafted for the modern executive. Built to age gracefully into a rich personal patina, featuring reinforced stress rivets, detachable shoulder strap, and internal organizer for documents, stylus, and tech gear.",
    features: [
      "Certified vegetable-tanned 2.2mm full-grain leather",
      'Dedicated plush micro-suede 16" laptop sleeve',
      "Solid forged antique brass YKK Excella zippers",
      "Luggage trolley pass-through sleeve on reverse side"
    ],
    specifications: {
      "Dimensions": "41cm x 30cm x 9cm",
      "Capacity": "12 Liters",
      "Weight": "1.35 kg",
      "Hardware": "Solid Brass with PVD coating"
    },
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=85",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=85"
    ],
    variants: [
      {
        id: "var-bag-tan",
        productId: "prod-bag-1",
        sku: "ATL-SOV-TAN",
        colorName: "Caramel Tan",
        colorHex: "#92400E",
        price: 420,
        stock: 7,
        lowStockThreshold: 2,
        images: [
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=85"
        ]
      },
      {
        id: "var-bag-black",
        productId: "prod-bag-1",
        sku: "ATL-SOV-BLK",
        colorName: "Midnight Noir",
        colorHex: "#09090B",
        price: 435,
        stock: 5,
        lowStockThreshold: 2,
        images: [
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=85"
        ]
      }
    ],
    tags: ["Leather", "Briefcase", "Executive", "Luxury", "Travel"],
    rating: 5,
    reviewCount: 19,
    salesCount: 41,
    isFeatured: true,
    isBestSeller: false,
    isNew: false,
    isPublished: true,
    createdAt: "2026-08-15T16:00:00Z"
  },
  {
    id: "prod-phone-1",
    name: "Zenith Pro 16 5G Titanium Edition",
    slug: "zenith-pro-16-smartphone",
    brand: "Zenith Mobile",
    categoryId: "cat-electronics",
    categoryName: "Electronics & Audio",
    basePrice: 999,
    originalPrice: 1199,
    discount: 16,
    stock: 35,
    sku: "ZEN-16P-TI",
    shortDescription: "Grade 5 titanium aerospace frame, 120Hz LTPO OLED display, and 200MP periscope optics.",
    description: "The pinnacle of mobile engineering. Powered by an ultra-efficient 3nm neural engine, all-day silicon-carbon battery, and cinematic color science tuned by legendary cinematographers.",
    features: [
      "6.7-inch Super AMOLED LTPO 1-120Hz dynamic refresh display (3000 nits peak)",
      "Triple camera system: 200MP Main + 50MP Ultra-wide + 50MP 5x Optical Periscope",
      "5,400mAh dual-cell battery with 100W Wired and 50W Wireless Fast Charging",
      "IP68 Submersible Water and Dust Resistance"
    ],
    specifications: {
      "Processor": "Neural Octa-Core 3.4GHz (3nm)",
      "RAM": "12GB / 16GB LPDDR5X",
      "Display": '6.7" 3120x1440 516 ppi',
      "Weight": "204g"
    },
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=85",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1200&q=85"
    ],
    variants: [
      {
        id: "var-phone-gray",
        productId: "prod-phone-1",
        sku: "ZEN-16P-256-GRY",
        colorName: "Natural Titanium",
        colorHex: "#71717A",
        storage: "256 GB",
        price: 999,
        stock: 18,
        lowStockThreshold: 4,
        images: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=85"
        ]
      },
      {
        id: "var-phone-blue",
        productId: "prod-phone-1",
        sku: "ZEN-16P-512-BLU",
        colorName: "Deep Cobalt",
        colorHex: "#1E3A8A",
        storage: "512 GB",
        price: 1149,
        stock: 17,
        lowStockThreshold: 3,
        images: [
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1200&q=85"
        ]
      }
    ],
    tags: ["Smartphone", "5G", "Titanium", "OLED", "Camera"],
    rating: 4.9,
    reviewCount: 88,
    salesCount: 230,
    isFeatured: true,
    isBestSeller: true,
    isNew: true,
    isPublished: true,
    createdAt: "2026-08-20T11:00:00Z"
  },
  {
    id: "prod-fan-1",
    name: "AeroBreeze Silent Vortex Table Fan",
    slug: "aerobreeze-silent-vortex-table-fan",
    brand: "AeroHome Living",
    categoryId: "cat-home",
    categoryName: "Smart Living & Climate",
    basePrice: 89,
    originalPrice: 119,
    discount: 25,
    stock: 45,
    sku: "AERO-FAN-01",
    shortDescription: "Whisper-quiet DC motor desk circulator with 3D multidirectional oscillation and magnetic remote.",
    description: "Engineered with aerodynamic bionic turbine blades that propel a concentrated column of cooling air up to 18 meters while emitting less than 21dB of acoustic murmur.",
    features: [
      "Ultra-efficient brushless DC motor with 12 micro-speed settings",
      "Dual oscillation: 90\xB0 horizontal and 85\xB0 vertical tilt",
      "Magnetic docking remote control and ambient sleep timer",
      "Energy efficient 18W power draw at maximum airflow"
    ],
    specifications: {
      "Airflow Distance": "Up to 18 meters",
      "Noise Level": "21dB - 48dB",
      "Power Consumption": "18 Watts Max",
      "Cord Length": "2.0 meters"
    },
    images: [
      "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=1200&q=85"
    ],
    variants: [
      {
        id: "var-fan-white",
        productId: "prod-fan-1",
        sku: "AERO-FAN-WHT",
        colorName: "Nordic White",
        colorHex: "#F8FAFC",
        price: 89,
        stock: 30,
        lowStockThreshold: 5,
        images: [
          "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=1200&q=85"
        ]
      },
      {
        id: "var-fan-slate",
        productId: "prod-fan-1",
        sku: "AERO-FAN-SLT",
        colorName: "Slate Charcoal",
        colorHex: "#334155",
        price: 94,
        stock: 15,
        lowStockThreshold: 4,
        images: [
          "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=1200&q=85"
        ]
      }
    ],
    tags: ["Appliances", "Fan", "Vortex", "Silent DC", "Summer"],
    rating: 4.8,
    reviewCount: 31,
    salesCount: 89,
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    isPublished: true,
    createdAt: "2026-08-22T08:00:00Z"
  },
  {
    id: "prod-mouse-1",
    name: "Viper Wireless 8K Ultra-Light Gaming Mouse",
    slug: "viper-wireless-8k-gaming-mouse",
    brand: "Lumix Labs",
    categoryId: "cat-gaming",
    categoryName: "Gaming & Workstation",
    basePrice: 129,
    originalPrice: 159,
    discount: 18,
    stock: 50,
    sku: "LMX-VIP-8K",
    shortDescription: "49-gram magnesium alloy chassis with genuine 8000Hz polling rate and 30,000 DPI optical sensor.",
    description: "Built for esports champions. Eliminates every fraction of a millisecond of latency with optical microswitches rated for 90 million clicks and zero-drag pure virgin PTFE skates.",
    features: [
      "Sub-50g featherlight skeleton alloy shell",
      "True 8000Hz hyper-polling wireless dongle included",
      "Optical switch actuation (0.2ms latency, zero debounce delay)",
      "Up to 80 hours battery on 1000Hz / 24 hours on 8000Hz"
    ],
    specifications: {
      "Sensor": "PAW3395 30K Optical Sensor",
      "Max Acceleration": "50G",
      "Tracking Speed": "650 IPS",
      "Weight": "49 grams"
    },
    images: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1200&q=85",
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1200&q=85"
    ],
    variants: [
      {
        id: "var-mouse-black",
        productId: "prod-mouse-1",
        sku: "LMX-VIP-BLK",
        colorName: "Shadow Black",
        colorHex: "#18181B",
        price: 129,
        stock: 32,
        lowStockThreshold: 5,
        images: [
          "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1200&q=85"
        ]
      },
      {
        id: "var-mouse-white",
        productId: "prod-mouse-1",
        sku: "LMX-VIP-WHT",
        colorName: "Ghost White",
        colorHex: "#F8FAFC",
        price: 129,
        stock: 18,
        lowStockThreshold: 4,
        images: [
          "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1200&q=85"
        ]
      }
    ],
    tags: ["Gaming", "Mouse", "8KHz", "Esports", "Ultralight"],
    rating: 4.9,
    reviewCount: 44,
    salesCount: 112,
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    isPublished: true,
    createdAt: "2026-08-25T15:00:00Z"
  },
  {
    id: "prod-jacket-1",
    name: "Nordic Technical Wool Trench Coat",
    slug: "nordic-technical-wool-trench-coat",
    brand: "Atelier Maison",
    categoryId: "cat-fashion",
    categoryName: "Luxury & Apparel",
    basePrice: 380,
    originalPrice: 450,
    discount: 15,
    stock: 22,
    sku: "ATL-TRENCH-01",
    shortDescription: "Water-repellent double-faced Merino wool trench coat with magnetic collar closure and silk lining.",
    description: "The epitome of architectural winter fashion. Woven from superfine 18.5-micron Australian merino wool treated with a non-toxic fluorocarbon-free hydrophobic finish.",
    features: [
      "100% Superfine Australian Merino wool shell (650 gsm)",
      "Water and wind resistant breathable membrane",
      "Concealed horn buttons and storm welt pockets",
      "Tailored articulated sleeves for seamless range of motion"
    ],
    specifications: {
      "Material": "100% Merino Wool, 100% Cupro Lining",
      "Care": "Specialist Dry Clean Only",
      "Fit": "Contemporary Tailored Relaxed",
      "Length": "Mid-calf (112cm)"
    },
    images: [
      "https://images.unsplash.com/photo-1539533018447-63fcce667883?w=1200&q=85",
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=1200&q=85"
    ],
    variants: [
      {
        id: "var-coat-camel",
        productId: "prod-jacket-1",
        sku: "ATL-TRN-CML-M",
        colorName: "Heritage Camel",
        colorHex: "#B45309",
        size: "Medium",
        price: 380,
        stock: 12,
        lowStockThreshold: 3,
        images: [
          "https://images.unsplash.com/photo-1539533018447-63fcce667883?w=1200&q=85"
        ]
      },
      {
        id: "var-coat-charcoal",
        productId: "prod-jacket-1",
        sku: "ATL-TRN-CHR-L",
        colorName: "Charcoal M\xE9lange",
        colorHex: "#374151",
        size: "Large",
        price: 380,
        stock: 10,
        lowStockThreshold: 3,
        images: [
          "https://images.unsplash.com/photo-1544441893-675973e31985?w=1200&q=85"
        ]
      }
    ],
    tags: ["Apparel", "Wool", "Coat", "Winter", "Luxury"],
    rating: 4.8,
    reviewCount: 22,
    salesCount: 56,
    isFeatured: true,
    isBestSeller: false,
    isNew: true,
    isPublished: true,
    createdAt: "2026-08-28T18:00:00Z"
  },
  {
    id: "prod-speaker-1",
    name: "Aura High-Fidelity Smart Ambient Speaker",
    slug: "aura-smart-ambient-speaker",
    brand: "Novasound",
    categoryId: "cat-smart-devices",
    categoryName: "Smart Devices & IoT",
    basePrice: 249,
    originalPrice: 299,
    discount: 16,
    stock: 25,
    sku: "NOV-AURA-01",
    shortDescription: "Omnidirectional 360\xB0 acoustic sound with glass ambient lighting and AirPlay 2 / Spotify Connect.",
    description: "Fills any architectural room with warm, spatial acoustics. Hand-blown acoustic glass resonance chamber with adjustable rhythmic twilight illumination.",
    features: [
      "360-degree omnidirectional acoustic diffusion wave",
      "True lossless Wi-Fi streaming via AirPlay 2, Tidal Connect & Spotify Connect",
      "Integrated tactile brass touch rings and glass dimming dial",
      "Room-calibrating DSP algorithm that analyzes room reflections in real time"
    ],
    specifications: {
      "Amplifier Power": "65W Class-D Tri-Amp",
      "Connectivity": "Wi-Fi 6, Bluetooth 5.3, Optical 3.5mm Aux",
      "Dimensions": "190mm x 260mm",
      "Weight": "2.6 kg"
    },
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1200&q=85"
    ],
    variants: [
      {
        id: "var-speaker-clear",
        productId: "prod-speaker-1",
        sku: "NOV-AURA-CLR",
        colorName: "Crystal Clear",
        colorHex: "#E2E8F0",
        price: 249,
        stock: 15,
        lowStockThreshold: 4,
        images: [
          "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1200&q=85"
        ]
      },
      {
        id: "var-speaker-smoke",
        productId: "prod-speaker-1",
        sku: "NOV-AURA-SMK",
        colorName: "Smoked Obsidian",
        colorHex: "#1E293B",
        price: 259,
        stock: 10,
        lowStockThreshold: 3,
        images: [
          "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1200&q=85"
        ]
      }
    ],
    tags: ["Smart Speaker", "HiFi", "AirPlay", "Lighting", "Audio"],
    rating: 4.9,
    reviewCount: 38,
    salesCount: 82,
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    isPublished: true,
    createdAt: "2026-09-01T10:00:00Z"
  },
  {
    id: "prod-skincare-1",
    name: "Botanical Radiance Cellular Recovery Serum",
    slug: "botanical-radiance-cellular-serum",
    brand: "Flora Botanica",
    categoryId: "cat-beauty",
    categoryName: "Grooming & Skincare",
    basePrice: 78,
    originalPrice: 95,
    discount: 17,
    stock: 60,
    sku: "FLR-SERUM-50",
    shortDescription: "Bio-fermented peptide serum with concentrated niacinamide and botanical squalane for deep cellular renewal.",
    description: "Dermatologist tested and clinical grade. Enhances collagen synthesis and barrier resilience while diminishing fine lines and environmental hyperpigmentation.",
    features: [
      "10% Quad-Peptide Complex with Multi-molecular Hyaluronic Acid",
      "100% vegan, cruelty-free, fragrance-free, non-comedogenic",
      "Amber UV-protected pharmaceutical glass bottle with precision dropper",
      "Clinically shown to boost hydration by 142% within 2 hours"
    ],
    specifications: {
      "Volume": "50ml / 1.7 fl oz",
      "Skin Type": "All skin types, sensitive safe",
      "Application": "Morning and Night after cleansing",
      "Formulation": "Lightweight silky watery essence"
    },
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200&q=85",
      "https://images.unsplash.com/photo-1608248597359-5561a0f8bfb2?w=1200&q=85"
    ],
    variants: [
      {
        id: "var-serum-50",
        productId: "prod-skincare-1",
        sku: "FLR-SERUM-50ML",
        colorName: "Standard Bottle",
        colorHex: "#D97706",
        storage: "50 ml",
        price: 78,
        stock: 40,
        lowStockThreshold: 8,
        images: [
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200&q=85"
        ]
      },
      {
        id: "var-serum-100",
        productId: "prod-skincare-1",
        sku: "FLR-SERUM-100ML",
        colorName: "Value Duo Size",
        colorHex: "#B45309",
        storage: "100 ml",
        price: 128,
        stock: 20,
        lowStockThreshold: 5,
        images: [
          "https://images.unsplash.com/photo-1608248597359-5561a0f8bfb2?w=1200&q=85"
        ]
      }
    ],
    tags: ["Skincare", "Serum", "Peptides", "Anti-Aging", "Clean Beauty"],
    rating: 4.9,
    reviewCount: 57,
    salesCount: 175,
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    isPublished: true,
    createdAt: "2026-09-03T11:20:00Z"
  },
  {
    id: "prod-controller-1",
    name: "Vortex Elite Wireless Pro Controller",
    slug: "vortex-elite-pro-controller",
    brand: "Lumix Labs",
    categoryId: "cat-gaming",
    categoryName: "Gaming & Workstation",
    basePrice: 169,
    originalPrice: 199,
    discount: 15,
    stock: 30,
    sku: "LMX-CTRL-01",
    shortDescription: "Hall-effect magnetic thumbsticks with anti-drift guarantee, interchangeable paddles, and tactile triggers.",
    description: "Precision engineered for competitive supremacy. Features contactless hall-effect electromagnetic joysticks that never develop stick drift, instant hair-trigger locks, and textured rubberized grips.",
    features: [
      "Hall Effect sensor joysticks and triggers with zero deadzone drift",
      "4 customizable rear ergonomic aluminum paddles",
      "Adjustable 3-way hair trigger locks for instant rapid-fire response",
      "Compatible with PC, Mac, iOS, Android, and consoles"
    ],
    specifications: {
      "Connectivity": "2.4GHz Dongle, Bluetooth 5.3, USB-C 1000Hz polling",
      "Battery": "1200mAh Lithium Ion (30+ hours per charge)",
      "Weight": "280 grams"
    },
    images: [
      "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=1200&q=85"
    ],
    variants: [
      {
        id: "var-ctrl-white",
        productId: "prod-controller-1",
        sku: "LMX-CTRL-WHT",
        colorName: "Arctic Frost",
        colorHex: "#E2E8F0",
        price: 169,
        stock: 18,
        lowStockThreshold: 4,
        images: [
          "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=1200&q=85"
        ]
      },
      {
        id: "var-ctrl-black",
        productId: "prod-controller-1",
        sku: "LMX-CTRL-BLK",
        colorName: "Midnight Stealth",
        colorHex: "#0F172A",
        price: 169,
        stock: 12,
        lowStockThreshold: 3,
        images: [
          "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=1200&q=85"
        ]
      }
    ],
    tags: ["Gaming", "Controller", "Hall Effect", "Esports", "PC Gaming"],
    rating: 4.8,
    reviewCount: 26,
    salesCount: 68,
    isFeatured: true,
    isBestSeller: false,
    isNew: true,
    isPublished: true,
    createdAt: "2026-09-05T13:40:00Z"
  }
];
var INITIAL_COUPONS = [
  {
    id: "coup-save10",
    code: "SAVE10",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderValue: 50,
    maxDiscount: 50,
    expiryDate: "2027-12-31T23:59:59Z",
    usageLimit: 1e3,
    usedCount: 142,
    isActive: true
  },
  {
    id: "coup-novavip",
    code: "NOVAVIP",
    discountType: "FIXED",
    discountValue: 40,
    minOrderValue: 200,
    expiryDate: "2027-12-31T23:59:59Z",
    usageLimit: 500,
    usedCount: 78,
    isActive: true
  },
  {
    id: "coup-welcome20",
    code: "WELCOME20",
    discountType: "PERCENTAGE",
    discountValue: 20,
    minOrderValue: 100,
    maxDiscount: 60,
    expiryDate: "2027-12-31T23:59:59Z",
    usageLimit: 2e3,
    usedCount: 310,
    isActive: true
  }
];
var INITIAL_REVIEWS = [
  {
    id: "rev-1",
    productId: "prod-headphones-1",
    customerName: "Marcus Vance",
    customerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80",
    rating: 5,
    title: "Unbelievable acoustic soundstage and ANC",
    comment: "The instrument separation on these headphones rivals open-back planar monitors, but with stellar noise cancellation. Build quality feels every bit as premium as an Apple or B&O device. Battery life is astounding.",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"],
    isVerifiedPurchase: true,
    isApproved: true,
    createdAt: "2026-08-20T14:22:00Z"
  },
  {
    id: "rev-2",
    productId: "prod-headphones-1",
    customerName: "Elena Rostova",
    customerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
    rating: 5,
    title: "Pure perfection for frequent flights",
    comment: "Cuts out cabin engine rumble effortlessly. The memory foam earcups never put uncomfortable pressure on my glasses. 10/10 recommendation.",
    images: [],
    isVerifiedPurchase: true,
    isApproved: true,
    createdAt: "2026-08-24T18:10:00Z"
  },
  {
    id: "rev-3",
    productId: "prod-keyboard-1",
    customerName: "David Chen",
    customerAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&q=80",
    rating: 5,
    title: 'The acoustic "thock" sound right out of the box',
    comment: "No modding needed whatsoever. Factory lubed switches are buttery smooth and the solid aluminum chassis weighs nearly a full kilogram. The volume knob is super crisp.",
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80"],
    isVerifiedPurchase: true,
    isApproved: true,
    createdAt: "2026-08-28T09:45:00Z"
  },
  {
    id: "rev-4",
    productId: "prod-shoes-1",
    customerName: "Sarah Jenkins",
    customerAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&q=80",
    rating: 5,
    title: "Shaved 45 seconds off my 10K split",
    comment: "The carbon propulsion is noticeable from the first stride. Snug midfoot lockdown with plenty of room in the toe box. Plus the crimson volt colorway looks killer in person.",
    images: [],
    isVerifiedPurchase: true,
    isApproved: true,
    createdAt: "2026-09-02T16:30:00Z"
  }
];
var INITIAL_ORDERS = [
  {
    id: "ord-1001",
    orderNumber: "NC-2026-8901",
    userId: "usr-customer-1",
    customerName: "Alexander Hayes",
    customerEmail: "alex.hayes@example.com",
    customerPhone: "+1 (555) 234-5678",
    shippingAddress: {
      fullName: "Alexander Hayes",
      phone: "+1 (555) 234-5678",
      street: "742 Evergreen Terrace, Suite 4B",
      city: "Seattle",
      area: "Downtown",
      postalCode: "98101"
    },
    deliveryNote: "Please leave at the front reception if unattended.",
    items: [
      {
        id: "item-101",
        productId: "prod-headphones-1",
        productName: "Nova Pro Active Noise-Cancelling Headphones",
        productSlug: "nova-pro-wireless-headphones",
        productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
        variantId: "var-hp-black",
        variantSku: "NOV-AUD-01-BLK",
        variantColor: "Space Black",
        price: 349,
        quantity: 1,
        total: 349
      },
      {
        id: "item-102",
        productId: "prod-mouse-1",
        productName: "Viper Wireless 8K Ultra-Light Gaming Mouse",
        productSlug: "viper-wireless-8k-gaming-mouse",
        productImage: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80",
        variantId: "var-mouse-black",
        variantSku: "LMX-VIP-BLK",
        variantColor: "Shadow Black",
        price: 129,
        quantity: 1,
        total: 129
      }
    ],
    subtotal: 478,
    discount: 47.8,
    couponCode: "SAVE10",
    shippingFee: 0,
    tax: 34.42,
    total: 464.62,
    paymentMethod: "CARD",
    paymentStatus: "PAID",
    orderStatus: "DELIVERED",
    trackingNumber: "NV-98234176-US",
    timeline: [
      {
        status: "PENDING",
        title: "Order Placed",
        timestamp: "2026-08-28T10:14:00Z",
        note: "Payment authorized via Visa ending in 4242."
      },
      {
        status: "CONFIRMED",
        title: "Order Verified",
        timestamp: "2026-08-28T10:30:00Z",
        note: "Inventory allocated and packed at Central Distribution Hub."
      },
      {
        status: "SHIPPED",
        title: "Dispatched with Courier",
        timestamp: "2026-08-29T08:00:00Z",
        note: "Handed over to FedEx Priority Express."
      },
      {
        status: "DELIVERED",
        title: "Package Delivered",
        timestamp: "2026-08-30T14:45:00Z",
        note: "Signed by recipient: A. Hayes."
      }
    ],
    createdAt: "2026-08-28T10:14:00Z"
  },
  {
    id: "ord-1002",
    orderNumber: "NC-2026-8902",
    userId: "usr-customer-2",
    customerName: "Sophia Lin",
    customerEmail: "sophia.lin@example.com",
    customerPhone: "+1 (555) 876-5432",
    shippingAddress: {
      fullName: "Sophia Lin",
      phone: "+1 (555) 876-5432",
      street: "1200 Grand Avenue, Apt 18E",
      city: "San Francisco",
      area: "South of Market",
      postalCode: "94103"
    },
    items: [
      {
        id: "item-103",
        productId: "prod-shoes-1",
        productName: "Apex Aero Knit Velocity Runner",
        productSlug: "apex-aero-knit-runner",
        productImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
        variantId: "var-shoes-red",
        variantSku: "AERO-RUN-RED-9",
        variantColor: "Crimson Volt",
        variantSize: "US 9",
        price: 189,
        quantity: 1,
        total: 189
      }
    ],
    subtotal: 189,
    discount: 0,
    shippingFee: 0,
    tax: 15.12,
    total: 204.12,
    paymentMethod: "CARD",
    paymentStatus: "PAID",
    orderStatus: "SHIPPED",
    trackingNumber: "NV-48190234-US",
    timeline: [
      {
        status: "PENDING",
        title: "Order Placed",
        timestamp: "2026-09-10T11:00:00Z",
        note: "Payment processed successfully."
      },
      {
        status: "CONFIRMED",
        title: "Order Confirmed",
        timestamp: "2026-09-10T12:00:00Z",
        note: "Order prepared for shipping."
      },
      {
        status: "SHIPPED",
        title: "In Transit",
        timestamp: "2026-09-11T09:30:00Z",
        note: "In transit to Northern California sorting facility."
      }
    ],
    createdAt: "2026-09-10T11:00:00Z"
  }
];
var INITIAL_USERS = [
  {
    id: "usr-admin-1",
    name: "bdneeds Executive Admin",
    email: "admin@bdneeds.com.bd",
    password: "admin123",
    role: "ADMIN",
    phone: "+1 (555) 000-1111",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80",
    createdAt: "2026-01-01T00:00:00Z"
  },
  {
    id: "usr-customer-1",
    name: "Alexander Hayes",
    email: "alex.hayes@example.com",
    password: "customer123",
    role: "CUSTOMER",
    phone: "+1 (555) 234-5678",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80",
    createdAt: "2026-08-01T10:00:00Z"
  },
  {
    id: "usr-customer-2",
    name: "Sophia Lin",
    email: "sophia.lin@example.com",
    password: "customer123",
    role: "CUSTOMER",
    phone: "+1 (555) 876-5432",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
    createdAt: "2026-08-15T12:00:00Z"
  }
];

// prisma/seed.ts
function loadProjectEnv() {
  const projectRoot = import_path.default.resolve(__dirname, "..");
  const envPath = import_path.default.join(projectRoot, ".env");
  if (!import_fs.default.existsSync(envPath)) {
    console.warn(`[seed] .env not found at ${envPath}`);
    return;
  }
  const content = import_fs.default.readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    } else {
      const hashIndex = value.indexOf(" #");
      if (hashIndex !== -1) value = value.slice(0, hashIndex).trim();
    }
    process.env[key] = value;
  }
  console.log(`[seed] Loaded environment from ${envPath}`);
}
loadProjectEnv();
if (!process.env.DATABASE_URL) {
  console.error("[seed] DATABASE_URL is missing. Add it to the project .env file.");
  process.exit(1);
}
var prisma = new import_client.PrismaClient();
async function main() {
  console.log("Seeding database...");
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();
  for (const user of INITIAL_USERS) {
    const rawPassword = user.password || "password";
    const hashedPassword = await bcryptjs_default.hash(rawPassword, 10);
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt ? new Date(user.createdAt) : void 0
      }
    });
  }
  for (const cat of INITIAL_CATEGORIES) {
    await prisma.category.create({
      data: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        icon: cat.icon,
        productCount: cat.productCount,
        isActive: cat.isActive,
        isFeatured: cat.isFeatured,
        order: cat.order
      }
    });
  }
  for (const banner of INITIAL_BANNERS) {
    await prisma.banner.create({
      data: {
        id: banner.id,
        title: banner.title,
        subtitle: banner.subtitle,
        badge: banner.badge,
        description: banner.description,
        price: banner.price,
        discount: banner.discount,
        image: banner.image,
        ctaText: banner.ctaText,
        ctaLink: banner.ctaLink,
        isActive: banner.isActive,
        order: banner.order
      }
    });
  }
  for (const coupon of INITIAL_COUPONS) {
    await prisma.coupon.create({
      data: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType === "PERCENTAGE" ? "PERCENTAGE" : "FIXED",
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount,
        expiryDate: coupon.validUntil ? new Date(coupon.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
        isActive: coupon.isActive,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount
      }
    });
  }
  for (const prod of INITIAL_PRODUCTS) {
    const createdProduct = await prisma.product.create({
      data: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        brand: prod.brand,
        categoryId: prod.categoryId,
        categoryName: prod.categoryName,
        basePrice: prod.basePrice,
        originalPrice: prod.originalPrice,
        discount: prod.discount,
        stock: prod.stock,
        sku: prod.sku,
        shortDescription: prod.shortDescription,
        description: prod.description,
        features: prod.features,
        specifications: prod.specifications,
        images: prod.images,
        tags: prod.tags,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        salesCount: prod.salesCount,
        isFeatured: prod.isFeatured,
        isBestSeller: prod.isBestSeller,
        isNew: prod.isNew,
        isPublished: prod.isPublished,
        createdAt: prod.createdAt ? new Date(prod.createdAt) : void 0
      }
    });
    if (prod.variants && prod.variants.length > 0) {
      for (const variant of prod.variants) {
        await prisma.productVariant.create({
          data: {
            id: variant.id,
            productId: createdProduct.id,
            sku: variant.sku,
            colorName: variant.colorName,
            colorHex: variant.colorHex,
            size: variant.size,
            storage: variant.storage,
            price: variant.price,
            stock: variant.stock,
            lowStockThreshold: variant.lowStockThreshold,
            images: variant.images
          }
        });
      }
    }
  }
  for (const ord of INITIAL_ORDERS) {
    const createdOrder = await prisma.order.create({
      data: {
        id: ord.id,
        orderNumber: ord.orderNumber,
        userId: ord.userId,
        customerName: ord.customerName,
        customerEmail: ord.customerEmail,
        customerPhone: ord.customerPhone,
        shippingAddress: ord.shippingAddress,
        deliveryNote: ord.deliveryNote,
        subtotal: ord.subtotal,
        discount: ord.discount,
        couponCode: ord.couponCode,
        shippingFee: ord.shippingFee,
        tax: ord.tax,
        total: ord.total,
        paymentMethod: ord.paymentMethod === "COD" ? "COD" : "CARD",
        paymentStatus: ord.paymentStatus === "PAID" ? "PAID" : "PENDING",
        orderStatus: ord.orderStatus === "DELIVERED" ? "DELIVERED" : "PENDING",
        trackingNumber: ord.trackingNumber,
        timeline: ord.timeline,
        createdAt: ord.createdAt ? new Date(ord.createdAt) : void 0
      }
    });
    if (ord.items && ord.items.length > 0) {
      for (const item of ord.items) {
        await prisma.orderItem.create({
          data: {
            id: item.id,
            orderId: createdOrder.id,
            productId: item.productId,
            productName: item.productName,
            productSlug: item.productSlug,
            productImage: item.productImage,
            variantId: item.variantId,
            variantSku: item.variantSku,
            variantColor: item.variantColor,
            variantSize: item.variantSize,
            variantStorage: item.variantStorage,
            price: item.price,
            quantity: item.quantity,
            total: item.total
          }
        });
      }
    }
  }
  for (const review of INITIAL_REVIEWS) {
    await prisma.review.create({
      data: {
        id: review.id,
        productId: review.productId,
        userId: review.userId,
        customerName: review.customerName,
        customerAvatar: review.customerAvatar,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: review.images,
        isVerifiedPurchase: review.isVerifiedPurchase,
        isApproved: review.isApproved,
        createdAt: review.createdAt ? new Date(review.createdAt) : void 0
      }
    });
  }
  console.log("Database seeded successfully!");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
