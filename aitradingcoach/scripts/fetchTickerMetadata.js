"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAndStoreTickerMetadata = fetchAndStoreTickerMetadata;
require("dotenv/config");
var node_fetch_1 = require("node-fetch");
var supabase_js_1 = require("@supabase/supabase-js");
console.log("Script started with limit:", process.argv[2]);
var SUPABASE_URL = process.env.SUPABASE_URL;
var SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
var POLYGON_API_KEY = process.env.POLYGON_API_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment.');
}
var supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_KEY);
// Helper to delay for throttling
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
/**
 * Fetches ticker metadata from Polygon.io fundamentals endpoint and upserts into Supabase.
 */
function fetchAndStoreTickerMetadata() {
    return __awaiter(this, arguments, void 0, function (limit) {
        var res, _a, _b, _c, json, results, next_url, fetched, _i, _d, t, uniqueResults, i, ticker, detailUrl, res_1, detailData, d, err_1, error;
        var _e, _f, _g, _h, _j, _k, _l, _m;
        if (limit === void 0) { limit = 1000; }
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    console.log("Fetching tickers from Polygon...");
                    return [4 /*yield*/, (0, node_fetch_1.default)("https://api.polygon.io/v3/reference/tickers?limit=".concat(limit, "&apiKey=").concat(process.env.POLYGON_API_KEY))];
                case 1:
                    res = _o.sent();
                    if (!!res.ok) return [3 /*break*/, 3];
                    _b = (_a = console).error;
                    _c = ["Failed to fetch tickers:", res.status];
                    return [4 /*yield*/, res.text()];
                case 2:
                    _b.apply(_a, _c.concat([_o.sent()]));
                    return [2 /*return*/];
                case 3: return [4 /*yield*/, res.json()];
                case 4:
                    json = _o.sent();
                    console.log("Got tickers:", (_e = json.results) === null || _e === void 0 ? void 0 : _e.length);
                    results = [];
                    next_url = null;
                    fetched = 0;
                    // Use the first page from json
                    if (json.results) {
                        for (_i = 0, _d = json.results; _i < _d.length; _i++) {
                            t = _d[_i];
                            results.push({
                                ticker: t.ticker,
                                name: (_f = t.name) !== null && _f !== void 0 ? _f : null,
                                primary_exchange: (_g = t.primary_exchange) !== null && _g !== void 0 ? _g : null,
                                market_cap: null, // Will be filled in by detail fetch
                                share_class_shares_outstanding: null, // Will be filled in by detail fetch
                                weighted_shares_outstanding: null, // Will be filled in by detail fetch
                                avg_volume_10d: null, // Will be filled in by detail fetch
                                updated_at: (_h = t.updated_utc) !== null && _h !== void 0 ? _h : new Date().toISOString(),
                            });
                            fetched++;
                            if (fetched >= limit)
                                break;
                        }
                        next_url = json.next_url ? "".concat(json.next_url, "&apiKey=").concat(process.env.POLYGON_API_KEY) : null;
                    }
                    uniqueResults = Array.from(new Map(results.map(function (item) { return [item.ticker, item]; })).values());
                    i = 0;
                    _o.label = 5;
                case 5:
                    if (!(i < uniqueResults.length)) return [3 /*break*/, 14];
                    ticker = uniqueResults[i].ticker;
                    detailUrl = "https://api.polygon.io/v3/reference/tickers/".concat(ticker, "?apiKey=").concat(POLYGON_API_KEY);
                    _o.label = 6;
                case 6:
                    _o.trys.push([6, 10, , 11]);
                    return [4 /*yield*/, (0, node_fetch_1.default)(detailUrl)];
                case 7:
                    res_1 = _o.sent();
                    if (!res_1.ok) return [3 /*break*/, 9];
                    return [4 /*yield*/, res_1.json()];
                case 8:
                    detailData = _o.sent();
                    d = detailData.results;
                    uniqueResults[i].market_cap = (_j = d.market_cap) !== null && _j !== void 0 ? _j : null;
                    uniqueResults[i].share_class_shares_outstanding = (_k = d.share_class_shares_outstanding) !== null && _k !== void 0 ? _k : null;
                    uniqueResults[i].weighted_shares_outstanding = (_l = d.weighted_shares_outstanding) !== null && _l !== void 0 ? _l : null;
                    uniqueResults[i].avg_volume_10d = (_m = d.avg_volume_10d) !== null && _m !== void 0 ? _m : null;
                    _o.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    err_1 = _o.sent();
                    console.error("Error fetching details for ".concat(ticker, ":"), err_1);
                    return [3 /*break*/, 11];
                case 11:
                    if (!(i % 3 === 2)) return [3 /*break*/, 13];
                    return [4 /*yield*/, delay(1000)];
                case 12:
                    _o.sent();
                    _o.label = 13;
                case 13:
                    i++;
                    return [3 /*break*/, 5];
                case 14: return [4 /*yield*/, supabase
                        .from('ticker_metadata')
                        .upsert(uniqueResults, { onConflict: 'ticker' })];
                case 15:
                    error = (_o.sent()).error;
                    if (error)
                        throw error;
                    console.log("Upserted ".concat(uniqueResults.length, " ticker metadata records to ticker_metadata."));
                    return [2 /*return*/, uniqueResults];
            }
        });
    });
}
// CLI entry point
if (require.main === module) {
    fetchAndStoreTickerMetadata()
        .catch(function (err) {
        console.error('Error:', err);
        process.exit(1);
    });
}
/**
 * If the ticker_metadata table does not exist, create it in Supabase with:
 *
 * CREATE TABLE ticker_metadata (
 *   ticker text PRIMARY KEY,
 *   name text,
 *   primary_exchange text,
 *   market_cap bigint,
 *   share_class_shares_outstanding bigint,
 *   weighted_shares_outstanding bigint,
 *   avg_volume_10d numeric,
 *   updated_at timestamp
 * );
 *
 * You can run this SQL in the Supabase SQL editor.
 */ 
