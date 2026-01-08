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
var generateIdeaBatch = require('./src/lib/ideaEngine').generateIdeaBatch;
// Mock NICHES and other deps if needed, or rely on them being present if valid JS.
// Since ideaEngine uses import/export, we might need to use ts-node or just run it as a module if possible.
// Actually, let's just make this a TS file and try to run it with ts-node if available, or just use a simple JS test that copies the logic if needed.
// Better: create a test file in the project and run it.
function verify() {
    return __awaiter(this, void 0, void 0, function () {
        var batch, titles, unique, seen_1;
        return __generator(this, function (_a) {
            console.log("Starting verification...");
            batch = generateIdeaBatch(25, 'SaaS');
            titles = batch.map(function (i) { return i.title; });
            unique = new Set(titles);
            console.log("Generated ".concat(batch.length, " ideas."));
            console.log("Unique titles: ".concat(unique.size));
            if (unique.size === batch.length) {
                console.log("SUCCESS: All ideas are unique!");
            }
            else {
                console.log("FAILURE: Found duplicates.");
                console.log("Duplicates:");
                seen_1 = new Set();
                titles.forEach(function (t) {
                    if (seen_1.has(t))
                        console.log(" - ".concat(t));
                    seen_1.add(t);
                });
            }
            return [2 /*return*/];
        });
    });
}
verify();
